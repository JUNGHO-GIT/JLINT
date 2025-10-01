// autofix.cjs

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { Project } = require("ts-morph");

// ---------------------------------------------------------------------------------------------
// 로깅 유틸리티
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  step: (step, msg) => console.log(`[STEP ${step}] ${msg}`)
};

// ---------------------------------------------------------------------------------------------
const fnParseArgs = (argv) => {
  log.step(1, "명령행 인수 파싱 시작");
  const args = {
    project: "tsconfig.json",
    apply: false,
    ignore: [],
    skip: [],
    include: [],
    exclude: [],
    report: null,
    skipUsedInModule: true,
    backup: false
  };

  for (let i = 2; i < argv.length; i += 1) {
    const currentArg = argv[i];
    currentArg === "--project" ? (args.project = argv[++i]) :
    currentArg === "--apply" ? (args.apply = true) :
    currentArg === "--ignore" ? args.ignore.push(argv[++i]) :
    currentArg === "--skip" ? args.skip.push(argv[++i]) :
    currentArg === "--include" ? args.include.push(argv[++i]) :
    currentArg === "--exclude" ? args.exclude.push(argv[++i]) :
    currentArg === "--report" ? (args.report = argv[++i]) :
    currentArg === "--no-uim" ? (args.skipUsedInModule = false) :
    currentArg === "--backup" ? (args.backup = true) :
    log.warn(`알 수 없는 플래그 무시: ${currentArg}`);
  }

  log.info(`파싱된 설정: project=${args.project}, apply=${args.apply}, backup=${args.backup}`);
  return args;
};

// ---------------------------------------------------------------------------------------------
const fnWithLocalBinOnPath = (env) => {
  const binDir = path.join(process.cwd(), "node_modules", ".bin");
  const pathParts = (env.PATH || env.Path || "").split(path.delimiter).filter(Boolean);
  !pathParts.includes(binDir) && pathParts.unshift(binDir);

  const newEnv = { ...env };
  process.platform === "win32" ?
    (newEnv.Path = pathParts.join(path.delimiter)) :
    (newEnv.PATH = pathParts.join(path.delimiter));

  return newEnv;
};

// ---------------------------------------------------------------------------------------------
const fnTrySpawn = (cmd, args, opts) => {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    env: fnWithLocalBinOnPath(process.env),
    ...opts
  });
  return result;
};

