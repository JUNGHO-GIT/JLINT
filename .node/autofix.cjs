// autofix.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);
const { Project } = require(`ts-morph`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const isFix = argv.includes(`--fix`);
const LINE_REGEX = /^(?<file>.+):(?<line>\d+)\s*-\s*(?<name>.+?)(?:\s*\((?<note>.+)\))?$/;

// 로깅 함수 -----------------------------------------------------------------------------------
const logger = (type = ``, ...args) => {
	const format = (text = ``) => text.trim().replace(/^\s+/gm, ``);
	const line = `----------------------------------------`;
	const colors = {
		"line": `\x1b[38;5;214m`,
		"info": `\x1b[36m`,
		"success": `\x1b[32m`,
		"warn": `\x1b[33m`,
		"error": `\x1b[31m`,
		"reset": `\x1b[0m`
	};
	const separator = `${colors.line}${line}${colors.reset}`;
	const message = String(args[0] || ``);

	(type === `info`) ? (
		console.log(format(`
			${separator}
			${colors.info}[INFO]${colors.reset} - ${message}
		`))
	) : (type === `success`) ? (
		console.log(format(`
			${separator}
			${colors.success}[SUCCESS]${colors.reset} - ${message}
		`))
	) : (type === `warn`) ? (
		console.log(format(`
			${separator}
			${colors.warn}[WARN]${colors.reset} - ${message}
		`))
	) : (type === `error`) ? (
		console.log(format(`
			${separator}
			${colors.error}[ERROR]${colors.reset} - ${message}
		`))
	) : (
		void 0
	);
};

// 명령 실행 함수 ------------------------------------------------------------------------------
const run = (cmd = ``, args = []) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: true,
		env: process.env
	});

	(result.status !== 0) ? (
		logger(`error`, `${cmd} 실패 (exit code: ${result.status})`),
		process.exit(result.status || 1)
	) : (
		logger(`success`, `${cmd} 실행 완료`)
	);
};


// 유틸리티 함수 -------------------------------------------------------------------------------
const withLocalBinOnPath = (env = {}) => {
	const binDir = path.join(process.cwd(), `node_modules`, `.bin`);
	const envPath = (env.PATH || env.Path || ``);
	const pathParts = envPath.split(path.delimiter).filter(Boolean);
	(!pathParts.includes(binDir)) ? pathParts.unshift(binDir) : void 0;

	const newEnv = ({ ...env });
	(process.platform === `win32`) ? (
		newEnv.Path = pathParts.join(path.delimiter)
	) : (
		newEnv.PATH = pathParts.join(path.delimiter)
	);
	return newEnv;
};

const trySpawn = (cmd = ``, args = []) => {
	const options = { encoding: `utf8`, env: withLocalBinOnPath(process.env) };
	const result = spawnSync(cmd, args, options);
	return result;
};

