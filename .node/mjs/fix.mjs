/**
 * @file fix.mjs
 * @description 코드 정리 및 fix 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-4
 */

import fs from "fs";
import path from "path";
import process from "process";
import { Project } from "ts-morph";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { logger, spawnWrapper } from "../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [
	`--fix`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 설정 -----------------------------------------------------------------------------------
const IGNORE_PATTERNS = [
	/extension\.ts$/,
	/src[\\/]exports[\\/]/,
	/\.d\.ts$/,
];

// 3. ts-prune 바이너리 경로 해석 ------------------------------------------------------------
const resolveTsPruneBinJs = () => {
	logger(`info`, `ts-prune 바이너리 경로 해석 시도`);
	try {
		const pkgPath = require.resolve(`ts-prune/package.json`, {
			"paths": [
				process.cwd(),
			],
		});
		const pkgDir = path.dirname(pkgPath);
		const pkgJson = JSON.parse(fs.readFileSync(pkgPath, `utf8`));
		const binRel = typeof pkgJson.bin === `string` ? pkgJson.bin : pkgJson.bin && typeof pkgJson.bin === `object` ? pkgJson.bin[`ts-prune`] ? pkgJson.bin[`ts-prune`] : (() => {
			const keys = Object.keys(pkgJson.bin);
			return keys.length > 0 ? pkgJson.bin[keys[0]] : null;
		})() : null;

		if (!binRel) {
			logger(`warn`, `package.json에서 bin 정보를 찾을 수 없음`);
			return null;
		}
		const binAbs = path.resolve(pkgDir, binRel);
		const exists = fs.existsSync(binAbs);
		logger(`info`, `바이너리 경로: ${binAbs}, 존재: ${exists}`);
		return exists ? binAbs : null;
	}
	catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		logger(`error`, `ts-prune 패키지 해석 실패: ${errMsg}`);
		return null;
	}
};

// 4. ts-prune 실행 --------------------------------------------------------------------------
const runTsPrune = () => {
	logger(`info`, `ts-prune 실행 시작`);
	const cliArgs = [
		`-p`,
		`tsconfig.json`,
		`-u`,
	];
	logger(`info`, `ts-prune 명령행 인수: ${cliArgs.join(` `)}`);
	const errors = [];

	const binJs = resolveTsPruneBinJs();
	if (binJs) {
		logger(`info`, `Node.js 바이너리로 ts-prune 실행 시도`);
		const r = spawnWrapper(process.execPath, [
			binJs,
			...cliArgs,
		]);
		const err = r.error;
		if (r.error) {
			errors.push(`[node-bin] ${err.code || `ERR`} ${err.message || ``}`.trim());
		}
		else if (r.status !== 0) {
			errors.push(`[node-bin] exited ${r.status} stdout:"${(r.stdout || ``).trim()}" stderr:"${(r.stderr || ``).trim()}"`);
		}
		else {
			logger(`success`, `Node.js 바이너리 실행 성공`);
			return r.stdout || ``;
		}
	}
	const tsPruneBin = `ts-prune`;
	const tsPruneCmd = process.platform === `win32` ? `${tsPruneBin}.cmd` : tsPruneBin;
	const localBinPath = path.join(process.cwd(), `node_modules`, `.bin`, tsPruneCmd);
	const pnpmCmd = process.platform === `win32` ? `pnpm.cmd` : `pnpm`;
	const npxCmd = process.platform === `win32` ? `npx.cmd` : `npx`;
	const exeMths = [
		{
			"name": `local-bin`,
			"getPath": () => localBinPath,
			"getCommand": (bp) => [
				bp,
				cliArgs,
			],
		},
		{
			"name": `pnpm-exec`,
			"getPath": () => pnpmCmd,
			"getCommand": (cmd) => [
				cmd,
				[
					`exec`,
					tsPruneBin,
					...cliArgs,
				],
			],
		},
		{
			"name": `npx`,
			"getPath": () => npxCmd,
			"getCommand": (cmd) => [
				cmd,
				[
					tsPruneBin,
					...cliArgs,
				],
			],
		},
		{
			"name": `path-ts-prune`,
			"getPath": () => tsPruneCmd,
			"getCommand": (cmd) => [
				cmd,
				cliArgs,
			],
		},
	];

	for (const mth of exeMths) {
		const cmdPath = mth.getPath();
		const [
			cmd,
			mthArgs,
		] = mth.getCommand(cmdPath);
		if (mth.name === `local-bin` && !fs.existsSync(cmdPath)) {
			errors.push(`[${mth.name}] ${cmdPath} 없음`);
			continue;
		}
		logger(`info`, `${mth.name}으로 ts-prune 실행 시도`);
		const args = Array.isArray(mthArgs) ? mthArgs : [
			mthArgs,
		];
		const r = spawnWrapper(cmd, args);
		const err = r.error;
		if (r.error) {
			errors.push(`[${mth.name}] ${err.code || `ERR`} ${err.message || ``}`.trim());
		}
		else if (r.status !== 0) {
			errors.push(`[${mth.name}] exited ${r.status} stdout:"${(r.stdout || ``).trim()}" stderr:"${(r.stderr || ``).trim()}"`);
		}
		else {
			logger(`success`, `${mth.name} 실행 성공`);
			return r.stdout || ``;
		}
	}
	const errMsg = `ts-prune 실행 실패:\n${errors.map((e) => ` - ${e}`).join(`\n`)}`;
	logger(`error`, errMsg);
	throw new Error(errMsg);
};