// ---------------------------------------------------------------------------------------------
const fnResolveTsPruneBinJs = () => {
  log.info("ts-prune 바이너리 경로 해석 시도");
  try {
    const packagePath = require.resolve("ts-prune/package.json", { paths: [process.cwd()] });
    const packageDir = path.dirname(packagePath);
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    let binRelative = null;

    typeof packageJson.bin === "string" ? (binRelative = packageJson.bin) :
    packageJson.bin && typeof packageJson.bin === "object" ? (
      packageJson.bin["ts-prune"] ? (binRelative = packageJson.bin["ts-prune"]) :
      Object.keys(packageJson.bin).length > 0 && (binRelative = packageJson.bin[Object.keys(packageJson.bin)[0]])
    ) : null;

    if (!binRelative) {
      log.warn("package.json에서 bin 정보를 찾을 수 없음");
      return null;
    }

    const binAbsolute = path.resolve(packageDir, binRelative);
    const exists = fs.existsSync(binAbsolute);
    log.info(`바이너리 경로: ${binAbsolute}, 존재: ${exists}`);
    return exists ? binAbsolute : null;
  }
  catch (error) {
    log.error(`ts-prune 패키지 해석 실패: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// ---------------------------------------------------------------------------------------------
const fnRunTsPrune = (args) => {
  log.step(2, "ts-prune 실행 시작");
  const cliArgs = ["-p", args.project];
  args.skipUsedInModule && cliArgs.push("-u");
  args.ignore.forEach((pattern) => cliArgs.push("-i", pattern));
  args.skip.forEach((pattern) => cliArgs.push("-s", pattern));

  log.info(`ts-prune 명령행 인수: ${cliArgs.join(" ")}`);
  const errors = [];

  // 1. Node.js 바이너리로 직접 실행
  const binJs = fnResolveTsPruneBinJs();
  if (binJs) {
    log.info("Node.js 바이너리로 ts-prune 실행 시도");
    const result = fnTrySpawn(process.execPath, [binJs, ...cliArgs]);
    if (!result.error) {
      const okStatus = typeof result.status === "number" ? result.status === 0 : true;
      const hasOutput = typeof result.stdout === "string" && result.stdout.trim().length > 0;
      if (okStatus || hasOutput) {
        log.success("Node.js 바이너리 실행 성공");
        return result.stdout;
      }
      errors.push(`[node-bin] exited ${result.status} stdout:"${(result.stdout || "").trim()}" stderr:"${(result.stderr || "").trim()}"`);
    }
    else {
      const errorCode = result.error && typeof result.error === "object" && "code" in result.error ? result.error.code : "ERR";
      const errorMessage = result.error ? result.error.message || "" : "";
      errors.push(`[node-bin] ${errorCode} ${errorMessage.trim()}`);
    }
  }

  // 2-5. 다른 실행 방법들 시도
  const executionMethods = [
    {
      name: "local-bin",
      getPath: () => path.join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "ts-prune.cmd" : "ts-prune"),
      getCommand: (binPath) => [binPath, cliArgs]
    },
    {
      name: "pnpm-exec",
      getPath: () => process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      getCommand: (cmd) => [cmd, ["exec", "ts-prune", ...cliArgs]]
    },
    {
      name: "npx",
      getPath: () => process.platform === "win32" ? "npx.cmd" : "npx",
      getCommand: (cmd) => [cmd, ["ts-prune", ...cliArgs]]
    },
    {
      name: "path-ts-prune",
      getPath: () => process.platform === "win32" ? "ts-prune.cmd" : "ts-prune",
      getCommand: (cmd) => [cmd, cliArgs]
    }
  ];

  for (const method of executionMethods) {
    const commandPath = method.getPath();
    const [cmd, methodArgs] = method.getCommand(commandPath);

    if (method.name === "local-bin" && !fs.existsSync(commandPath)) {
      errors.push(`[${method.name}] ${commandPath} 없음`);
      continue;
    }

    log.info(`${method.name}으로 ts-prune 실행 시도`);
    const result = fnTrySpawn(cmd, methodArgs);
    if (!result.error) {
      const okStatus = typeof result.status === "number" ? result.status === 0 : true;
      const hasOutput = typeof result.stdout === "string" && result.stdout.trim().length > 0;
      if (okStatus || hasOutput) {
        log.success(`${method.name} 실행 성공`);
        return result.stdout;
      }
      errors.push(`[${method.name}] exited ${result.status} stdout:"${(result.stdout || "").trim()}" stderr:"${(result.stderr || "").trim()}"`);
    }
    else {
      const errorCode = result.error && typeof result.error === "object" && "code" in result.error ? result.error.code : "ERR";
      const errorMessage = result.error ? result.error.message || "" : "";
      errors.push(`[${method.name}] ${errorCode} ${errorMessage.trim()}`);
    }
  }

  const errorMessage = `ts-prune 실행 실패:\n${errors.map((e) => ` - ${e}`).join("\n")}`;
  log.error(errorMessage);
  throw new Error(errorMessage);
};

// ---------------------------------------------------------------------------------------------
// 예: "C:\proj\src\x.ts:18 - Foo" 또는 "\src\x.ts:36 - default"
const LINE_REGEX = /^(?<file>.+):(?<line>\d+)\s*-\s*(?<name>.+?)(?:\s*\((?<note>.+)\))?$/;

const fnParseTsPruneOutput = (text) => {
  log.step(3, "ts-prune 출력 파싱 시작");
  const output = [];
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }

    const match = LINE_REGEX.exec(line);
    if (!match || !match.groups) {
      continue;
    }

    const fileNormalized = path.normalize(match.groups.file);
    const symbolName = match.groups.name.trim();
    const note = match.groups.note ? match.groups.note.trim() : null;
    output.push({ file: fileNormalized, name: symbolName, note });
  }

  log.info(`파싱된 항목 수: ${output.length}`);
  return output;
};

// ---------------------------------------------------------------------------------------------
const fnFilterByPath = (items, include, exclude) => {
  log.step(4, "경로 필터링 시작");
  if (include.length === 0 && exclude.length === 0) {
    log.info("필터링 조건 없음, 모든 항목 유지");
    return items;
  }

  const includeRegexes = include.map((pattern) => new RegExp(pattern));
  const excludeRegexes = exclude.map((pattern) => new RegExp(pattern));

  const filtered = items.filter((item) => {
    const filePath = item.file;
    let allowed = includeRegexes.length === 0 ? true : includeRegexes.some((regex) => regex.test(filePath));
    return allowed && !(excludeRegexes.length > 0 && excludeRegexes.some((regex) => regex.test(filePath)));
  });

  log.info(`필터링 결과: ${items.length} -> ${filtered.length}`);
  return filtered;
};

// ---------------------------------------------------------------------------------------------
const fnGroupByFile = (items) => {
  log.step(5, "파일별 그룹화 시작");
  const fileMap = new Map();
  for (const item of items) {
    !fileMap.has(item.file) && fileMap.set(item.file, []);
    fileMap.get(item.file).push(item);
  }
  log.info(`그룹화된 파일 수: ${fileMap.size}`);
  return fileMap;
};

// ---------------------------------------------------------------------------------------------
// 프로젝트 루트 기준 절대경로 강제
const fnToProjectAbsolute = (filePath) => {
  const normalized = filePath.replace(/\//g, path.sep);
  if (/^[a-zA-Z]:[\\/]/.test(normalized) || /^\\\\/.test(normalized)) {
    return normalized;
  }
  const trimmed = normalized.replace(/^[\\/]+/, "");
  return path.resolve(process.cwd(), trimmed);
};

// ---------------------------------------------------------------------------------------------
// 백업 실패는 무시
const fnSafeBackup = (filePath) => {
  const backupPath = filePath + ".bak";
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    !fs.existsSync(backupPath) && fs.copyFileSync(filePath, backupPath);
    log.info(`백업 생성: ${backupPath}`);
    return true;
  }
  catch (error) {
    log.warn(`백업 실패: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

// ---------------------------------------------------------------------------------------------
const fnRemoveNamesInExportDeclarations = (sourceFile, targetNames) => {
  const exportDeclarations = sourceFile.getExportDeclarations();
  for (const exportDecl of exportDeclarations) {
    const specifiers = exportDecl.getNamedExports();
    if (specifiers.length === 0) {
      continue;
    }

    const toRemove = [];
    for (const spec of specifiers) {
      const localName = spec.getNameNode().getText();
      const aliasNode = spec.getAliasNode();
      const exportedName = aliasNode ? aliasNode.getText() : localName;
      if (targetNames.has(exportedName) || targetNames.has(localName)) {
        toRemove.push(spec);
      }
    }

    toRemove.forEach((spec) => spec.remove());
    if (exportDecl.getNamedExports().length === 0 && !(exportDecl.isNamespaceExport && exportDecl.isNamespaceExport())) {
      exportDecl.remove();
    }
  }
};

// ---------------------------------------------------------------------------------------------
const fnRemoveLocalDeclarationsByNames = (sourceFile, targetNames) => {
  // export const/let/var ...
  const variableStatements = sourceFile.getVariableStatements().filter((stmt) => stmt.hasExportKeyword());
  for (const varStmt of variableStatements) {
    const declarations = varStmt.getDeclarations();
    const toRemove = declarations.filter((decl) => targetNames.has(decl.getName()));
    if (toRemove.length === 0) {
      continue;
    }

    toRemove.length === declarations.length ?
      varStmt.remove() :
      toRemove.forEach((decl) => decl.remove());
  }

  // export function/class/enum/interface/type
  const removeExportedNodes = (nodes) => {
    for (const node of nodes) {
      const nodeName = node.getName ? node.getName() : null;
      nodeName && targetNames.has(nodeName) && node.hasExportKeyword && node.hasExportKeyword() && node.remove();
    }
  };

  removeExportedNodes(sourceFile.getFunctions());
  removeExportedNodes(sourceFile.getClasses());
  removeExportedNodes(sourceFile.getEnums());
  removeExportedNodes(sourceFile.getInterfaces());
  removeExportedNodes(sourceFile.getTypeAliases());
};

// ---------------------------------------------------------------------------------------------
const fnRemoveDefaultExport = (sourceFile) => {
  const assignments = sourceFile.getExportAssignments();
  const defaultAssignment = assignments.find((assignment) => assignment.isExportEquals() === false);
  if (defaultAssignment) {
    defaultAssignment.remove();
    return true;
  }

  const declarations = [
    ...sourceFile.getFunctions(),
    ...sourceFile.getClasses()
  ];

  for (const decl of declarations) {
    if (decl.hasExportKeyword && decl.hasExportKeyword()) {
      const modifiers = decl.getModifiers().map((mod) => mod.getText());
      if (modifiers.includes("default")) {
        decl.remove();
        return true;
      }
    }
  }
  return false;
};

// ---------------------------------------------------------------------------------------------
const fnProcessFile = (project, filePath, names, options) => {
  const absolutePath = fnToProjectAbsolute(filePath);
  log.info(`파일 처리 중: ${filePath}`);

  if (/\.d\.ts$/.test(absolutePath)) {
    return {
      file: filePath,
      removed: [],
      skipped: true,
      reason: "declaration-file"
    };
  }

  const sourceFile = project.getSourceFile(absolutePath) || project.addSourceFileAtPathIfExists(absolutePath);
  if (!sourceFile) {
    return {
      file: filePath,
      removed: [],
      skipped: true,
      reason: "file-not-found"
    };
  }

  const removedSet = new Set();

  // 1) re-export / named export 선언에서 specifier 삭제 (type 전용 포함)
  fnRemoveNamesInExportDeclarations(sourceFile, names);

  // 2) 로컬 export 선언 제거
  fnRemoveLocalDeclarationsByNames(sourceFile, names);

  // 3) default
  names.has("default") && fnRemoveDefaultExport(sourceFile) && removedSet.add("default");

  // 실제로 삭제된 심볼 추정: 남아있는 것 제외하고 교집합 기반 기록
  names.forEach((name) => removedSet.add(name));

  if (removedSet.size > 0 && options.apply) {
    options.backup && fnSafeBackup(absolutePath);
    sourceFile.saveSync();
    log.success(`파일 저장 완료: ${filePath}`);
  }

  return {
    file: filePath,
    removed: Array.from(removedSet),
    skipped: false
  };
};

// ---------------------------------------------------------------------------------------------
const fnMain = () => {
  log.info("=== ts-prune autofix 시작 ===");

  const args = fnParseArgs(process.argv);

  const rawOutput = fnRunTsPrune(args);
  const parsedItems = fnParseTsPruneOutput(rawOutput);

  const filteredItems = fnFilterByPath(parsedItems, args.include, args.exclude);
  const groupedByFile = fnGroupByFile(filteredItems);

  log.step(6, "TypeScript 프로젝트 로드");
  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), args.project),
    skipAddingFilesFromTsConfig: false
  });

  log.step(7, "파일 처리 시작");
  const results = [];
  for (const [file, items] of groupedByFile.entries()) {
    const nameSet = new Set(items.map((item) => item.name));
    const result = fnProcessFile(project, file, nameSet, {
      apply: args.apply,
      backup: args.backup
    });
    results.push(result);
  }

  const summary = {
    project: args.project,
    apply: args.apply,
    totalFiles: groupedByFile.size,
    modifiedFiles: results.filter((result) => result.removed.length > 0).length,
    skippedFiles: results.filter((result) => result.skipped).map((result) => ({
      file: result.file,
      reason: result.reason
    })),
    details: results
  };

  args.report && (
    log.info(`리포트 저장: ${args.report}`),
    fs.writeFileSync(args.report, JSON.stringify(summary, null, 2), "utf8")
  );

  log.success("=== ts-prune autofix 완료 ===");
  log.info(`프로젝트: ${summary.project}`);
  log.info(`적용 모드: ${summary.apply}`);
  log.info(`후보 파일 수: ${summary.totalFiles}`);
  log.info(`수정된 파일 수: ${summary.modifiedFiles}`);

  summary.skippedFiles.length > 0 && (
    log.warn("건너뛴 파일들:"),
    summary.skippedFiles.forEach((skipped) => log.warn(`  - ${skipped.file} (${skipped.reason})`))
  );
};

fnMain();
