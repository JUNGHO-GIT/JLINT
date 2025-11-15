// reset.cjs

const { spawnSync } = require("child_process");
const { rmSync, existsSync } = require("fs");
const { join } = require("path");

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

// 1. 시스템 준비 (대기) ---------------------------------------------------------------------
const prepareSystem = () => {
	logger(`info`, `시스템 준비 시작 (대기: 200ms)`);

	const start = Date.now();
	while (Date.now() - start < 200) {}

	logger(`success`, `대기 완료`);
};

// 2. 파일 정리 ------------------------------------------------------------------------------
const cleanup = () => {
	logger(`info`, `파일 삭제 시작`);
	const targets = [
		`node_modules`, `package-lock.json`, `bun.lock`,
		`yarn.lock`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
	];
	targets.forEach((target, index) => {
		const targetPath = join(process.cwd(), target);
		logger(`info`, `${index + 1}/6: ${target} 확인 중`);

		try {
			existsSync(targetPath) ? (
				logger(`info`, `삭제: ${target}`),
				rmSync(targetPath, { recursive: true, force: true }),
				logger(`success`, `${target} 삭제 완료`)
			) : (
				logger(`info`, `${target} 존재하지 않음 - 건너뜀`)
			);
		}
		catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			logger(`error`, `${target} 삭제 실패: ${msg}`);
			throw e;
		}
	});

	logger(`success`, `파일 삭제 완료`);
};

// 3. 명령 실행 함수 ------------------------------------------------------------------------------
// @ts-ignore
const runCommand = (cmd=``, args=[]) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: true
	});

	result.error && (() => {
		logger(`error`, `${cmd} 실행 오류: ${result.error.message}`);
		throw new Error(`${cmd} failed: ${result.error.message}`);
	})();

	result.status !== 0 && (() => {
		logger(`error`, `${cmd} 종료 코드: ${result.status}`);
		throw new Error(`${cmd} exited with code ${result.status}`);
	})();

	logger(`success`, `${cmd} 실행 성공`);
};

// 4. 패키지매니저 설치 ----------------------------------------------------------------------------
const installWithPkgManager = (manager=``) => {
	logger(`info`, `${manager}로 의존성 설치 시도`);

	manager === `npm` ? (
		runCommand(`npm`, [`install`])
	)
	: manager === `pnpm` ? (
		runCommand(`pnpm`, [`install`])
	)
	: manager === `yarn` ? (
		runCommand(`yarn`, [`install`])
	)
	: manager === `bun` ? (
		runCommand(`bun`, [`install`])
	)
	: (() => {
		throw new Error(`알 수 없는 패키지 매니저: ${manager}`);
	})();

	logger(`success`, `${manager}로 의존성 설치 완료`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: reset.cjs (인자: ${args1 || `none`})`);
	try {
		prepareSystem();
		cleanup();
		installWithPkgManager(args1);
		logger(`success`, `프로젝트 리셋 완료`);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `프로젝트 리셋 실패: ${msg}`);
		process.exit(1);
	}
})();