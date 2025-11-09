// swc.cjs

const { spawnSync, spawn } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const isCompile = argv.includes(`--compile`);
const isWatch = argv.includes(`--watch`);

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
const run = (cmd=``, args=[]) => {
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

// 컴파일 실행 ----------------------------------------------------------------------------------
const compile = () => {
	logger(`info`, `컴파일 시작`);

	(() => {
		const outDir = path.join(process.cwd(), `out`);
		fs.existsSync(outDir) && (() => {
			fs.rmSync(outDir, { recursive: true, force: true });
			logger(`info`, `기존 out 디렉토리 삭제 완료`);
		})();
	})();

	run(`pnpm`, [`exec`, `swc`, `src`, `-d`, `out`, `--source-maps`, `--strip-leading-paths`]);
	run(`pnpm`, [`exec`, `tsc-alias`, `-p`, `tsconfig.json`, `-f`]);

	logger(`success`, `컴파일 완료`);
};

// 워치 모드 ----------------------------------------------------------------------------------
const watch = () => {
	logger(`info`, `워치 모드 시작`);

	const swcProc = spawn(`pnpm`, [`exec`, `swc`, `src`, `-d`, `out`, `--source-maps`, `--strip-leading-paths`, `--watch`], {
		stdio: `inherit`,
		shell: true,
		env: process.env
	});

	const aliasProc = spawn(`pnpm`, [`exec`, `tsc-alias`, `-p`, `tsconfig.json`, `-f`, `--watch`], {
		stdio: `inherit`,
		shell: true,
		env: process.env
	});

	const cleanup = () => {
		logger(`info`, `워치 모드 종료 중...`);
		swcProc.kill();
		aliasProc.kill();
		process.exit(0);
	};

	process.on(`SIGINT`, cleanup);
	process.on(`SIGTERM`, cleanup);

	swcProc.on(`close`, (code) => {
		code !== 0 && logger(`warn`, `swc 종료 (exit code: ${code})`);
	});

	aliasProc.on(`close`, (code) => {
		code !== 0 && logger(`warn`, `tsc-alias 종료 (exit code: ${code})`);
	});

	logger(`success`, `워치 모드 실행 중`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: swc.cjs (인자: ${argv.join(` `) || `none`})`);

	try {
		isCompile ? (() => {
			compile();
		})() : isWatch ? (() => {
			watch();
		})() : (() => {
			logger(`error`, `올바른 인자를 사용하세요: --compile 또는 --watch`);
			process.exit(1);
		})();
	}
	catch (e) {
		logger(`error`, `스크립트 실행 실패: ${e.message}`);
		process.exit(1);
	}
})();