// -----------------------------------------------------------------------------------------------
const resolveTsPruneBinJs = () => {
	logger(`info`, `ts-prune 바이너리 경로 해석 시도`);

	try {
		const packagePath = require.resolve(`ts-prune/package.json`, { paths: [process.cwd()] });
		const packageDir = path.dirname(packagePath);
		const packageJson = JSON.parse(fs.readFileSync(packagePath, `utf8`));

		const binRelative = (typeof packageJson.bin === `string`) ? (
			packageJson.bin
		) : (packageJson.bin && typeof packageJson.bin === `object`) ? (
			(packageJson.bin[`ts-prune`]) ? (
				packageJson.bin[`ts-prune`]
			) : (() => {
				const keys = Object.keys(packageJson.bin);
				return (keys.length > 0) ? packageJson.bin[keys[0]] : null;
			})()
		) : (
			null
		);

		return (!binRelative) ? (
			logger(`warn`, `package.json에서 bin 정보를 찾을 수 없음`),
			null
		) : (() => {
			const binAbsolute = path.resolve(packageDir, binRelative);
			const exists = fs.existsSync(binAbsolute);
			return (
				logger(`info`, `바이너리 경로: ${binAbsolute}, 존재: ${exists}`),
				exists ? binAbsolute : null
			);
		})();
	}
	catch (error) {
		logger(`error`, `ts-prune 패키지 해석 실패: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
};

// ts-prune 실행 ------------------------------------------------------------------------------
const runTsPrune = () => {
	logger(`info`, `ts-prune 실행 시작`);

	const cliArgs = [`-p`, `tsconfig.json`];
	logger(`info`, `ts-prune 명령행 인수: ${cliArgs.join(` `)}`);
	const errors = [];

	const binJs = resolveTsPruneBinJs();
	const binResult = (binJs) ? (() => {
		logger(`info`, `Node.js 바이너리로 ts-prune 실행 시도`);
		const result = trySpawn(process.execPath, [binJs, ...cliArgs]);
		return (!result.error) ? (() => {
			const okStatus = typeof result.status === `number` ? result.status === 0 : true;
			return (okStatus) ? (
				logger(`success`, `Node.js 바이너리 실행 성공`),
				(result.stdout || ``)
			) : (
				errors.push(`[node-bin] exited ${result.status} stdout:"${(result.stdout || ``).trim()}" stderr:"${(result.stderr || ``).trim()}"`),
				null
			);
		})() : (
			errors.push(`[node-bin] ${result.error && typeof result.error === `object` && `code` in result.error ? result.error.code : `ERR`} ${result.error ? result.error.message || `` : ``}`.trim()),
			null
		);
	})() : null;

	(binResult) ? (binResult) : (() => {
		const executionMethods = [
			{
				name: `local-bin`,
				getPath: () => path.join(process.cwd(), `node_modules`, `.bin`, process.platform === `win32` ? `ts-prune.cmd` : `ts-prune`),
				getCommand: (binPath) => [binPath, cliArgs]
			},
			{
				name: `pnpm-exec`,
				getPath: () => process.platform === `win32` ? `pnpm.cmd` : `pnpm`,
				getCommand: (cmd) => [cmd, [`exec`, `ts-prune`, ...cliArgs]]
			},
			{
				name: `npx`,
				getPath: () => process.platform === `win32` ? `npx.cmd` : `npx`,
				getCommand: (cmd) => [cmd, [`ts-prune`, ...cliArgs]]
			},
			{
				name: `path-ts-prune`,
				getPath: () => process.platform === `win32` ? `ts-prune.cmd` : `ts-prune`,
				getCommand: (cmd) => [cmd, cliArgs]
			}
		];

		for (const method of executionMethods) {
			const commandPath = method.getPath();
			const tuple = method.getCommand(commandPath);
			const cmd = (tuple[0]);
			const methodArgs = (tuple[1]);

			if (method.name === `local-bin` && !fs.existsSync(commandPath)) {
				errors.push(`[${method.name}] ${commandPath} 없음`);
				continue;
			}

			logger(`info`, `${method.name}으로 ts-prune 실행 시도`);
			const result = trySpawn(cmd, methodArgs);
			const methodResult = (!result.error) ? (() => {
				const okStatus = typeof result.status === `number` ? result.status === 0 : true;
				return (okStatus) ? (
					logger(`success`, `${method.name} 실행 성공`),
					(result.stdout || ``)
				) : (
					errors.push(`[${method.name}] exited ${result.status} stdout:"${(result.stdout || ``).trim()}" stderr:"${(result.stderr || ``).trim()}"`),
					null
				);
			})() : (
				errors.push(`[${method.name}] ${result.error && typeof result.error === `object` && `code` in result.error ? result.error.code : `ERR`} ${result.error ? result.error.message || `` : ``}`.trim()),
				null
			);

			if (methodResult) {
				return methodResult;
			}
		}

		const errorMessage = `ts-prune 실행 실패:\n${errors.map((e) => ` - ${e}`).join(`\n`)}`;
		logger(`error`, errorMessage);
		throw new Error(errorMessage);
	})();
};

// ts-prune 출력 파싱 --------------------------------------------------------------------------
const parseTsPruneOutput = (text = ``) => {
	logger(`info`, `ts-prune 출력 파싱 시작`);

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

	logger(`info`, `파싱된 항목 수: ${output.length}`);
	return output;
};

// 파일별 그룹화 -------------------------------------------------------------------------------
const groupByFile = (items = []) => {
	logger(`info`, `파일별 그룹화 시작`);

	const fileMap = new Map();
	for (const item of items) {
		(!fileMap.has(item.file)) ? fileMap.set(item.file, []) : void 0;
		fileMap.get(item.file).push(item);
	}

	logger(`info`, `그룹화된 파일 수: ${fileMap.size}`);
	return fileMap;
};

// 파일 경로 유틸리티 -------------------------------------------------------------------------
const toProjectAbsolute = (filePath = ``) => {
	const normalized = filePath.replace(/\//g, path.sep);
	const isAbsWin = /^[a-zA-Z]:[\\/]/.test(normalized) || /^\\\\/.test(normalized);
	return (isAbsWin) ? (
		normalized
	) : (
		path.resolve(process.cwd(), normalized.replace(/^[\\/]+/, ``))
	);
};

// 안전한 백업 생성 ---------------------------------------------------------------------------
const safeBackup = (filePath = ``) => {
	const backupPath = filePath + `.bak`;

	try {
		return (!fs.existsSync(filePath)) ? (
			false
		) : (
			(!fs.existsSync(backupPath)) ? fs.copyFileSync(filePath, backupPath) : void 0,
			logger(`info`, `백업 생성: ${backupPath}`),
			true
		);
	}
	catch (error) {
		logger(`warn`, `백업 실패: ${error instanceof Error ? error.message : String(error)}`);
		return false;
	}
};

// Export 제거 함수 ----------------------------------------------------------------------------
const removeNamesInExportDeclarations = (sourceFile, targetNames) => {
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
			(targetNames.has(exportedName) || targetNames.has(localName)) ? toRemove.push(spec) : void 0;
		}

		toRemove.forEach((spec) => spec.remove());
		const remaining = exportDecl.getNamedExports().length;
		const isNs = exportDecl.isNamespaceExport && exportDecl.isNamespaceExport();
		(remaining === 0 && !isNs) ? exportDecl.remove() : void 0;
	}
};

// 로컬 선언 제거 함수 ----------------------------------------------------------------------------
const removeLocalDeclarationsByNames = (sourceFile, targetNames) => {
	const variableStatements = sourceFile.getVariableStatements().filter((stmt) => stmt.hasExportKeyword());

	for (const varStmt of variableStatements) {
		const declarations = varStmt.getDeclarations();
		const toRemove = declarations.filter((decl) => targetNames.has(decl.getName()));
		if (toRemove.length === 0) {
			continue;
		}

		(toRemove.length === declarations.length) ? (
			varStmt.remove()
		) : (
			toRemove.forEach((decl) => decl.remove())
		);
	}

	const removeExportedNodes = (nodes) => {
		for (const node of nodes) {
			const nodeAny = (node);
			const nodeName = typeof nodeAny.getName === `function` ? nodeAny.getName() : null;
			(nodeName && targetNames.has(nodeName) && typeof nodeAny.hasExportKeyword === `function` && nodeAny.hasExportKeyword() && typeof nodeAny.remove === `function`) ? (
				nodeAny.remove()
			) : (
				void 0
			);
		}
	};

	removeExportedNodes(sourceFile.getFunctions());
	removeExportedNodes(sourceFile.getClasses());
	removeExportedNodes(sourceFile.getEnums());
	removeExportedNodes(sourceFile.getInterfaces());
	removeExportedNodes(sourceFile.getTypeAliases());
};

// 기본 내보내기 제거 함수 ----------------------------------------------------------------------
const removeDefaultExport = (sourceFile) => {
	const assignments = sourceFile.getExportAssignments();
	const defaultAssignment = assignments.find((assignment) => assignment.isExportEquals() === false);
	let removed = false;

	(defaultAssignment) ? (
		defaultAssignment.remove(),
		removed = true
	) : (
		void 0
	);

	const declarations = [
		...sourceFile.getFunctions(),
		...sourceFile.getClasses()
	];

	for (const decl of declarations) {
		if (decl.hasExportKeyword && decl.hasExportKeyword()) {
			const modifiers = decl.getModifiers().map((mod) => mod.getText());
			(modifiers.includes(`default`)) ? (
				decl.remove(),
				removed = true
			) : (
				void 0
			);
		}
	}

	return removed;
};

// 파일 처리 ----------------------------------------------------------------------------------
const processFile = (project, filePath = ``, names) => {
	const absolutePath = toProjectAbsolute(filePath);
	logger(`info`, `파일 처리 중: ${filePath}`);

	return (/\.d\.ts$/.test(absolutePath)) ? (
		{
			file: filePath,
			removed: [],
			skipped: true,
			reason: `declaration-file`
		}
	) : (() => {
		const sourceFile = project.getSourceFile(absolutePath) || project.addSourceFileAtPathIfExists(absolutePath);
		return (!sourceFile) ? (
			{
				file: filePath,
				removed: [],
				skipped: true,
				reason: `file-not-found`
			}
		) : (() => {
			const beforeText = sourceFile.getFullText();
			const removedSet = new Set();
			removeNamesInExportDeclarations(sourceFile, names);
			removeLocalDeclarationsByNames(sourceFile, names);
			(names.has(`default`) && removeDefaultExport(sourceFile)) ? removedSet.add(`default`) : void 0;
			names.forEach((name) => removedSet.add(name));

			const afterText = sourceFile.getFullText();
			const changed = beforeText !== afterText;

			(changed && isFix) ? (
				safeBackup(absolutePath),
				sourceFile.saveSync(),
				logger(`success`, `파일 저장 완료: ${filePath}`)
			) : (
				void 0
			);

			return {
				file: filePath,
				removed: Array.from(removedSet),
				skipped: false
			};
		})();
	})();
};

// 실행 -----------------------------------------------------------------------------------------
(() => {
	logger(`info`, `ts-prune autofix 시작 (${isFix ? `적용 모드` : `드라이런 모드`})`);

	const rawOutput = runTsPrune();
	const parsedItems = parseTsPruneOutput(rawOutput);
	const groupedByFile = groupByFile(parsedItems);

	logger(`info`, `TypeScript 프로젝트 로드`);
	const project = new Project({
		tsConfigFilePath: path.resolve(process.cwd(), `tsconfig.json`),
		skipAddingFilesFromTsConfig: false
	});

	logger(`info`, `파일 처리 시작`);
	const results = [];
	for (const entry of groupedByFile.entries()) {
		const file = entry[0];
		const items = entry[1];
		const nameSet = new Set(items.map((item) => item.name));
		const result = processFile(project, file, nameSet);
		results.push(result);
	}

	const summary = {
		apply: isFix,
		totalFiles: groupedByFile.size,
		modifiedFiles: results.filter((r) => r.removed.length > 0).length,
		skippedFiles: results.filter((r) => r.skipped).map((r) => ({
			file: r.file,
			reason: r.reason
		})),
		details: results
	};

	logger(`success`, `ts-prune autofix 완료`);
	logger(`info`, `적용 모드: ${summary.apply}`);
	logger(`info`, `후보 파일 수: ${summary.totalFiles}`);
	logger(`info`, `수정된 파일 수: ${summary.modifiedFiles}`);

	(summary.skippedFiles.length > 0) ? (
		logger(`warn`, `건너뛴 파일들:`),
		summary.skippedFiles.forEach((skipped) => logger(`warn`, `  - ${skipped.file} (${skipped.reason})`))
	) : (
		void 0
	);
})();