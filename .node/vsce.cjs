// vsce.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || `npm`;

// 로깅 함수 -----------------------------------------------------------------------------------
const logger = (type = ``, message = ``) => {
	const format = (text = ``) => text.trim().replace(/^\s+/gm, ``);
	const line = `----------------------------------------`;
	const colors = {
		line: `\x1b[38;5;214m`,
		info: `\x1b[36m`,
		success: `\x1b[32m`,
		warn: `\x1b[33m`,
		error: `\x1b[31m`,
		reset: `\x1b[0m`
	};
	const separator = `${colors.line}${line}${colors.reset}`;

	type === `info` && console.log(format(`
		${separator}
		${colors.info}[INFO]${colors.reset} - ${message}
	`));
	type === `success` && console.log(format(`
		${separator}
		${colors.success}[SUCCESS]${colors.reset} - ${message}
	`));
	type === `warn` && console.log(format(`
		${separator}
		${colors.warn}[WARN]${colors.reset} - ${message}
	`));
	type === `error` && console.log(format(`
		${separator}
		${colors.error}[ERROR]${colors.reset} - ${message}
	`));
};

// 명령 실행 함수 ------------------------------------------------------------------------------
// @ts-ignore
const runCommand = (cmd = ``, args = [], ignoreError = false) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: true,
		env: process.env
	});

	result.status !== 0 ? (
		ignoreError ? (
			logger(`warn`, `${cmd} 경고 무시 (exit code: ${result.status})`)
		) : (
			logger(`error`, `${cmd} 실패 (exit code: ${result.status})`),
			process.exit(result.status || 1)
		)
	) : (
		logger(`success`, `${cmd} 실행 완료`)
	);
};

// 설정 로드 -----------------------------------------------------------------------------------
const loadConfig = () => {
	const configPath = path.join(process.cwd(), `vsce.config.json`);
	return fs.existsSync(configPath) ? (
		JSON.parse(fs.readFileSync(configPath, `utf8`))
	) : (
		{ external: [`vscode`], copyPackages: [], esbuildOptions: {}, vsceOptions: {} }
	);
};

// out 디렉토리 초기화 -----------------------------------------------------------------------
const deleteOutDir = () => {
	const outDir = path.join(process.cwd(), `out`);

	fs.existsSync(outDir) && (
		fs.rmSync(outDir, { recursive: true, force: true }),
		logger(`info`, `기존 out 디렉토리 삭제 완료`)
	);
};

// 기존 VSIX 삭제 ---------------------------------------------------------------------------
const deleteOldVsixFiles = () => {
	const cwd = process.cwd();
	const files = fs.readdirSync(cwd).filter(f => f.endsWith(`.vsix`));
	files.length && (
		files.forEach(f => {
			const full = path.join(cwd, f);
			fs.existsSync(full) && fs.rmSync(full, { force: true });
		}),
		logger(`info`, `기존 VSIX 파일 삭제: ${files.join(`, `)}`)
	);
};

// esbuild 번들링 -----------------------------------------------------------------------------
// @ts-ignore
const bundle = (config) => {
	logger(`info`, `esbuild 번들링 시작 (src → out)`);

	// @ts-ignore
	const externalArgs = config.external.map(pkg => `--external:${pkg}`);
	const esbuildArgs = [
		`src/extension.ts`,
		`--bundle`,
		`--outfile=out/extension.js`,
		...externalArgs,
		`--format=cjs`,
		`--platform=node`,
		`--sourcemap`,
		`--minify`
	];

	config.esbuildOptions[`tree-shaking`] && esbuildArgs.push(`--tree-shaking=true`);
	config.esbuildOptions.target && esbuildArgs.push(`--target=${config.esbuildOptions.target}`);
	config.esbuildOptions[`legal-comments`] && esbuildArgs.push(`--legal-comments=${config.esbuildOptions[`legal-comments`]}`);

	args1 === `npm` ? (
		runCommand(args1, [`exec`, `--`, `esbuild`, ...esbuildArgs])
	) : (
		runCommand(args1, [`exec`, `esbuild`, ...esbuildArgs])
	);

	logger(`success`, `esbuild 번들링 완료`);
};

// 패키지 및 모든 의존성 재귀 복사 -------------------------------------------------------------
// @ts-ignore
const getAllDependencies = (pkgName, nodeModulesSource, visited = new Set()) => {
	visited.has(pkgName) && (
		new Set()
	) || (() => {
		visited.add(pkgName);
		const pkgJsonPath = path.join(nodeModulesSource, pkgName, `package.json`);

		!fs.existsSync(pkgJsonPath) && (
			visited
		) || (() => {
			const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
			const deps = pkgJson.dependencies || {};

			Object.keys(deps).forEach(dep => {
				getAllDependencies(dep, nodeModulesSource, visited);
			});

			return visited;
		})();
	})();

	return visited;
};

