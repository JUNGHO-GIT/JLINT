// vsce.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;

// 설정 파일 로드 ------------------------------------------------------------------------------
const loadConfig = () => {
	const configPath = path.join(process.cwd(), `vsce.config.json`);
	return fs.existsSync(configPath) ? (
		JSON.parse(fs.readFileSync(configPath, `utf8`))
	) : (
		{ external: [`vscode`], copyPackages: [], esbuildOptions: {}, vsceOptions: {} }
	);
};

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

// 패키지 복사 --------------------------------------------------------------------------------
// @ts-ignore
const copyPackages = (config) => {
	!config.copyPackages.length && (
		logger(`info`, `복사할 패키지 없음`)
	) || (
		logger(`info`, `패키지 복사 시작`),
		(() => {
			const nodeModulesTarget = path.join(process.cwd(), `out`, `node_modules`);
			!fs.existsSync(nodeModulesTarget) && fs.mkdirSync(nodeModulesTarget, { recursive: true });

			// @ts-ignore
			config.copyPackages.forEach(pkg => {
				const src = path.join(process.cwd(), `node_modules`, pkg);
				const dest = path.join(nodeModulesTarget, pkg);
				fs.existsSync(src) && (
					fs.cpSync(src, dest, { recursive: true, force: true }),
					logger(`info`, `복사 완료: ${pkg}`)
				);
			});

			logger(`success`, `패키지 복사 완료`);
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

	runCommand(`vsce`, vsceArgs);
	logger(`success`, `VSCE 패키지 빌드 완료`);
})();