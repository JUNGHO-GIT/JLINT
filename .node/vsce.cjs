// vsce.cjs

const { spawnSync } = require(`child_process`);
const fs = require(`fs`);
const path = require(`path`);
const process = require(`process`);

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

// 버전 증가 함수 ------------------------------------------------------------------------------
const incrementVersion = () => {
	logger(`info`, `버전 자동 증가 시작`);

	const packageJsonPath = path.join(process.cwd(), `package.json`);

	!fs.existsSync(packageJsonPath) && (() => {
		logger(`error`, `package.json 파일을 찾을 수 없습니다: ${packageJsonPath}`);
		process.exit(1);
	})();

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, `utf8`));
	const currentVersion = packageJson.version;

	!currentVersion && (() => {
		logger(`error`, `package.json에 version 필드가 없습니다`);
		process.exit(1);
	})();

	const versionParts = currentVersion.split(`.`);
	versionParts.length !== 3 && (() => {
		logger(`error`, `올바르지 않은 버전 형식입니다: ${currentVersion}`);
		process.exit(1);
	})();

	const [major, minor, patch] = versionParts.map(Number);
	const newVersion = `${major}.${minor}.${patch + 1}`;

	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + `\n`, `utf8`);

	logger(`success`, `버전 업데이트: ${currentVersion} → ${newVersion}`);
	return newVersion;
};

// 명령 실행 함수 ------------------------------------------------------------------------------
const runCommand = (cmd=``, args=[], stepName=``) => {
	logger(`info`, `${stepName} 시작`);
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: true,
		cwd: process.cwd()
	});

	result.status !== 0 && (() => {
		logger(`error`, `${stepName} 실패 (exit code: ${result.status})`);
		process.exit(1);
	})();

	logger(`success`, `${stepName} 완료`);
	return result;
};

// 메인 실행 함수 ------------------------------------------------------------------------------
(() => {
	logger(`info`, `VSCE 패키지 빌드 시작`);
	incrementVersion();

	// out 디렉토리 초기화
	(() => {
		const outDir = path.join(process.cwd(), `out`);
		fs.existsSync(outDir) && (() => {
			fs.rmSync(outDir, { recursive: true, force: true });
			logger(`info`, `기존 out 디렉토리 삭제 완료`);
		})();
	})();

	// swc로 컴파일 (swc.cjs와 동일한 방식)
	runCommand(
		`pnpm`,
		[`exec`, `swc`, `src`, `-d`, `out`, `--source-maps`, `--strip-leading-paths`],
		`SWC 컴파일`
	);

	// tsc-alias로 경로 별칭 처리
	runCommand(
		`pnpm`,
		[`exec`, `tsc-alias`, `-p`, `tsconfig.json`],
		`TypeScript 경로 별칭 처리`
	);

	// vsce 패키지 생성
	runCommand(
		`vsce`,
		[`package`, `--no-dependencies`],
		`VSCE 패키지 생성`
	);

	logger(`success`, `VSCE 패키지 빌드 완료`);
})();