// 패키지 복사 및 중첩 의존성 처리 -------------------------------------------------------------
// @ts-ignore
const copyPackageWithNestedDeps = (pkgPath, targetRoot, nodeModulesSource, visited = new Set()) => {
	const pkgName = path.basename(pkgPath);
	const scopedParent = path.basename(path.dirname(pkgPath));
	const fullName = scopedParent.startsWith(`@`) ? `${scopedParent}/${pkgName}` : pkgName;

	visited.has(fullName) && (
		null
	) || (() => {
		visited.add(fullName);
		const dest = path.join(targetRoot, fullName);

		fs.existsSync(pkgPath) && (
			fs.cpSync(pkgPath, dest, { recursive: true, force: true }),
			logger(`info`, `복사: ${fullName}`)
		);

		const pkgJsonPath = path.join(pkgPath, `package.json`);
		fs.existsSync(pkgJsonPath) && (() => {
			const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));
			const deps = pkgJson.dependencies || {};

			Object.keys(deps).length && (() => {
				const destNodeModules = path.join(dest, `node_modules`);
				!fs.existsSync(destNodeModules) && fs.mkdirSync(destNodeModules, { recursive: true });

				Object.keys(deps).forEach(depName => {
					const depSrc = path.join(nodeModulesSource, depName);
					fs.existsSync(depSrc) && !visited.has(depName) && (
						logger(`info`, `  중첩: ${fullName} → ${depName}`),
						copyPackageWithNestedDeps(depSrc, destNodeModules, nodeModulesSource, visited)
					);
				});
			})();
		})();

		const nestedNodeModules = path.join(pkgPath, `node_modules`);
		fs.existsSync(nestedNodeModules) && (() => {
			fs.readdirSync(nestedNodeModules, { withFileTypes: true }).forEach(item => {
				item.isDirectory() && (() => {
					const items = item.name.startsWith(`@`) ? (
						fs.readdirSync(path.join(nestedNodeModules, item.name), { withFileTypes: true })
							.filter(sub => sub.isDirectory())
							.map(sub => ({ name: `${item.name}/${sub.name}`, path: path.join(nestedNodeModules, item.name, sub.name) }))
					) : (
						[{ name: item.name, path: path.join(nestedNodeModules, item.name) }]
					);

					items.forEach(({ name, path: nestedPath }) => {
						const pkgJson = path.join(nestedPath, `package.json`);
						fs.existsSync(pkgJson) && (() => {
							const deps = JSON.parse(fs.readFileSync(pkgJson, `utf8`)).dependencies || {};
							Object.keys(deps).forEach(dep => {
								const depSrc = path.join(nodeModulesSource, dep);
								const depDest = path.join(dest, `node_modules`, name, `node_modules`, dep);
								fs.existsSync(depSrc) && !fs.existsSync(depDest) && (
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
const copyPackages = (config) => {
	!config.copyPackages.length && (
		logger(`info`, `복사할 패키지 없음`)
	) || (
		logger(`info`, `패키지 복사 시작`),
		(() => {
			const nodeModulesSource = path.join(process.cwd(), `node_modules`);
			const nodeModulesTarget = path.join(process.cwd(), `out`, `node_modules`);
			!fs.existsSync(nodeModulesTarget) && fs.mkdirSync(nodeModulesTarget, { recursive: true });

			const allPackages = new Set();
			// @ts-ignore
			config.copyPackages.forEach(pkg => {
				const deps = getAllDependencies(pkg, nodeModulesSource);
				deps.forEach(dep => allPackages.add(dep));
			});

			const visited = new Set();
			allPackages.forEach(pkg => {
				const src = path.join(nodeModulesSource, pkg);
				copyPackageWithNestedDeps(src, nodeModulesTarget, nodeModulesSource, visited);
			});

			logger(`success`, `패키지 복사 완료 (총 ${visited.size}개)`);
		})()
	);
};

// 메인 실행 함수 ------------------------------------------------------------------------------
(() => {
	const config = loadConfig();
	logger(`info`, `VSCE 패키지 빌드 시작`);
	deleteOutDir();
	bundle(config);
	copyPackages(config);
	deleteOldVsixFiles();

	const vsceArgs = [`package`];
	config.vsceOptions[`no-dependencies`] && vsceArgs.push(`--no-dependencies`);

	args1 === `npm` ? (
		runCommand(args1, [`exec`, `--`, `vsce`, ...vsceArgs])
	) : (
		runCommand(args1, [`exec`, `vsce`, ...vsceArgs])
	);

	logger(`success`, `VSCE 패키지 빌드 완료`);
})();