/**
 * @file swc.cjs
 * @since 2025-11-22
 */

const { spawn } = require(`child_process`);
const process = require(`process`);
const { logger, runCmd, validateDir, delDir } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `swc.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--compile`, `--watch`, `--start`, `--build`].includes(arg))?.replace(`--`, ``) || ``;

// 컴파일 실행 ----------------------------------------------------------------------------------
const runCompile  = () => {
	logger(`info`, `컴파일 시작`);

	const outDir = validateDir([`out`, `dist`, `build`]);
	delDir(outDir);

	const tsCfg = validateDir([`tsconfig.json`, `tsconfig.build.json`]);
	const swcCfg = validateDir([`.swcrc`, `.swcrc.json`]);
	const baseSwcArgs = [`src`, `-d`, outDir, `--strip-leading-paths`];
	swcCfg && baseSwcArgs.push(`--config-file`, swcCfg);

	try {
		args1 === `npm` && (
			runCmd(args1, [`exec`, `--`, `swc`, ...baseSwcArgs]),
			runCmd(args1, [`exec`, `--`, `tsc-alias`, `-p`, tsCfg, `-f`])
		);
		args1 === `pnpm` && (
			runCmd(args1, [`exec`, `swc`, ...baseSwcArgs]),
			runCmd(args1, [`exec`, `tsc-alias`, `-p`, tsCfg, `-f`])
		);
		args1 === `yarn` && (
			runCmd(args1, [`swc`, ...baseSwcArgs]),
			runCmd(args1, [`tsc-alias`, `-p`, tsCfg, `-f`])
		);
		args1 === `bun` && (
			runCmd(args1, [`x`, `swc`, ...baseSwcArgs]),
			runCmd(args1, [`x`, `tsc-alias`, `-p`, tsCfg, `-f`])
		);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `swc 컴파일 실패: ${msg}`);
		throw e;
	}

	logger(`success`, `컴파일 완료`);
};

// 빌드 실행 ------------------------------------------------------------------------------------
const runBuild = () => {
	logger(`info`, `빌드 시작`);

	try {
		args1 === `npm` && runCmd(args1, [`run`, `build`]);
		args1 === `pnpm` && runCmd(args1, [`run`, `build`]);
		args1 === `yarn` && runCmd(args1, [`build`]);
		args1 === `bun` && runCmd(args1, [`run`, `build`]);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `빌드 실패: ${msg}`);
		throw e;
	}

	logger(`success`, `빌드 완료`);
};

// 워치 모드 ----------------------------------------------------------------------------------
const runWatch = () => {
	logger(`info`, `워치 모드 시작`);

	const outDir = validateDir([`out`, `dist`, `build`]);
	const tsCfg = validateDir([`tsconfig.json`, `tsconfig.build.json`]);
	const swcCfg = validateDir([`.swcrc`, `.swcrc.json`]);

	const swcArgsBase = [`src`, `-d`, outDir, `--strip-leading-paths`, `--watch`];
	swcCfg && swcArgsBase.push(`--config-file`, swcCfg);

	const aliasArgsBase = [`tsc-alias`, `-p`, tsCfg, `-f`, `--watch`];

	const swcArgs = args1 === `npm` ? [`exec`, `--`, `swc`, ...swcArgsBase]
		: args1 === `pnpm` ? [`exec`, `swc`, ...swcArgsBase]
		: args1 === `yarn` ? [`swc`, ...swcArgsBase]
		: args1 === `bun` ? [`x`, `swc`, ...swcArgsBase] : [];

	const aliasArgs = args1 === `npm` ? [`exec`, `--`, ...aliasArgsBase]
		: args1 === `pnpm` ? [`exec`, ...aliasArgsBase]
		: args1 === `yarn` ? aliasArgsBase
		: args1 === `bun` ? [`x`, ...aliasArgsBase] : [];

	const useShell = args1 !== `bun`;

	const swcProc = spawn(args1, swcArgs, {
		stdio: `inherit`,
		shell: useShell,
		env: process.env
	});

	const aliasProc = spawn(args1, aliasArgs, {
		stdio: `inherit`,
		shell: useShell,
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
		const hasFail = code !== 0;
		hasFail && logger(`warn`, `swc 종료 (exit code: ${code})`);
	});

	aliasProc.on(`close`, (code) => {
		const hasFail = code !== 0;
		hasFail && logger(`warn`, `tsc-alias 종료 (exit code: ${code})`);
	});

	logger(`success`, `워치 모드 실행 중`);
};

// 스타트 모드 ----------------------------------------------------------------------------------
const runStart = () => {
	logger(`info`, `스타트 모드 시작`);

	const startArgs = args1 === `npm` ? (
		[`exec`, `--`, `tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
	) : args1 === `pnpm` ? (
		[`exec`, `tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
	) : args1 === `yarn` ? (
		[`tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
	) : args1 === `bun` ? (
		[`--watch`, `index.ts`]
	) : (
		[]
	);

	const startProc = spawn(args1, startArgs, {
		stdio: `inherit`,
		shell: false,
		env: process.env
	});

	const cleanup = () => {
		logger(`info`, `스타트 모드 종료 중...`);
		startProc.kill();
		process.exit(0);
	};

	process.on(`SIGINT`, cleanup);
	process.on(`SIGTERM`, cleanup);

	startProc.on(`close`, (code) => {
		const hasFail = code !== 0;
		hasFail && logger(`warn`, `tsx 종료 (exit code: ${code})`);
	});

	logger(`success`, `스타트 모드 실행 중`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || 'none'}`);
	logger(`info`, `전달된 인자 2 : ${args2 || 'none'}`);

	try {
		args2 === `compile` && runCompile();
		args2 === `build` && runBuild();
		args2 === `watch` && runWatch();
		args2 === `start` && runStart();
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();