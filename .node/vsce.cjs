/**
 * @file vsce.cjs
 * @since 2025-11-22
 */

const fs = require(`fs`);
const path = require(`path`);
const { logger, runCmd, delDir, delFile } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `vsce.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--package`].includes(arg))?.replace(`--`, ``) || ``;

// 설정 로드 -----------------------------------------------------------------------------------
const loadConfig = () => {
	const cfgPath = path.join(process.cwd(), `vsce.config.json`);
	const hasCfg = fs.existsSync(cfgPath);

	let result;
	hasCfg && (result = (
		JSON.parse(fs.readFileSync(cfgPath, `utf8`))
	));
	!hasCfg && (result = {
		external: [`vscode`],
		copyPackages: [],
		esbuildOptions: {},
		vsceOptions: {}
	});

	return result;
};

// esbuild 번들링 -----------------------------------------------------------------------------
// @ts-ignore
const bundle = (cfg) => {
	logger(`info`, `esbuild 번들링 시작 (src → out)`);

	// @ts-ignore
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
		args1 === `npm` && runCmd(args1, [`exec`, `--`, `esbuild`, ...esbArgs]);
		args1 === `pnpm` && runCmd(args1, [`exec`, `esbuild`, ...esbArgs]);
		args1 === `yarn` && runCmd(args1, [`esbuild`, ...esbArgs]);
		args1 === `bun` && runCmd(args1, [`x`, `esbuild`, ...esbArgs]);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `esbuild 번들링 실패: ${msg}`);
		throw e;
	}

	logger(`success`, `esbuild 번들링 완료`);
};

// 패키지 및 모든 의존성 재귀 복사 -------------------------------------------------------------
// @ts-ignore
const getAllDependencies = (pkgName, nmSrc, vis = new Set()) => {
	const hasVis = vis.has(pkgName);
	const result = hasVis ? (
		new Set()
	) : (() => {
		vis.add(pkgName);
		const pkgPath = pkgName.startsWith(`@`) ? (
			path.join(nmSrc, pkgName)
		) : (
			path.join(nmSrc, pkgName)
		);
		const pkgJsonPath = path.join(pkgPath, `package.json`);
		const noPath = !fs.existsSync(pkgJsonPath);
		const res = noPath ? (
			vis
		) : (() => {
			const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
			const deps = pkgJson.dependencies || {};

			Object.keys(deps).forEach(dep => {
				getAllDependencies(dep, nmSrc, vis);
			});

			return vis;
		})();
		return res;
	})();

	return result;
};

// 패키지를 flat 구조로 복사 (중복 제거) --------------------------------------------------------
// @ts-ignore
const copyPackageFlat = (pkgName, nmSrc, nmTgt, vis = new Set()) => {
	const hasVis = vis.has(pkgName);
	hasVis ? (
		null
	) : (() => {
		vis.add(pkgName);
		const src = path.join(nmSrc, pkgName);
		const dest = path.join(nmTgt, pkgName);
		const hasSrc = fs.existsSync(src);

		hasSrc && (() => {
			const destDir = path.dirname(dest);
			!fs.existsSync(destDir) && fs.mkdirSync(destDir, { recursive: true });
			const realPath = fs.realpathSync(src);
			fs.cpSync(realPath, dest, { recursive: true, force: true, dereference: true });
			logger(`info`, `복사: ${pkgName}`);
		})();
	})();
};

// 패키지 복사 메인 함수 -----------------------------------------------------------------------
// @ts-ignore
const copyPackages = (cfg) => {
	!cfg.copyPackages.length && (
		logger(`info`, `복사할 패키지 없음`)
	);
	cfg.copyPackages.length && (
		logger(`info`, `패키지 복사 시작`), (() => {
			const nmSrc = path.join(process.cwd(), `node_modules`);
			const nmTgt = path.join(process.cwd(), `out`, `node_modules`);
			const noTgt = !fs.existsSync(nmTgt);
			noTgt && fs.mkdirSync(nmTgt, { recursive: true });
			const allPkgs = new Set();
			// @ts-ignore
			cfg.copyPackages.forEach(pkg => {
				const deps = getAllDependencies(pkg, nmSrc);
				deps.forEach(dep => allPkgs.add(dep));
			});

			const vis = new Set();
			allPkgs.forEach(pkg => {
				copyPackageFlat(pkg, nmSrc, nmTgt, vis);
			});

			logger(`success`, `패키지 복사 완료 (총 ${vis.size}개)`);
		})()
	);
};

// 메인 실행 함수 ------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2 : ${args2 || `none`}`);
	logger(`info`, `VSCE 패키지 빌드 시작`);

	try {
		const cfg = loadConfig();
		delDir(`out`);
		bundle(cfg);
		copyPackages(cfg);
		delFile(process.cwd(), `.vsix`);

		const vsceArgs = [`package`];
		cfg.vsceOptions[`no-dependencies`] && vsceArgs.push(`--no-dependencies`);

		args1 === `npm` && runCmd(args1, [`exec`, `--`, `vsce`, ...vsceArgs]);
		args1 === `pnpm` && runCmd(args1, [`exec`, `vsce`, ...vsceArgs]);
		args1 === `yarn` && runCmd(args1, [`vsce`, ...vsceArgs]);
		args1 === `bun` && runCmd(args1, [`x`, `vsce`, ...vsceArgs]);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`success`, `VSCE 패키지 빌드 완료`);
})();
