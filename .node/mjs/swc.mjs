/**
 * @file swc.mjs
 * @description SWC 컴파일 및 빌드 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-03
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { logger, runCmd, validateDir, delDir, getProjectType, getPmArgs } from "../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [
	`--watch`,
	`--start`,
	`--compile`,
	`--build`,
].includes(arg))?.replace(`--`, ``) ?? ``;
const args3 = argv.find((arg) => [
	`--server`,
	`--client`,
].includes(arg))?.replace(`--`, ``) ?? ``;

// 3. swc 설정 파일 조회 ----------------------------------------------------------------------
const getSwcConfig = () => {
	const cwd = process.cwd();
	const configName = args3 === `client` ? `.client.swcrc` : `.server.swcrc`;
	const configPath = path.resolve(cwd, configName);
	const result = fs.existsSync(configPath) ? configPath : null;
	return result;
};

// 3. 명령 실행 ------------------------------------------------------------------------------
const spawnProcess = (pmArgs = []) => {
	const useShell = args1 !== `bun`;
	const result = spawn(args1, pmArgs, {
		stdio: `inherit`,
		shell: useShell,
		env: process.env,
	});
	return result;
};

// 4. 컴파일 실행 ----------------------------------------------------------------------------
const runCompile = () => {
	logger(`info`, `컴파일 시작`);

	const { isServer } = getProjectType(args3);
	const outDir = validateDir([
		`out`,
		`dist`,
		`build`,
	]);
	const tsCfg = validateDir([
		`tsconfig.json`,
		`tsconfig.build.json`,
	]);
	const swcCfg = getSwcConfig();
	const baseSwcArgs = [
		`swc`,
		`src`,
		`-d`,
		outDir,
		`--strip-leading-paths`,
	];

	// 유효성 검사 및 실행
	!isServer && (() => {
		logger(`error`, `컴파일 모드는 서버 프로젝트에서만 사용 가능합니다`);
		process.exit(1);
	})();
	!tsCfg && (() => {
		logger(`error`, `tsconfig 파일을 찾을 수 없습니다`);
		process.exit(1);
	})();

	delDir(outDir);
	swcCfg && baseSwcArgs.push(`--config-file`, swcCfg);

	return (async () => {
		try {
			runCmd(args1, getPmArgs(args1, baseSwcArgs));
			runCmd(args1, getPmArgs(args1, [
				`tsc-alias`,
				`-p`,
				tsCfg,
				`-f`,
			]));
			logger(`success`, `컴파일 완료`);
		}
		catch (error) {
			const errMsg = error instanceof Error ? error.message : String(error);
			logger(`error`, `swc 컴파일 실패: ${errMsg}`);
			throw error;
		}
	})();
};

// 5. 빌드 실행 ------------------------------------------------------------------------------
const runBuild = () => {
	logger(`info`, `빌드 시작`);

	const {
		isClient, isServer, hasVite, hasNext,
	} = getProjectType(args3);
	const outDir = validateDir([
		`out`,
		`dist`,
		`build`,
	]);

	delDir(outDir);

	isClient && (() => {
		try {
			hasVite && runCmd(args1, getPmArgs(args1, [
				`vite`,
				`build`,
			]));

			hasNext && runCmd(args1, getPmArgs(args1, [
				`next`,
				`build`,
			]));

			!(hasVite || hasNext) && (() => {
				logger(`error`, `클라이언트 빌드 도구를 찾을 수 없습니다`);
				process.exit(1);
			})();
		}
		catch (error) {
			const errMsg = error instanceof Error ? error.message : String(error);
			logger(`error`, `클라이언트 빌드 실패: ${errMsg}`);
			throw error;
		}
	})();

	isServer && (() => {
		try {
			runCompile();
		}
		catch (error) {
			const errMsg = error instanceof Error ? error.message : String(error);
			logger(`error`, `서버 빌드 실패: ${errMsg}`);
			throw error;
		}
	})();
};

// 6. 워치 모드 ------------------------------------------------------------------------------
const runWatch = () => {
	logger(`info`, `워치 모드 시작`);

	const { isServer } = getProjectType(args3);
	const outDir = validateDir([
		`out`,
		`dist`,
		`build`,
	]);
	const tsCfg = validateDir([
		`tsconfig.json`,
		`tsconfig.build.json`,
	]);
	const swcCfg = getSwcConfig();

	isServer ? (() => {
		const swcBase = [
			`swc`,
			`src`,
			`-d`,
			outDir,
			`--strip-leading-paths`,
			`--watch`,
		];
		swcCfg && swcBase.push(`--config-file`, swcCfg);

		const swcProc = spawnProcess(getPmArgs(args1, swcBase));
		const aliasProc = spawnProcess(getPmArgs(args1, [
			`tsc-alias`,
			`-p`,
			tsCfg,
			`-f`,
			`--watch`,
		]));

		const cleanup = () => {
			logger(`info`, `워치 모드 종료 중...`);
			swcProc.kill();
			aliasProc.kill();
			process.exit(0);
		};

		process.on(`SIGINT`, cleanup);
		process.on(`SIGTERM`, cleanup);
		swcProc.on(`close`, (code) => code && code !== 0 && logger(`warn`, `swc 종료 (exit code: ${code})`));
		aliasProc.on(`close`, (code) => code && code !== 0 && logger(`warn`, `tsc-alias 종료 (exit code: ${code})`));

		logger(`success`, `워치 모드 실행 중`);
	})() : (() => {
		logger(`error`, `tsconfig 파일을 찾을 수 없습니다`);
		process.exit(1);
	})();
};

// 7. 스타트 모드 ----------------------------------------------------------------------------
const runStart = () => {
	logger(`info`, `스타트 모드 시작`);

	const {
		isClient, isServer, hasVite, hasNext, hasReactScripts, hasIndexTs,
	} = getProjectType(args3);

	// 클라이언트 인자 구성
	const clientArgs = isClient ? (hasVite ? getPmArgs(args1, [
		`vite`,
		`dev`,
	]) : hasNext ? getPmArgs(args1, [
		`next`,
		`dev`,
	]) : hasReactScripts ? getPmArgs(args1, [
		`react-scripts`,
		`start`,
	]) : null) : null;

	// 서버 인자 구성
	const serverArgs = isServer && hasIndexTs ? (args1 === `bun` ? [
		`--watch`,
		`index.ts`,
	] : getPmArgs(args1, [
		`tsx`,
		`watch`,
		`--clear-screen=false`,
		`--ignore`,
		`node_modules`,
		`index.ts`,
	])) : null;

	const startArgs = clientArgs || serverArgs;

	// 실행 로직
	(isClient && !clientArgs) && (() => {
		logger(`error`, `클라이언트 개발 서버 도구를 찾을 수 없습니다`);
		process.exit(1);
	})();

	(isServer && !serverArgs) && (() => {
		logger(`error`, `서버 진입점 파일(index.ts)을 찾을 수 없습니다`);
		process.exit(1);
	})();

	startArgs ? (() => {
		const startProc = spawnProcess(startArgs);
		const cleanup = () => {
			logger(`info`, `스타트 모드 종료 중...`);
			startProc.kill();
			process.exit(0);
		};

		process.on(`SIGINT`, cleanup);
		process.on(`SIGTERM`, cleanup);
		startProc.on(`close`, (code) => code && code !== 0 && logger(`warn`, `start 프로세스 종료 (exit code: ${code})`));

		const modeMsg = isClient ? `클라이언트 개발 서버 ��행 중` : `서버 개발 모드 실행 중`;
		logger(`success`, modeMsg);
	})() : (() => {
		logger(`error`, `실행할 수 있는 모드를 찾을 수 없습니다`);
		process.exit(1);
	})();
};

// 99. 메인 실행 -----------------------------------------------------------------------------
(() => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
		logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `compile` && runCompile();
		args2 === `build` && runBuild();
		args2 === `watch` && runWatch();
		args2 === `start` && runStart();

		const isKeepAlive = args2 === `watch` || args2 === `start`;
		!isKeepAlive && (() => {
			logger(`info`, `스크립트 정상 종료: ${TITLE}`);
			process.exit(0);
		})();
	}
	catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
