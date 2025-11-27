/**
 * @file swc.cjs
 * @since 2025-11-22
 */

const { spawn } = require(`child_process`);
const process = require(`process`);
const { logger, runCmd, validateDir, delDir, getProjectType } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `swc.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--start`, `--build`].includes(arg))?.replace(`--`, ``) || ``;
const args3 = argv.find(arg => [`--server`, `--client`].includes(arg))?.replace(`--`, ``) || ``;

// 빌드 실행 (build-server / build-client) -------------------------------------------------------
const runBuild = (target = ``) => {
	const modeLabel = target === `server` ? `build-server`
		: target === `client` ? `build-client`
		: `build-unknown`;

	logger(`info`, `${modeLabel} 모드 시작`);

	const { isClient, isServer, hasVite, hasNext } = getProjectType(args3);

	const isClientMode = target === `client`;
	const isServerMode = target === `server`;

	!isClientMode && !isServerMode && (
		logger(`error`, `빌드 대상(target)을 지정해주세요: server 또는 client`),
		process.exit(1)
	);

	isClientMode && !isClient && (
		logger(`error`, `build-client 모드는 클라이언트 프로젝트에서만 사용 가능합니다`),
		process.exit(1)
	);

	isServerMode && !isServer && (
		logger(`error`, `build-server 모드는 서버 프로젝트에서만 사용 가능합니다`),
		process.exit(1)
	);

	const outDir = validateDir([`out`, `dist`, `build`]);
	delDir(outDir);

	try {
		isClientMode ? (
			hasVite ? (
				args1 === `npm` ? (
					runCmd(args1, [`exec`, `--`, `vite`, `build`])
				) : args1 === `pnpm` ? (
					runCmd(args1, [`exec`, `vite`, `build`])
				) : args1 === `yarn` ? (
					runCmd(args1, [`vite`, `build`])
				) : args1 === `bun` ? (
					runCmd(args1, [`x`, `vite`, `build`])
				) : (
					null
				)
			) : hasNext ? (
				args1 === `npm` ? (
					runCmd(args1, [`exec`, `--`, `next`, `build`])
				) : args1 === `pnpm` ? (
					runCmd(args1, [`exec`, `next`, `build`])
				) : args1 === `yarn` ? (
					runCmd(args1, [`next`, `build`])
				) : args1 === `bun` ? (
					runCmd(args1, [`x`, `next`, `build`])
				) : (
					null
				)
			) : (
				logger(`error`, `클라이언트 빌드 도구를 찾을 수 없습니다`),
				process.exit(1)
			)
		) : isServerMode ? (
			(() => {
				const tsCfg = validateDir([`tsconfig.json`, `tsconfig.build.json`]);
				const swcCfg = validateDir([`.swcrc`, `.swcrc.json`]);

				!tsCfg && (
					logger(`error`, `tsconfig 파일을 찾을 수 없습니다`),
					process.exit(1)
				);

				const baseSwcArgs = [`src`, `-d`, outDir, `--strip-leading-paths`];
				swcCfg && baseSwcArgs.push(`--config-file`, swcCfg);

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
			})()
		) : (
			null
		);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${modeLabel} 모드 실패: ${msg}`);
		throw e;
	}

	logger(`success`, `${modeLabel} 모드 완료`);
};

// 스타트 모드 (start-server / start-client) ----------------------------------------------------
const runStart = (target = ``) => {
	const modeLabel = target === `server` ? `start-server`
		: target === `client` ? `start-client`
		: `start-unknown`;

	logger(`info`, `${modeLabel} 모드 시작`);

	const { isClient, isServer, hasVite, hasNext, hasReactScripts, hasIndexTs } = getProjectType(args3);

	const isClientMode = target === `client`;
	const isServerMode = target === `server`;

	!isClientMode && !isServerMode && (
		logger(`error`, `스타트 대상(target)을 지정해주세요: server 또는 client`),
		process.exit(1)
	);

	isClientMode && !isClient && (
		logger(`error`, `start-client 모드는 클라이언트 프로젝트에서만 사용 가능합니다`),
		process.exit(1)
	);

	isServerMode && !isServer && (
		logger(`error`, `start-server 모드는 서버 프로젝트에서만 사용 가능합니다`),
		process.exit(1)
	);

	const startArgs = isClientMode ? (
		hasVite ? (
			args1 === `npm` ? (
				[`exec`, `--`, `vite`, `dev`]
			) : args1 === `pnpm` ? (
				[`exec`, `vite`, `dev`]
			) : args1 === `yarn` ? (
				[`vite`, `dev`]
			) : args1 === `bun` ? (
				[`x`, `vite`, `dev`]
			) : (
				[]
			)
		) : hasNext ? (
			args1 === `npm` ? (
				[`exec`, `--`, `next`, `dev`]
			) : args1 === `pnpm` ? (
				[`exec`, `next`, `dev`]
			) : args1 === `yarn` ? (
				[`next`, `dev`]
			) : args1 === `bun` ? (
				[`x`, `next`, `dev`]
			) : (
				[]
			)
		) : hasReactScripts ? (
			args1 === `npm` ? (
				[`exec`, `--`, `react-scripts`, `start`]
			) : args1 === `pnpm` ? (
				[`exec`, `react-scripts`, `start`]
			) : args1 === `yarn` ? (
				[`react-scripts`, `start`]
			) : args1 === `bun` ? (
				[`x`, `react-scripts`, `start`]
			) : (
				[]
			)
		) : (
			logger(`error`, `클라이언트 개발 서버 도구를 찾을 수 없습니다`),
			process.exit(1)
		)
	) : isServerMode ? (
		hasIndexTs ? (
			args1 === `npm` ? (
				[`exec`, `--`, `tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
			) : args1 === `pnpm` ? (
				[`exec`, `tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
			) : args1 === `yarn` ? (
				[`tsx`, `watch`, `--clear-screen=false`, `--ignore`, `node_modules`, `index.ts`]
			) : args1 === `bun` ? (
				[`--watch`, `index.ts`]
			) : (
				[]
			)
		) : (
			logger(`error`, `서버 진입점 파일(index.ts)을 찾을 수 없습니다`),
			process.exit(1)
		)
	) : (
		[]
	);

	!startArgs.length && (
		logger(`error`, `시작 명령어를 생성할 수 없습니다`),
		process.exit(1)
	);

	const useShell = args1 !== `bun`;
	const startProc = spawn(args1, startArgs, {
		stdio: `inherit`,
		shell: useShell,
		env: process.env
	});

	const cleanup = () => {
		logger(`info`, `${modeLabel} 모드 종료 중...`);
		startProc.kill();
		process.exit(0);
	};

	process.on(`SIGINT`, cleanup);
	process.on(`SIGTERM`, cleanup);

	startProc.on(`close`, (code) => {
		const hasFail = code !== 0 && code !== null;
		hasFail && logger(`warn`, `${modeLabel} 프로세스 종료 (exit code: ${code})`);
	});

	logger(`success`, modeLabel === `start-client` ? `클라이언트 개발 서버 실행 중` : `서버 개발 모드 실행 중`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2 : ${args2 || `none`}`);
	logger(`info`, `전달된 인자 3 : ${args3 || `none`}`);

	!args1 && (
		logger(`error`, `패키지 매니저를 지정해주세요: --npm, --pnpm, --yarn, --bun`),
		process.exit(1)
	);

	!args2 && (
		logger(`error`, `실행 모드를 지정해주세요: --start, --build`),
		process.exit(1)
	);

	!args3 && (
		logger(`error`, `프로젝트 타입을 지정해주세요: --server, --client`),
		process.exit(1)
	);

	try {
		args2 === `build` ? (
			runBuild(args3)
		) : args2 === `start` ? (
			runStart(args3)
		) : (
			logger(`error`, `알 수 없는 실행 모드: ${args2}`),
			process.exit(1)
		);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();
