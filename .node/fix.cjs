/**
 * @file fix.cjs
 * @since 2025-11-22
 */

const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);
const { Project } = require(`ts-morph`);
const { logger, spawnWrapper } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `fix.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--fix`].includes(arg))?.replace(`--`, ``) || ``;

// -----------------------------------------------------------------------------------------------
const resolveTsPruneBinJs = () => {
	logger(`info`, `ts-prune 바이너리 경로 해석 시도`);

	try {
		const pkgPath = require.resolve(`ts-prune/package.json`, { paths: [process.cwd()] });
		const pkgDir = path.dirname(pkgPath);
		const pkgJson = JSON.parse(fs.readFileSync(pkgPath, `utf8`));

		const binRel = (typeof pkgJson.bin === `string`) ? (
			pkgJson.bin
		) : (pkgJson.bin && typeof pkgJson.bin === `object`) ? (
			(pkgJson.bin[`ts-prune`]) ? (
				pkgJson.bin[`ts-prune`]
			) : (() => {
				const keys = Object.keys(pkgJson.bin);
				const res = (keys.length > 0) ? pkgJson.bin[keys[0]] : null;
				return res;
			})()
		) : (
			null
		);

		const hasNoBin = !binRel;
		const result = hasNoBin ? (
			logger(`warn`, `package.json에서 bin 정보를 찾을 수 없음`),
			null
		) : (() => {
			const binAbs = path.resolve(pkgDir, binRel);
			const exists = fs.existsSync(binAbs);
			const res = exists ? binAbs : null;
			logger(`info`, `바이너리 경로: ${binAbs}, 존재: ${exists}`);
			return res;
		})();

		return result;
	}
	catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		logger(`error`, `ts-prune 패키지 해석 실패: ${msg}`);
		const result = null;
		return result;
	}
};