// 5. ts-prune 출력 파싱 ---------------------------------------------------------------------
const parseTsPruneOutput = (text = ``) => {
	logger(`info`, `ts-prune 출력 파싱 시작`);
	const output = [];
	const lines = text.split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) {
			continue;
		}
		const dashIdx = line.indexOf(` - `);
		if (dashIdx === -1) {
			continue;
		}
		const left = line.slice(0, dashIdx).trim();
		const right = line.slice(dashIdx + 3).trim();
		if (!left || !right) {
			continue;
		}
		const filePart = left.replace(/:(\d+)(?::\d+)?$/, ``);
		const fileNorm = path.normalize(filePart);
		const noteMatch = right.match(/^(.*?)(?:\s*\((.+)\))?$/);
		if (!noteMatch) {
			continue;
		}
		const symName = noteMatch[1].trim();
		if (!symName) {
			continue;
		}
		const note = noteMatch[2] ? noteMatch[2].trim() : null;

		output.push({
			"file": fileNorm,
			"name": symName,
			"note": note,
		});
	}
	logger(`info`, `파싱된 항목 수: ${output.length}`);
	return output;
};

// 6. 파일별 그룹화 --------------------------------------------------------------------------
const groupByFile = (items = []) => {
	logger(`info`, `파일별 그룹화 시작`);

	const fileMap = new Map();
	for (const item of items) {
		if (!fileMap.has(item.file)) {
			fileMap.set(item.file, []);
		}
		fileMap.get(item.file).push(item);
	}
	logger(`info`, `그룹화된 파일 수: ${fileMap.size}`);
	return fileMap;
};

// 7. 파일 경로 유틸리티 ---------------------------------------------------------------------
const toProjectAbsolute = (fp = ``) => {
	const norm = fp.replace(/\//g, path.sep);
	const isAbsWin = /^[a-zA-Z]:[\\\\/]/.test(norm) || /^\\\\/.test(norm);
	return isAbsWin ? norm : path.resolve(process.cwd(), norm.replace(/^[\\\\/]+/, ``));
};

// 8. 안전한 백업 생성 -----------------------------------------------------------------------
const safeBackup = (fp = ``) => {
	const bkPath = `${fp}.bak`;
	try {
		if (!fs.existsSync(fp)) {
			return false;
		}
		if (!fs.existsSync(bkPath)) {
			fs.copyFileSync(fp, bkPath);
			logger(`info`, `백업 생성: ${bkPath}`);
		}
		return true;
	}
	catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		logger(`warn`, `백업 실패: ${msg}`);
		return false;
	}
};

// 9. Export 제거 함수 (re-export / named export) -------------------------------------------
const removeNamesInExportDeclarations = (sf, tgtNames, removedNames) => {
	const expDecls = sf.getExportDeclarations();
	for (const expDecl of expDecls) {
		const specs = expDecl.getNamedExports();
		if (specs.length === 0) {
			continue;
		}
		const toRm = [];
		for (const spec of specs) {
			const localName = spec.getNameNode().getText();
			const aliasNode = spec.getAliasNode();
			const expName = aliasNode ? aliasNode.getText() : localName;
			const isTarget = tgtNames.has(expName) || tgtNames.has(localName);

			if (isTarget) {
				removedNames?.add(expName);
				toRm.push(spec);
			}
		}
		toRm.forEach((spec) => {
			spec.remove();
		});
		const rem = expDecl.getNamedExports().length;
		const isNs = expDecl.isNamespaceExport?.();
		if (rem === 0 && !isNs) {
			expDecl.remove();
		}
	}
};

// 10. 로컬 선언 제거 함수 (export된 선언 자체 제거) -----------------------------------------
const removeLocalDeclarationsByNames = (sf, tgtNames, removedNames) => {
	const varStmts = sf.getVariableStatements().filter((stmt) => stmt.hasExportKeyword());
	for (const varStmt of varStmts) {
		const decls = varStmt.getDeclarations();
		const toRm = decls.filter((decl) => tgtNames.has(decl.getName()));
		if (toRm.length === 0) {
			continue;
		}
		if (toRm.length === decls.length) {
			decls.forEach((decl) => {
				const name = typeof decl.getName === `function` ? decl.getName() : null;
				if (name && tgtNames.has(name) && removedNames) {
					removedNames.add(name);
				}
			});
			varStmt.remove();
		}
		else {
			toRm.forEach((decl) => {
				const name = typeof decl.getName === `function` ? decl.getName() : null;
				if (name && removedNames) {
					removedNames.add(name);
				}
				decl.remove();
			});
		}
	}
	const removeExportedNodes = (nodes) => {
		for (const node of nodes) {
			const nodeName = typeof node.getName === `function` ? node.getName() : null;
			const hasName = nodeName && tgtNames.has(nodeName);
			const isExp = typeof node.hasExportKeyword === `function` && node.hasExportKeyword();
			const canRm = typeof node.remove === `function`;

			if (hasName && isExp && canRm) {
				if (nodeName && removedNames) {
					removedNames.add(nodeName);
				}
				node.remove();
			}
		}
	};
	removeExportedNodes(sf.getFunctions());
	removeExportedNodes(sf.getClasses());
	removeExportedNodes(sf.getEnums());
	removeExportedNodes(sf.getInterfaces());
	removeExportedNodes(sf.getTypeAliases());
};

