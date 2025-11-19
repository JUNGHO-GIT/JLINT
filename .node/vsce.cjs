// vsce.cjs

const fs = require(`fs`);
const path = require(`path`);
const { logger, runCmd, delDir, delFile } = require(`./bundle.cjs`);

// 상수 정의 -----------------------------------------------------------------------------------
const TITLE = `vsce.cjs`;

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || `npm`;
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
		`--sourcemap`,
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
		const pkgJsonPath = path.join(nmSrc, pkgName, `package.json`);
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

// 패키지 복사 및 중첩 의존성 처리 -------------------------------------------------------------
// @ts-ignore
const copyPackageWithNestedDeps = (pkgPath, tgtRoot, nmSrc, vis = new Set()) => {
	const pkgName = path.basename(pkgPath);
	const scopedPar = path.basename(path.dirname(pkgPath));
	const fullName = scopedPar.startsWith(`@`) ? `${scopedPar}/${pkgName}` : pkgName;

	const hasVis = vis.has(fullName);
	hasVis ? (
		null
	) : (() => {
		vis.add(fullName);
		const dest = path.join(tgtRoot, fullName);

		const hasPath = fs.existsSync(pkgPath);
		hasPath && (() => {
			const realPath = fs.realpathSync(pkgPath);
			fs.cpSync(realPath, dest, { recursive: true, force: true, dereference: true });
			logger(`info`, `복사: ${fullName}`);
		})();

		const pkgJsonPath = path.join(pkgPath, `package.json`);
		const hasJson = fs.existsSync(pkgJsonPath);
		hasJson && (() => {
			const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
			const deps = pkgJson.dependencies || {};

			const hasDeps = Object.keys(deps).length;
			hasDeps && (() => {
				const destNm = path.join(dest, `node_modules`);
				const noDestNm = !fs.existsSync(destNm);
				noDestNm && fs.mkdirSync(destNm, { recursive: true });

				Object.keys(deps).forEach(depName => {
					const depSrc = path.join(nmSrc, depName);
					const hasSrc = fs.existsSync(depSrc);
					const notVis = !vis.has(depName);
					const shouldCp = hasSrc && notVis;
					shouldCp && (
						logger(`info`, `  중첩: ${fullName} → ${depName}`),
						copyPackageWithNestedDeps(depSrc, destNm, nmSrc, vis)
					);
				});
			})();
		})();

		const nestedNm = path.join(pkgPath, `node_modules`);
		const hasNested = fs.existsSync(nestedNm);
		hasNested && (() => {
			fs.readdirSync(nestedNm, { withFileTypes: true }).forEach(item => {
				const isDir = item.isDirectory();
				isDir && (() => {
					const isScoped = item.name.startsWith(`@`);
					const items = isScoped ? (
						fs.readdirSync(path.join(nestedNm, item.name), { withFileTypes: true })
							.filter(sub => sub.isDirectory())
							.map(sub => ({ name: `${item.name}/${sub.name}`, path: path.join(nestedNm, item.name, sub.name) }))
					) : (
						[{ name: item.name, path: path.join(nestedNm, item.name) }]
					);

					items.forEach(({ name, path: nestPath }) => {
						const pkgJson = path.join(nestPath, `package.json`);
						const hasJsonNest = fs.existsSync(pkgJson);
						hasJsonNest && (() => {
							const deps = JSON.parse(fs.readFileSync(pkgJson, `utf8`)).dependencies || {};
							Object.keys(deps).forEach(dep => {
								const depSrc = path.join(nmSrc, dep);
								const depDest = path.join(dest, `node_modules`, name, `node_modules`, dep);
								const hasSrc = fs.existsSync(depSrc);
								const noDest = !fs.existsSync(depDest);
								const shouldCp = hasSrc && noDest;
								shouldCp && (
									fs.mkdirSync(path.dirname(depDest), { recursive: true }),
									fs.cpSync(depSrc, depDest, { recursive: true, force: true })
								);
							});
						})();
					});
				})();
			});
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
				const src = path.join(nmSrc, pkg);
				copyPackageWithNestedDeps(src, nmTgt, nmSrc, vis);
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