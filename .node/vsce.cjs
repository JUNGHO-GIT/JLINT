// vsce.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;

// 로깅 함수 -----------------------------------------------------------------------------------
const logger = (type=``, message=``) => {
	const format = (text=``) => text.trim().replace(/^\s+/gm, ``);
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
const runCommand = (cmd=``, args=[]) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: true,
		env: process.env
	});

	result.status !== 0 && (() => {
		logger(`error`, `${cmd} 실패 (exit code: ${result.status})`);
		process.exit(result.status || 1);
	})();

	logger(`success`, `${cmd} 실행 완료`);
};

// out 디렉토리 초기화 -----------------------------------------------------------------------
const deleteOutDir = () => {
	const outDir = path.join(process.cwd(), `out`);

	fs.existsSync(outDir) && (
		fs.rmSync(outDir, { recursive: true, force: true }),
		logger(`info`, `기존 out 디렉토리 삭제 완료`)
	);
};

// 메인 실행 함수 ------------------------------------------------------------------------------
(() => {
	logger(`info`, `VSCE 패키지 빌드 시작`);

	deleteOutDir();

	args1 === `npm` ? (
		runCommand(args1, [`exec`, `--`, `swc`, `src`, `-d`, `out`, `--source-maps`, `--strip-leading-paths`]),
		runCommand(args1, [`exec`, `--`, `tsc-alias`, `-p`, `tsconfig.json`, `-f`])
	)
	: (
		runCommand(args1, [`exec`, `swc`, `src`, `-d`, `out`, `--source-maps`, `--strip-leading-paths`]),
		runCommand(args1, [`exec`, `tsc-alias`, `-p`, `tsconfig.json`, `-f`])
	);

	runCommand(`vsce`, [`package`]);

	logger(`success`, `VSCE 패키지 빌드 완료`);
})();