// 11. 기본 내보내기 제거 함수 ---------------------------------------------------------------
const removeDefaultExport = (sf) => {
	let removed = false;
	// export default foo; / export default ...
	const assigns = sf.getExportAssignments();
	const defAssign = assigns.find((assignment) => assignment.isExportEquals() === false);
	if (defAssign) {
		defAssign.remove();
		removed = true;
	}
	// export default class Foo {} / export default function Foo () {}
	const decls = [
		...sf.getFunctions(),
		...sf.getClasses(),
	];
	for (const decl of decls) {
		const hasExp = typeof decl.hasExportKeyword === `function` && decl.hasExportKeyword();
		if (!hasExp) {
			continue;
		}
		const mods = decl.getModifiers().map((mod) => mod.getText());
		if (mods.includes(`default`)) {
			decl.remove();
			removed = true;
		}
	}
	return removed;
};

// 12. 파일 처리 -----------------------------------------------------------------------------
const processFile = (proj, fp = ``, names) => {
	const absPath = toProjectAbsolute(fp);
	logger(`info`, `파일 처리 중: ${fp}`);

	for (const pattern of IGNORE_PATTERNS) {
		if (pattern.test(fp) || pattern.test(absPath)) {
			return {
				"file": fp,
				"removed": [],
				"skipped": true,
				"reason": `ignored-pattern`,
			};
		}
	}
	const sf = proj.getSourceFile(absPath) || proj.addSourceFileAtPathIfExists(absPath);

	if (!sf) {
		return {
			"file": fp,
			"removed": [],
			"skipped": true,
			"reason": `file-not-found`,
		};
	}
	const beforeTxt = sf.getFullText();
	const rmSet = new Set();

	// unused export 제거
	removeNamesInExportDeclarations(sf, names, rmSet);
	removeLocalDeclarationsByNames(sf, names, rmSet);
	// unused default export 처리
	const hasDef = names.has(`default`);
	if (hasDef) {
		const defRm = removeDefaultExport(sf);
		if (defRm) {
			rmSet.add(`default`);
		}
	}
	// ts-morph 언어 서비스 기반으로 unused import / 정렬 정리
	if (typeof sf.organizeImports === `function`) {
		sf.organizeImports();
	}
	const afterTxt = sf.getFullText();
	const changed = beforeTxt !== afterTxt;
	const shouldSave = changed && args2 === `fix`;

	if (shouldSave) {
		safeBackup(absPath);
		sf.saveSync();
		logger(`success`, `파일 저장 완료: ${fp}`);
	}
	return {
		"file": fp,
		"removed": Array.from(rmSet),
		"skipped": false,
		"reason": ``,
	};
};

// 13. 메인 프로세스 -------------------------------------------------------------------------
const runFixProcess = () => {
	const results = [];
	const rawOut = runTsPrune();
	const parsedItems = parseTsPruneOutput(rawOut || ``);
	const grpByFile = groupByFile(parsedItems);
	const proj = new Project({
		"tsConfigFilePath": path.resolve(process.cwd(), `tsconfig.json`),
		"skipAddingFilesFromTsConfig": false,
	});

	for (const [
		file,
		items,
	] of grpByFile.entries()) {
		const nameSet = new Set(items.map((item) => item.name));
		const res = processFile(proj, file, nameSet);
		results.push(res);
	}
	const summary = {
		"apply": args2 === `fix`,
		"totalFiles": grpByFile.size,
		"modifiedFiles": results.filter((r) => !r.skipped && r.removed.length > 0).length,
		"skippedFiles": results.filter((r) => r.skipped).map((r) => ({
			"file": r.file,
			"reason": r.reason,
		})),
		"details": results,
	};

	if (summary.skippedFiles.length > 0) {
		logger(`warn`, `건너뛴 파일들:`);
		summary.skippedFiles.forEach((skipped) => {
			logger(`warn`, ` - ${skipped.file} (사유: ${skipped.reason})`);
		});
	}
	logger(`success`, `ts-prune fix 완료`);
	logger(`info`, `적용 모드: ${summary.apply}`);
	logger(`info`, `후보 파일 수: ${summary.totalFiles}`);
	logger(`info`, `수정된 파일 수: ${summary.modifiedFiles}`);
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
		// logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `fix` && runFixProcess();
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
