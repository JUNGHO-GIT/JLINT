/**
 * @file vsce.cjs
 * @description VSCE 패키지 빌드 스크립트
 * @author Jungho
 * @since 2025-12-03
 */

const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);
const { logger, runCmd, delDir, delFile, fileExists, getPmArgs } = require(`../lib/utils.cjs`);

// 1. 인자 파싱 ------------------------------------------------------------------------------
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--package`].includes(arg))?.replace(`--`, ``) || ``;

// 2. import.meta.url 사용 여부 검사 ---------------------------------------------------------
const hasImportMetaUsage = (pkgPath=``) => {
	const checkFile = (filePath=``) => {
		try {
			const content = fs.readFileSync(filePath, `utf8`);
			const result = content.includes(`import.meta.url`) || /createRequire\s*\(/.test(content);
			return result;
		}
		catch {
			return false;
		}
	};

	const checkDir = (dir=``, depth=0) => {
		if (depth > 3) return false;

		try {
			const entries = fs.readdirSync(dir, { "withFileTypes": true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (entry.isFile() && /\.(js|cjs|mjs)$/.test(entry.name)) {
					if (checkFile(fullPath)) return true;
				}
				if (entry.isDirectory() && ![`node_modules`, `.git`].includes(entry.name)) {
					if (checkDir(fullPath, depth + 1)) return true;
				}
			}
		}
		catch {}

		return false;
	};

	const result = fileExists(pkgPath) && checkDir(pkgPath);
	return result;
};

// 3. 설정 동적 생성 -------------------------------------------------------------------------
const buildConfig = () => {
	const cwd = process.cwd();
	const pkgJsonPath = path.join(cwd, `package.json`);
	const nmPath = path.join(cwd, `node_modules`);

	!fileExists(pkgJsonPath) && (
		logger(`error`, `package.json not found`),
		process.exit(1)
	);

	const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
	const deps = Object.keys(pkgJson.dependencies || {});

	const external = [`vscode`];
	const copyPackages = [];

	deps.forEach(pkg => {
		const pkgPath = path.join(nmPath, pkg);
		!fileExists(pkgPath) && logger(`warn`, `패키지 없음: ${pkg}`);

		fileExists(pkgPath) && (() => {
			copyPackages.push(pkg);

			hasImportMetaUsage(pkgPath) && (() => {
				external.push(pkg);
				logger(`info`, `import.meta 감지 → external 추가: ${pkg}`);

				const subPkgJson = path.join(pkgPath, `package.json`);
				fileExists(subPkgJson) && (() => {
					const subDeps = Object.keys(JSON.parse(fs.readFileSync(subPkgJson, `utf8`)).dependencies || {});
					subDeps.forEach(subPkg => {
						!external.includes(subPkg) && external.push(subPkg);
					});
				})();
			})();
		})();
	});

	const esbuildOptions = {
		"tree-shaking": true,
		"target": `node21`,
		"legal-comments": `none`
	};

	const vsceOptions = {
		"no-dependencies": true
	};

	const cfg = { external, copyPackages, esbuildOptions, vsceOptions };
	logger(`debug`, `동적 설정: ${JSON.stringify(cfg, null, 2)}`);

	return cfg;
};

// 4. esbuild 번들링 -------------------------------------------------------------------------
const bundle = (cfg={}) => {
	logger(`info`, `esbuild 번들링 시작 (src → out)`);

	const extArgs = cfg.external.map(pkg => `--external:${pkg}`);
	const esbArgs = [
		`src/extension.ts`,
		`--bundle`,
		`--outfile=out/extension.js`,
		...extArgs,
		`--format=cjs`,
		`--platform=node`,
		`--minify`
	];

	cfg.esbuildOptions[`tree-shaking`] && esbArgs.push(`--tree-shaking=true`);
	cfg.esbuildOptions.target && esbArgs.push(`--target=${cfg.esbuildOptions.target}`);
	cfg.esbuildOptions[`legal-comments`] && esbArgs.push(`--legal-comments=${cfg.esbuildOptions[`legal-comments`]}`);

	try {
		runCmd(args1, getPmArgs(args1, [`esbuild`, ...esbArgs]));
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `esbuild 번들링 실패: ${errMsg}`);
		throw e;
	}

	logger(`success`, `esbuild 번들링 완료`);
};

// 5. 패키지 및 모든 의존성 재귀 수집 --------------------------------------------------------
const getAllDependencies = (pkgName=``, nmSrc=``, vis=new Set()) => {
	if (vis.has(pkgName)) return vis;

	vis.add(pkgName);

	const pkgPath = path.join(nmSrc, pkgName);
	const pkgJsonPath = path.join(pkgPath, `package.json`);

	if (!fileExists(pkgJsonPath)) return vis;

	const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
	const deps = pkgJson.dependencies || {};

	Object.keys(deps).forEach(dep => {
		getAllDependencies(dep, nmSrc, vis);
	});

	return vis;
};

// 6. 패키지를 평탄하게 복사 -------------------------------------------------------------------
const copyPackageFlat = (pkgName=``, nmSrc=``, nmTgt=``, vis=new Set()) => {
	if (vis.has(pkgName)) return;

	vis.add(pkgName);

	const src = path.join(nmSrc, pkgName);
	const dest = path.join(nmTgt, pkgName);

	if (!fileExists(src)) return;

	const destDir = path.dirname(dest);
	!fileExists(destDir) && fs.mkdirSync(destDir, { "recursive": true });

	const realPath = fs.realpathSync(src);
	fs.cpSync(realPath, dest, { "recursive": true, "force": true, "dereference": true });
	logger(`info`, `복사: ${pkgName}`);
};

// 7. 패키지 복사 메인 함수 ------------------------------------------------------------------
const copyPackages = (cfg={}) => {
	if (!cfg.copyPackages?.length) {
		logger(`info`, `복사할 패키지 없음`);
		return;
	}

	logger(`info`, `패키지 복사 시작`);

	const nmSrc = path.join(process.cwd(), `node_modules`);
	const nmTgt = path.join(process.cwd(), `out`, `node_modules`);
	!fileExists(nmTgt) && fs.mkdirSync(nmTgt, { "recursive": true });

	const allPkgs = new Set();
	cfg.copyPackages.forEach(pkg => {
		const deps = getAllDependencies(pkg, nmSrc);
		deps.forEach(dep => allPkgs.add(dep));
	});

	const vis = new Set();
	allPkgs.forEach(pkg => {
		copyPackageFlat(pkg, nmSrc, nmTgt, vis);
	});

	logger(`success`, `패키지 복사 완료 (총 ${vis.size}개)`);
};

// 8. VSCE 패키지 빌드 프로세스 --------------------------------------------------------------
const runVsceProcess = (cfg) => {
	delDir(`out`);
	bundle(cfg);
	copyPackages(cfg);
	delFile(process.cwd(), `.vsix`);

	const vsceArgs = [`package`];
	cfg.vsceOptions?.[`no-dependencies`] && vsceArgs.push(`--no-dependencies`);

	runCmd(args1, getPmArgs(args1, [`vsce`, ...vsceArgs]));
};

// 99. 실행 ----------------------------------------------------------------------------------
(() => {
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
		args1 && runVsceProcess(buildConfig());
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();