/**
 * @file swc.cjs
 * @since 2025-11-22
 */

const { spawn } = require(`child_process`);
const process = require(`process`);
const { logger, runCmd, validateDir, delDir, getProjectType } = require(`./utils.cjs`);

// 인자 파싱 ---------------------------------------------------------------------------------
const TITLE = `swc.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) ?? ``;
const args2 = argv.find(arg => [`--watch`, `--start`, `--compile`, `--build`].includes(arg))?.replace(`--`, ``) ?? ``;
const args3 = argv.find(arg => [`--server`, `--client`].includes(arg))?.replace(`--`, ``) ?? ``;

// 패키지 매니저별 명령어 생성 헬퍼 -----------------------------------------------------------
const getPmArgs = (baseArgs=[], options={}) => {
	const { execPrefix = true } = options;

	return args1 === `npm` ? (
		execPrefix ? [`exec`, `--`, ...baseArgs] : baseArgs
	) : args1 === `pnpm` ? (
		execPrefix ? [`exec`, ...baseArgs] : baseArgs
	) : args1 === `yarn` ? (
		baseArgs
	) : args1 === `bun` ? (
		[`x`, ...baseArgs]
	) : (
		[]
	);
};

// 컴파일 실행 -------------------------------------------------------------------------------
const runCompile = () => {
	logger(`info`, `컴파일 시작`);

	const { isServer } = getProjectType(args3);
	!isServer && (logger(`error`, `컴파일 모드는 서버 프로젝트에서만 사용 가능합니다`), process.exit(1));

	const outDir = validateDir([`out`, `dist`, `build`]);
	delDir(outDir);

	const tsCfg = validateDir([`tsconfig.json`, `tsconfig.build.json`]);
	const swcCfg = validateDir([`.swcrc`, `.swcrc.json`]);
	!tsCfg && (logger(`error`, `tsconfig 파일을 찾을 수 없습니다`), process.exit(1));

	const baseSwcArgs = [`swc`, `src`, `-d`, outDir, `--strip-leading-paths`];
	swcCfg && baseSwcArgs.push(`--config-file`, swcCfg);

	try {
		runCmd(args1, getPmArgs(baseSwcArgs));
		runCmd(args1, getPmArgs([`tsc-alias`, `-p`, tsCfg, `-f`]));
	}
	catch (e) {
		logger(`error`, `swc 컴파일 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}

	logger(`success`, `컴파일 완료`);
};

// 빌드 실행 ---------------------------------------------------------------------------------
const runBuild = () => {
	logger(`info`, `빌드 시작`);

	const { isClient, isServer, hasVite, hasNext } = getProjectType(args3);
	const outDir = validateDir([`out`, `dist`, `build`]);
	delDir(outDir);

	try {
		isClient && hasVite && runCmd(args1, getPmArgs([`vite`, `build`]));
		isClient && !hasVite && hasNext && runCmd(args1, getPmArgs([`next`, `build`]));
		isClient && !hasVite && !hasNext && (
			logger(`error`, `클라이언트 빌드 도구를 찾을 수 없습니다`),
			process.exit(1)
		);
		isServer && runCompile();
	}
	catch (e) {
		logger(`error`, `빌드 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}

	logger(`success`, `빌드 완료`);
};

// 프로세스 생성 헬퍼 ------------------------------------------------------------------------
const spawnProcess = (pmArgs=[]) => {
	const useShell = args1 !== `bun`;
	return spawn(args1, pmArgs, { stdio: `inherit`, shell: useShell, env: process.env });
};

// 워치 모드 ---------------------------------------------------------------------------------
const runWatch = () => {
	logger(`info`, `워치 모드 시작`);

	const { isServer } = getProjectType(args3);
	!isServer && (logger(`error`, `워치 모드는 서버 프로젝트에서만 사용 가능합니다`), process.exit(1));

	const outDir = validateDir([`out`, `dist`, `build`]);
	const tsCfg = validateDir([`tsconfig.json`, `tsconfig.build.json`]);
	const swcCfg = validateDir([`.swcrc`, `.swcrc.json`]);
	!tsCfg && (logger(`error`, `tsconfig 파일을 찾을 수 없습니다`), process.exit(1));

	const swcBase = [`swc`, `src`, `-d`, outDir, `--strip-leading-paths`, `--watch`];
	swcCfg && swcBase.push(`--config-file`, swcCfg);

	const swcProc = spawnProcess(getPmArgs(swcBase));
	const aliasProc = spawnProcess(getPmArgs([`tsc-alias`, `-p`, tsCfg, `-f`, `--watch`]));

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
};

// 스타트 모드 -------------------------------------------------------------------------------
const runStart = () => {
	logger(`info`, `스타트 모드 시작`);

	const { isClient, isServer, hasVite, hasNext, hasReactScripts, hasIndexTs } = getProjectType(args3);

	const clientArgs = isClient && (
		hasVite ? getPmArgs([`vite`, `dev`])
			: hasNext ? getPmArgs([`next`, `dev`])
			: hasReactScripts ? getPmArgs([`react-scripts`, `start`])
			: null
	);

	const serverArgs = isServer && hasIndexTs && (
		args1 === `bun`
			? [`--watch`, `index.ts`]
			: getPmArgs([`tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`])
	);

	isClient && !clientArgs && (
		logger(`error`, `클라이언트 개발 서버 도구를 찾을 수 없습니다`),
		process.exit(1)
	);

	isServer && !serverArgs && (
		logger(`error`, `서버 진입점 파일(index.ts)을 찾을 수 없습니다`),
		process.exit(1)
	);

	const startArgs = clientArgs || serverArgs || [];
	!startArgs.length && (logger(`error`, `시작 명령어를 생성할 수 없습니다`), process.exit(1));

	const startProc = spawnProcess(startArgs);

	const cleanup = () => {
		logger(`info`, `스타트 모드 종료 중...`);
		startProc.kill();
		process.exit(0);
	};

	process.on(`SIGINT`, cleanup);
	process.on(`SIGTERM`, cleanup);
	startProc.on(`close`, (code) => code && code !== 0 && logger(`warn`, `start 프로세스 종료 (exit code: ${code})`));

	logger(`success`, isClient ? `클라이언트 개발 서버 실행 중` : `서버 개발 모드 실행 중`);
};

// 실행 --------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	logger(`info`, `전달된 인자 3: ${args3 || `none`}`);

	!args1 && (logger(`error`, `패키지 매니저를 지정해주세요: --npm, --pnpm, --yarn, --bun`), process.exit(1));
	!args2 && (logger(`error`, `실행 모드를 지정해주세요: --watch, --start, --compile, --build`), process.exit(1));
	!args3 && (logger(`error`, `프로젝트 타입을 지정해주세요: --server, --client`), process.exit(1));

	try {
		args2 === `compile` ? runCompile()
			: args2 === `build` ? runBuild()
			: args2 === `watch` ? runWatch()
			: args2 === `start` ? runStart()
			: (logger(`error`, `알 수 없는 실행 모드: ${args2}`), process.exit(1));
	}
	catch (e) {
		logger(`error`, `스크립트 실행 실패: ${e instanceof Error ? e.message : String(e)}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();