// 1. ts-prune 실행 ------------------------------------------------------------------------------
const runTsPrune = () => {
	logger(`info`, `ts-prune 실행 시작`);

	const cliArgs = [`-p`, `tsconfig.json`];
	logger(`info`, `ts-prune 명령행 인수: ${cliArgs.join(` `)}`);
	const errors = [];

	const binJs = resolveTsPruneBinJs();
	const binRes = binJs ? (() => {
		logger(`info`, `Node.js 바이너리로 ts-prune 실행 시도`);
		const r = spawnWrapper(process.execPath, [binJs, ...cliArgs]);
		const hasErr = r.error;
		const okSts = typeof r.status === `number` ? r.status === 0 : true;
		const res = hasErr ? (
			errors.push(`[node-bin] ${r.error && typeof r.error === `object` && `code` in r.error ? r.error.code : `ERR`} ${r.error ? r.error.message || `` : ``}`.trim()),
			null
		) : !okSts ? (
			errors.push(`[node-bin] exited ${r.status} stdout:"${(r.stdout || ``).trim()}" stderr:"${(r.stderr || ``).trim()}"`),
			null
		) : (
			logger(`success`, `Node.js 바이너리 실행 성공`),
			(r.stdout || ``)
		);
		return res;
	})() : null;

	const result = binRes ? (
		binRes
	) : (() => {
		const tsPruneBin = `ts-prune`;
		const tsPruneCmd = process.platform === `win32` ? `${tsPruneBin}.cmd` : tsPruneBin;
		const localBinPath = path.join(process.cwd(), `node_modules`, `.bin`, tsPruneCmd);
		const pnpmCmd = process.platform === `win32` ? `pnpm.cmd` : `pnpm`;
		const npxCmd = process.platform === `win32` ? `npx.cmd` : `npx`;

		const exeMths = [
			{
				name: `local-bin`,
				getPath: () => localBinPath,
				getCommand: (bp=``) => [bp, cliArgs]
			},
			{
				name: `pnpm-exec`,
				getPath: () => pnpmCmd,
				getCommand: (cmd=``) => [cmd, [`exec`, tsPruneBin, ...cliArgs]]
			},
			{
				name: `npx`,
				getPath: () => npxCmd,
				getCommand: (cmd=``) => [cmd, [tsPruneBin, ...cliArgs]]
			},
			{
				name: `path-ts-prune`,
				getPath: () => tsPruneCmd,
				getCommand: (cmd=``) => [cmd, cliArgs]
			}
		];

		let finalRes = null;

		for (const mth of exeMths) {
			const cmdPath = mth.getPath();
			const tuple = mth.getCommand(cmdPath);
			const cmd = tuple[0];
			const mthArgs = Array.isArray(tuple[1]) ? tuple[1] : [tuple[1]];

			const isLocal = mth.name === `local-bin`;
			const noPath = !fs.existsSync(cmdPath);

			if (isLocal && noPath) {
				errors.push(`[${mth.name}] ${cmdPath} 없음`);
				continue;
			}

			logger(`info`, `${mth.name}으로 ts-prune 실행 시도`);
			// @ts-ignore
			const r = spawnWrapper(cmd, mthArgs);
			const hasErr = r.error;
			const okSts = typeof r.status === `number` ? r.status === 0 : true;
			const mthRes = hasErr ? (
				errors.push(`[${mth.name}] ${r.error && typeof r.error === `object` && `code` in r.error ? r.error.code : `ERR`} ${r.error ? r.error.message || `` : ``}`.trim()),
				null
			) : !okSts ? (
				errors.push(`[${mth.name}] exited ${r.status} stdout:"${(r.stdout || ``).trim()}" stderr:"${(r.stderr || ``).trim()}"`),
				null
			) : (
				logger(`success`, `${mth.name} 실행 성공`),
				(r.stdout || ``)
			);

			if (mthRes) {
				finalRes = mthRes;
				break;
			}
		}

		const hasFinal = finalRes;
		const res = hasFinal ? (
			finalRes
		) : (() => {
			const errMsg = `ts-prune 실행 실패:\n${errors.map((e) => ` - ${e}`).join(`\n`)}`;
			logger(`error`, errMsg);
			throw new Error(errMsg);
		})();

		return res;
	})();

	return result;
};

// 2. ts-prune 출력 파싱 --------------------------------------------------------------------------
const parseTsPruneOutput = (text = ``) => {
	logger(`info`, `ts-prune 출력 파싱 시작`);

	const lineRegex = /^(?<file>.+):(?<line>\d+)\s*-\s*(?<name>.+?)(?:\s*\((?<note>.+)\))?$/;
	const output = [];
	const lines = text.split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.trim();
		const isEmpty = line.length === 0;
		if (isEmpty) {
			continue;
		}
		const match = lineRegex.exec(line);
		const noMatch = !match || !match.groups;
		if (noMatch) {
			continue;
		}

		// @ts-ignore
		const fileNorm = path.normalize(match.groups.file);
		// @ts-ignore
		const symName = match.groups.name.trim();
		// @ts-ignore
		const note = match.groups.note ? match.groups.note.trim() : null;
		output.push({ file: fileNorm, name: symName, note });
	}

	logger(`info`, `파싱된 항목 수: ${output.length}`);
	return output;
};

// 3. 파일별 그룹화 -------------------------------------------------------------------------------
// @ts-ignore
const groupByFile = (items = []) => {
	logger(`info`, `파일별 그룹화 시작`);

	const fileMap = new Map();
	for (const item of items) {
		const hasKey = fileMap.has(item.file);
		!hasKey && fileMap.set(item.file, []);
		fileMap.get(item.file).push(item);
	}

	logger(`info`, `그룹화된 파일 수: ${fileMap.size}`);
	return fileMap;
};

