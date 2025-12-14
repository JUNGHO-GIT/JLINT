/**
 * @file vsce.mjs
 * @description VSCE 패키지 빌드 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-03
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { logger, runCmd, delDir, delFile, fileExists, getPmArgs } from "../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [
	`--package`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 번들링 불가 패키지 감지 유틸리티 --------------------------------------------------------
const fileCache = new Map();

const readFileCached = (filePath = ``) => {
	if (fileCache.has(filePath)) {
		return fileCache.get(filePath);
	}
	try {
		const content = fs.readFileSync(filePath, `utf8`);
		fileCache.set(filePath, content);
		return content;
	}
	catch {
		return ``;
	}
};

const walkJsFiles = (dir = ``, depth = 0, maxDepth = 3, callback) => {
	if (depth > maxDepth) {
		return false;
	}
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isFile() && /\.(js|cjs|mjs)$/.test(entry.name) && callback(fullPath)) {
				return true;
			}
			if (entry.isDirectory() && ![
				`node_modules`,
				`.git`,
				`test`,
				`tests`,
				`__tests__`,
			].includes(entry.name) && walkJsFiles(fullPath, depth + 1, maxDepth, callback)) {
				return true;
			}
		}
	}
	catch {
		// do nothing
	}
	return false;
};

const walkDirForExt = (dir = ``, ext = ``, maxDepth = 3) => {
	let found = false;
	const check = (d = ``, depth = 0) => {
		if (depth > maxDepth || found) {
			return;
		}
		try {
			const entries = fs.readdirSync(d, { withFileTypes: true });
			for (const entry of entries) {
				if (found) {
					break;
				}
				const fullPath = path.join(d, entry.name);
				if (entry.isFile() && entry.name.endsWith(ext)) {
					found = true;
					return;
				}
				if (entry.isDirectory() && ![
					`node_modules`,
					`.git`,
				].includes(entry.name)) {
					check(fullPath, depth + 1);
				}
			}
		}
		catch {
			// do nothing
		}
	};
	check(dir);
	return found;
};

const matchPatterns = (pkgPath = ``, patterns = [], maxDepth = 3) => {
	let found = false;
	walkJsFiles(pkgPath, 0, maxDepth, (filePath) => {
		const content = readFileCached(filePath);
		if (patterns.some((p) => p.test(content))) {
			found = true;
			return true;
		}
		return false;
	});
	return found;
};

// 3. 번들링 불가 조건 검사 함수들 ------------------------------------------------------------
const bundleCheckers = {
	// ESM 전용 패키지
	isEsmOnly: (pkgPath = ``) => {
		const pkgJsonPath = path.join(pkgPath, `package.json`);
		if (!fileExists(pkgJsonPath)) {
			return false;
		}
		const pkgJson = JSON.parse(readFileCached(pkgJsonPath));
		if (pkgJson.type === `module`) {
			return true;
		}
		const exports = pkgJson.exports;
		if (exports && typeof exports === `object`) {
			const str = JSON.stringify(exports);
			const hasImport = str.includes(`"import"`) || str.includes(`"module"`);
			const hasRequire = str.includes(`"require"`) || str.includes(`"node"`);
			return hasImport && !hasRequire;
		}
		return false;
	},

	// import.meta / createRequire 사용
	hasImportMeta: (pkgPath = ``) => matchPatterns(pkgPath, [
		/import\.meta\.(url|resolve|dirname|filename)/,
		/createRequire\s*\(/,
		/module\.createRequire\s*\(/,
	]),

	// 동적 require/import
	hasDynamicRequire: (pkgPath = ``) => matchPatterns(pkgPath, [
		/require\s*\(\s*[^\s"')`]/,
		/require\s*\(\s*["'`]\s*\+/,
		/require\s*\(\s*`[^`]*\${/,
		/require\.resolve\s*\(/,
		/import\s*\(\s*[^"'`]/,
		/import\s*\(\s*`[^`]*\${/,
		/await\s+import\s*\(/,
	]),

	// __dirname/__filename 경로 조합
	hasDirnamePath: (pkgPath = ``) => matchPatterns(pkgPath, [
		/__dirname\s*[+,]/,
		/__filename\s*[+,]/,
		/path\.(join|resolve)\s*\(\s*__dirname/,
		/path\.(join|resolve)\s*\(\s*__filename/,
		/new\s+URL\s*\([^)]*__dirname/,
		/fileURLToPath\s*\(/,
	]),

	// Native addon
	hasNativeAddon: (pkgPath = ``) => {
		if (fileExists(path.join(pkgPath, `binding.gyp`))) {
			return true;
		}
		if (fileExists(path.join(pkgPath, `prebuild`)) || fileExists(path.join(pkgPath, `prebuilds`))) {
			return true;
		}
		const pkgJsonPath = path.join(pkgPath, `package.json`);
		if (fileExists(pkgJsonPath)) {
			const pkgJson = JSON.parse(readFileCached(pkgJsonPath));
			if (pkgJson.gypfile || pkgJson.binary) {
				return true;
			}
		}
		return walkDirForExt(pkgPath, `.node`);
	},

	// WASM 사용
	hasWasm: (pkgPath = ``) => (
		walkDirForExt(pkgPath, `.wasm`, 3)
		|| matchPatterns(pkgPath, [
			/WebAssembly\.(instantiate|compile|Module)/,
			/\.wasm["'),`]/,
		], 2)
	),

	// Worker thread 사용
	hasWorker: (pkgPath = ``) => matchPatterns(pkgPath, [
		/new\s+Worker\s*\(/,
		/worker_threads/,
		/from\s+["']worker_threads["']/,
		/require\s*\(\s*["']worker_threads["']\)/,
	]),

	// 런타임 파일 읽기
	hasRuntimeFileRead: (pkgPath = ``) => matchPatterns(pkgPath, [
		/fs\.(readFileSync|readFile)\s*\(\s*path\.(join|resolve)\s*\(\s*__dirname/,
		/fs\.(readFileSync|readFile)\s*\(\s*__dirname/,
		/fs\.(existsSync|exists)\s*\(\s*path\.(join|resolve)\s*\(\s*__dirname/,
		/JSON\.parse\s*\(\s*fs\.readFileSync\s*\(\s*path\.(join|resolve)\s*\(\s*__dirname/,
	]),

	// child_process bin 실행
	hasChildProcess: (pkgPath = ``) => matchPatterns(pkgPath, [
		/spawn\s*\(\s*["'`][^"'`]+["'`]/,
		/exec\s*\(\s*["'`][^"'`]+["'`]/,
		/execFile\s*\(\s*["'`][^"'`]+["'`]/,
		/execSync\s*\(\s*["'`][^"'`]+["'`]/,
		/spawnSync\s*\(\s*["'`][^"'`]+["'`]/,
	], 2),

	// 플러그인 시스템
	hasPluginSystem: (pkgPath = ``) => matchPatterns(pkgPath, [
		/loadplugin/i,
		/resolveplugin/i,
		/pluginpath/i,
		/require\s*\(\s*plugin/i,
		/import\s*\(\s*plugin/i,
	], 2),

	// Optional require (try-catch)
	hasOptionalRequire: (pkgPath = ``) => matchPatterns(pkgPath, [/try\s*{[^}]*require\s*\([^)]+\)[^}]*}\s*catch/s], 2),

	// JSON 파일 런타임 로드
	hasJsonLoad: (pkgPath = ``) => matchPatterns(pkgPath, [
		/require\s*\(\s*["'`]\..*\.json["'`]\s*\)/,
		/JSON\.parse\s*\(\s*fs\./,
	], 2),

	// process.cwd() 기반 경로
	hasCwdPath: (pkgPath = ``) => matchPatterns(pkgPath, [/process\.cwd\s*\(\s*\)/], 2),
};

// 검사 항목 매핑 (검사함수 → 로그 메시지)
const checkerMap = [
	[
		bundleCheckers.isEsmOnly,
		`ESM 전용`,
	],
	[
		bundleCheckers.hasImportMeta,
		`import.meta/createRequire`,
	],
	[
		bundleCheckers.hasDynamicRequire,
		`동적 require/import`,
	],
	[
		bundleCheckers.hasDirnamePath,
		`__dirname 경로 조합`,
	],
	[
		bundleCheckers.hasNativeAddon,
		`native addon`,
	],
	[
		bundleCheckers.hasWasm,
		`WASM`,
	],
	[
		bundleCheckers.hasWorker,
		`Worker thread`,
	],
	[
		bundleCheckers.hasRuntimeFileRead,
		`런타임 파일 읽기`,
	],
	[
		bundleCheckers.hasChildProcess,
		`child_process`,
	],
	[
		bundleCheckers.hasPluginSystem,
		`플러그인 시스템`,
	],
	[
		bundleCheckers.hasOptionalRequire,
		`optional require`,
	],
	[
		bundleCheckers.hasJsonLoad,
		`JSON 런타임 로드`,
	],
	[
		bundleCheckers.hasCwdPath,
		`process.cwd 경로`,
	],
];

// 4. 설정 동적 생성 -------------------------------------------------------------------------
const buildConfig = () => {
	const cwd = process.cwd();
	const pkgJsonPath = path.join(cwd, `package.json`);
	const nmPath = path.join(cwd, `node_modules`);

	!fileExists(pkgJsonPath) && (() => {
		logger(`error`, `package.json not found`);
		process.exit(1);
	})();

	const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
	const deps = Object.keys(pkgJson.dependencies || {});
	const external = [`vscode`];
	const copyPackages = [];

	deps.forEach((pkg) => {
		const pkgPath = path.join(nmPath, pkg);

		!fileExists(pkgPath) ? (
			logger(`warn`, `패키지 없음: ${pkg}`)
		) : (() => {
			const reasons = checkerMap
				.filter(([checker]) => checker(pkgPath))
				.map(([, msg]) => msg);

			reasons.length > 0 && (() => {
				!external.includes(pkg) && external.push(pkg);
				!copyPackages.includes(pkg) && copyPackages.push(pkg);
				logger(`info`, `external 추가: ${pkg} (${reasons.join(`, `)})`);

				// 하위 의존성도 external에 추가
				const subPkgJsonPath = path.join(pkgPath, `package.json`);
				fileExists(subPkgJsonPath) && (() => {
					const subPkgJson = JSON.parse(readFileCached(subPkgJsonPath));
					const subDeps = Object.keys(subPkgJson.dependencies || {});
					subDeps.forEach((subPkg) => {
						!external.includes(subPkg) && external.push(subPkg);
					});
				})();
			})();
		})();
	});

	fileCache.clear();

	const cfg = {
		external: external,
		copyPackages: copyPackages,
		esbuildOptions: {
			"tree-shaking": true,
			target: `node21`,
			"legal-comments": `none`,
		},
		vsceOptions: { "no-dependencies": true },
	};
	logger(`debug`, `동적 설정: ${JSON.stringify(cfg, null, 2)}`);

	return cfg;
};

// 5. esbuild 번들링 -------------------------------------------------------------------------
const bundle = (cfg = {}) => {
	logger(`info`, `esbuild 번들링 시작 (src → out)`);

	const extArgs = cfg.external.map((pkg) => `--external:${pkg}`);
	const esbArgs = [
		`src/extension.ts`,
		`--bundle`,
		`--outfile=out/extension.js`,
		...extArgs,
		`--format=cjs`,
		`--platform=node`,
		`--minify`,
	];

	cfg.esbuildOptions[`tree-shaking`] && esbArgs.push(`--tree-shaking=true`);
	cfg.esbuildOptions.target && esbArgs.push(`--target=${cfg.esbuildOptions.target}`);
	cfg.esbuildOptions[`legal-comments`] && esbArgs.push(`--legal-comments=${cfg.esbuildOptions[`legal-comments`]}`);

	try {
		runCmd(args1, getPmArgs(args1, [
			`esbuild`,
			...esbArgs,
		]));
	}
	catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		logger(`error`, `esbuild 번들링 실패: ${errMsg}`);
		throw error;
	}
	logger(`success`, `esbuild 번들링 완료`);
};

// 6. 패키지 의존성 재귀 수집 ----------------------------------------------------------------
const findPackagePath = (pkgName = ``, searchPaths = []) => {
	for (const basePath of searchPaths) {
		const pkgPath = path.join(basePath, pkgName);
		if (fileExists(path.join(pkgPath, `package.json`))) {
			return pkgPath;
		}
	}
	return null;
};

// 7. 패키지 평탄 복사 -----------------------------------------------------------------------
const copyPackageFlat = (pkgName = ``, nmSrc = ``, nmTgt = ``, vis = new Set(), searchPaths = null) => {
	if (vis.has(pkgName)) {
		return;
	}
	vis.add(pkgName);

	const paths = searchPaths || [nmSrc];
	const src = findPackagePath(pkgName, paths);
	if (!src) {
		return;
	}

	const dest = path.join(nmTgt, pkgName);
	const destDir = path.dirname(dest);
	!fileExists(destDir) && fs.mkdirSync(destDir, { recursive: true });

	const realPath = fs.realpathSync(src);

	// 제외 디렉토리/파일 목록
	const excludeDirs = new Set([
		`test`,
		`tests`,
		`__tests__`,
		`doc`,
		`docs`,
		`example`,
		`examples`,
		`bin`,
		`coverage`,
		`.github`,
		`.vscode`,
	]);
	const excludeExts = [
		`.md`,
		`.markdown`,
		`.txt`,
		`.map`,
		`.log`,
		`.lock`,
		`.yml`,
		`.yaml`,
	];
	const excludeNames = new Set([
		`makefile`,
		`gulpfile.js`,
		`gruntfile.js`,
	]);
	const excludeContains = [
		`license`,
		`changelog`,
		`history`,
		`authors`,
	];

	const shouldExcludeFile = (basename = ``) => {
		if (basename.startsWith(`.`)) {
			return true;
		}
		if (excludeExts.some((ext) => basename.endsWith(ext))) {
			return true;
		}
		if (basename.endsWith(`.ts`) && !basename.endsWith(`.d.ts`)) {
			return true;
		}
		const lower = basename.toLowerCase();
		if (excludeNames.has(lower)) {
			return true;
		}
		if (excludeContains.some((kw) => lower.includes(kw))) {
			return true;
		}
		return false;
	};

	const copyRecursive = (source = ``, target = ``) => {
		const stats = fs.statSync(source);

		stats.isDirectory() ? (() => {
			const basename = path.basename(source);
			if (excludeDirs.has(basename)) {
				return;
			}
			!fs.existsSync(target) && fs.mkdirSync(target, { recursive: true });
			fs.readdirSync(source).forEach((child) => {
				copyRecursive(path.join(source, child), path.join(target, child));
			});
		})() : stats.isFile() && (() => {
			const basename = path.basename(source);
			if (shouldExcludeFile(basename)) {
				return;
			}
			// .js 파일: sourceMappingURL 제거
			basename.endsWith(`.js`)
				? (() => {
						const content = fs.readFileSync(source, `utf8`);
						const cleaned = content.replace(/\n?\/\/[#@]\s*sourceMappingURL=[^\n]+\s*$/, ``);
						fs.writeFileSync(target, cleaned, `utf8`);
					})()
				: fs.copyFileSync(source, target);
		})();
	};

	try {
		copyRecursive(realPath, dest);
		logger(`info`, `복사: ${pkgName}`);
	}
	catch (error) {
		logger(`warn`, `복사 실패 (${pkgName}): ${error.message}`);
	}
};

// 8. 패키지 복사 메인 -----------------------------------------------------------------------
const copyPackages = (cfg = {}) => {
	if (!cfg.copyPackages?.length) {
		logger(`info`, `복사할 패키지 없음`);
		return;
	}
	logger(`info`, `패키지 복사 시작`);

	const nmSrc = path.join(process.cwd(), `node_modules`);
	const nmTgt = path.join(process.cwd(), `out`, `node_modules`);
	!fileExists(nmTgt) && fs.mkdirSync(nmTgt, { recursive: true });

	// 모든 의존성 수집 (중첩 node_modules 포함)
	const allPkgs = new Map(); // pkgName -> [searchPaths]
	const visitedPaths = new Set(); // 실제 경로로 중복 체크
	cfg.copyPackages.forEach((pkg) => {
		const searchPaths = [nmSrc];
		const collectDeps = (pkgName, paths) => {
			const pkgPath = findPackagePath(pkgName, paths);
			if (!pkgPath) {
				return;
			}

			// 실제 경로로 중복 체크
			const realPkgPath = fs.realpathSync(pkgPath);
			if (visitedPaths.has(realPkgPath)) {
				return;
			}
			visitedPaths.add(realPkgPath);

			// 패키지 이름별로 searchPaths 저장 (평탄 복사용)
			!allPkgs.has(pkgName) && allPkgs.set(pkgName, [...paths]);

			const pkgJsonPath = path.join(pkgPath, `package.json`);
			const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
			const deps = Object.keys(pkgJson.dependencies || {});

			const nestedNm = path.join(pkgPath, `node_modules`);
			const newPaths = fileExists(nestedNm)
				? [
						nestedNm,
						...paths,
					]
				: paths;

			deps.forEach((dep) => {
				collectDeps(dep, newPaths);
			});
		};
		collectDeps(pkg, searchPaths);
	});

	const vis = new Set();
	allPkgs.forEach((searchPaths, pkg) => {
		copyPackageFlat(pkg, nmSrc, nmTgt, vis, searchPaths);
	});

	logger(`success`, `패키지 복사 완료 (총 ${vis.size}개)`);
};

// 9. VSCE 빌드 프로세스 ---------------------------------------------------------------------
const runVsceProcess = (cfg = {}) => {
	delDir(`out`);
	bundle(cfg);
	copyPackages(cfg);
	delFile(process.cwd(), `.vsix`);

	const vsceArgs = [`package`];
	cfg.vsceOptions?.[`no-dependencies`] && vsceArgs.push(`--no-dependencies`);

	runCmd(args1, getPmArgs(args1, [
		`vsce`,
		...vsceArgs,
	]));
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `package` && runVsceProcess(buildConfig());
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
