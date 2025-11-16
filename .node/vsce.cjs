// vsce.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;

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

// esbuild 번들링 (src에서 직접) -----------------------------------------------------------
const bundle = () => {
	logger(`info`, `esbuild 번들링 시작 (src → out)`);

	const externalPackages = [
		`vscode`,
		`prettier`,
		`prettier-plugin-java`,
		`prettier-plugin-jsp`,
		`@prettier/plugin-xml`,
		`sql-formatter`
	];

	const externalArgs = externalPackages.map(pkg => `--external:${pkg}`);

	const esbuildArgs = [
		`src/extension.ts`,
		`--bundle`,
		`--outfile=out/extension.js`,
		...externalArgs,
		`--format=cjs`,
		`--platform=node`,
		`--sourcemap`,
		`--minify`,
		`--tree-shaking=true`,
		`--target=node21`,
		`--legal-comments=none`
	];

	args1 === `npm` ? (
		runCommand(args1, [`exec`, `--`, `esbuild`, ...esbuildArgs])
	) : (
		runCommand(args1, [`exec`, `esbuild`, ...esbuildArgs])
	);

	logger(`success`, `esbuild 번들링 완료`);
};

// Prettier 패키지 복사 -----------------------------------------------------------------------
const copyPrettierPackages = () => {
	logger(`info`, `Prettier 패키지 복사 시작`);
	const nodeModulesTarget = path.join(process.cwd(), `out`, `node_modules`);

	!fs.existsSync(nodeModulesTarget) && fs.mkdirSync(nodeModulesTarget, { recursive: true });

	const packagesToCopy = [
		`prettier`,
		`prettier-plugin-java`,
		`prettier-plugin-jsp`,
		`@prettier`,
		`sql-formatter`
	];

	packagesToCopy.forEach(pkg => {
		const src = path.join(process.cwd(), `node_modules`, pkg);
		const dest = path.join(nodeModulesTarget, pkg);

		fs.existsSync(src) && (
			fs.cpSync(src, dest, { recursive: true, force: true }),
			logger(`info`, `복사 완료: ${pkg}`)
		);
	});

	logger(`success`, `Prettier 패키지 복사 완료`);
};

// 메인 실행 함수 ------------------------------------------------------------------------------
(() => {
	logger(`info`, `VSCE 패키지 빌드 시작`);
	deleteOutDir();
	bundle();
	copyPrettierPackages();
	deleteOldVsixFiles();
	runCommand(`vsce`, [`package`, `--no-dependencies`]);
	logger(`success`, `VSCE 패키지 빌드 완료`);
})();