// 4. 파일 경로 유틸리티 -------------------------------------------------------------------------
const toProjectAbsolute = (fp = ``) => {
	const norm = fp.replace(/\//g, path.sep);
	const isAbsWin = /^[a-zA-Z]:[\\\\/]/.test(norm) || /^\\\\/.test(norm);
	const result = isAbsWin ? (
		norm
	) : (
		path.resolve(process.cwd(), norm.replace(/^[\\\\/]+/, ``))
	);
	return result;
};

// 5. 안전한 백업 생성 ---------------------------------------------------------------------------
const safeBackup = (fp = ``) => {
	const bkPath = fp + `.bak`;

	try {
		const noFile = !fs.existsSync(fp);
		const result = noFile ? (
			false
		) : (
			(() => {
				const noBk = !fs.existsSync(bkPath);
				noBk && fs.copyFileSync(fp, bkPath);
				logger(`info`, `백업 생성: ${bkPath}`);
				return true;
			})()
		);
		return result;
	}
	catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		logger(`warn`, `백업 실패: ${msg}`);
		const result = false;
		return result;
	}
};

// 6. Export 제거 함수 ----------------------------------------------------------------------------
// @ts-ignore
const removeNamesInExportDeclarations = (sf, tgtNames) => {
	const expDecls = sf.getExportDeclarations();

	for (const expDecl of expDecls) {
		const specs = expDecl.getNamedExports();
		const noSpecs = specs.length === 0;
		if (noSpecs) {
			continue;
		}

		const toRm = [];
		for (const spec of specs) {
			const localName = spec.getNameNode().getText();
			const aliasNode = spec.getAliasNode();
			const expName = aliasNode ? aliasNode.getText() : localName;
			const shouldRm = tgtNames.has(expName) || tgtNames.has(localName);
			shouldRm && toRm.push(spec);
		}

		toRm.forEach((spec) => spec.remove());
		const rem = expDecl.getNamedExports().length;
		const isNs = expDecl.isNamespaceExport && expDecl.isNamespaceExport();
		const isEmpty = rem === 0 && !isNs;
		isEmpty && expDecl.remove();
	}
};

// 7. 로컬 선언 제거 함수 ----------------------------------------------------------------------------
// @ts-ignore
const removeLocalDeclarationsByNames = (sf, tgtNames) => {
	// @ts-ignore
	const varStmts = sf.getVariableStatements().filter((stmt) => stmt.hasExportKeyword());

	for (const varStmt of varStmts) {
		const decls = varStmt.getDeclarations();
		// @ts-ignore
		const toRm = decls.filter((decl) => tgtNames.has(decl.getName()));
		const noRm = toRm.length === 0;
		if (noRm) {
			continue;
		}

		const rmAll = toRm.length === decls.length;
		rmAll ? (
			varStmt.remove()
		) : (
			// @ts-ignore
			toRm.forEach((decl) => decl.remove())
		);
	}

	// @ts-ignore
	const removeExportedNodes = (nodes) => {
		for (const node of nodes) {
			const nodeAny = (node);
			const nodeName = typeof nodeAny.getName === `function` ? nodeAny.getName() : null;
			const hasName = nodeName && tgtNames.has(nodeName);
			const isExp = typeof nodeAny.hasExportKeyword === `function` && nodeAny.hasExportKeyword();
			const canRm = typeof nodeAny.remove === `function`;
			const shouldRm = hasName && isExp && canRm;
			shouldRm && nodeAny.remove();
		}
	};

	removeExportedNodes(sf.getFunctions());
	removeExportedNodes(sf.getClasses());
	removeExportedNodes(sf.getEnums());
	removeExportedNodes(sf.getInterfaces());
	removeExportedNodes(sf.getTypeAliases());
};

// 8. 기본 내보내기 제거 함수 ----------------------------------------------------------------------
// @ts-ignore
const removeDefaultExport = (sf) => {
	const assigns = sf.getExportAssignments();
	// @ts-ignore
	const defAssign = assigns.find((assignment) => assignment.isExportEquals() === false);
	let removed = false;

	const hasDef = defAssign;
	hasDef && (
		defAssign.remove(),
		removed = true
	);

	const decls = [
		...sf.getFunctions(),
		...sf.getClasses()
	];

	for (const decl of decls) {
		const hasExp = decl.hasExportKeyword && decl.hasExportKeyword();
		if (hasExp) {
			// @ts-ignore
			const mods = decl.getModifiers().map((mod) => mod.getText());
			const hasDef = mods.includes(`default`);
			hasDef && (
				decl.remove(),
				removed = true
			);
		}
	}

	return removed;
};

// 9. 파일 처리 ----------------------------------------------------------------------------------
// @ts-ignore
const processFile = (proj, fp = ``, names) => {
	const absPath = toProjectAbsolute(fp);
	logger(`info`, `파일 처리 중: ${fp}`);

	const dtsRegex = /\.d\.ts$/;
	const isDts = dtsRegex.test(absPath);
	const result = isDts ? (
		{
			file: fp,
			removed: [],
			skipped: true,
			reason: `declaration-file`
		}
	) : (() => {
		const sf = proj.getSourceFile(absPath) || proj.addSourceFileAtPathIfExists(absPath);
		const noSf = !sf;
		const res = noSf ? (
			{
				file: fp,
				removed: [],
				skipped: true,
				reason: `file-not-found`
			}
		) : (() => {
			const beforeTxt = sf.getFullText();
			const rmSet = new Set();
			removeNamesInExportDeclarations(sf, names);
			removeLocalDeclarationsByNames(sf, names);
			const hasDef = names.has(`default`);
			const defRm = hasDef && removeDefaultExport(sf);
			defRm && rmSet.add(`default`);
			// @ts-ignore
			names.forEach((name) => rmSet.add(name));

			const afterTxt = sf.getFullText();
			const changed = beforeTxt !== afterTxt;
			const shouldSave = changed && (args2 === `fix`);

			shouldSave && (
				safeBackup(absPath),
				sf.saveSync(),
				logger(`success`, `파일 저장 완료: ${fp}`)
			);

			const res = {
				file: fp,
				removed: Array.from(rmSet),
				skipped: false,
				reason: ``
			};
			return res;
		})();
		return res;
	})();

	return result;
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || 'none'}`);
	logger(`info`, `전달된 인자 2 : ${args2 || 'none'}`);

	try {
		const results = [];
		const rawOut = runTsPrune();
		const parsedItems = parseTsPruneOutput(rawOut || ``);
		const grpByFile = groupByFile(parsedItems);
		const proj = new Project({
			tsConfigFilePath: path.resolve(process.cwd(), `tsconfig.json`),
			skipAddingFilesFromTsConfig: false
		});
		for (const entry of grpByFile.entries()) {
			const file = entry[0];
			const items = entry[1];
			// @ts-ignore
			const nameSet = new Set(items.map((item) => item.name));
			const res = processFile(proj, file, nameSet);
			results.push(res);
		}

		const summary = {
			apply: args2 === `fix`,
			totalFiles: grpByFile.size,
			modifiedFiles: results.filter((r) => r.removed.length > 0).length,
			skippedFiles: results.filter((r) => r.skipped).map((r) => ({
				file: r.file,
				reason: r.reason
			})),
			details: results
		};
		summary.skippedFiles.length > 0 && (
			logger(`warn`, `건너뛴 파일들:`),
			summary.skippedFiles.forEach((skipped) => {
				logger(`warn`, ` - ${skipped.file} (사유: ${skipped.reason})`);
			})
		);

		logger(`success`, `ts-prune fix 완료`);
		logger(`info`, `적용 모드: ${summary.apply}`);
		logger(`info`, `후보 파일 수: ${summary.totalFiles}`);
		logger(`info`, `수정된 파일 수: ${summary.modifiedFiles}`);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();