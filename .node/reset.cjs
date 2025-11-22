/**
 * @file reset.cjs
 * @since 2025-11-22
 */

const { logger, delDir, delFile, runCmd } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `reset.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--reset`].includes(arg))?.replace(`--`, ``) || ``;

// 1. 시스템 준비 (대기) ---------------------------------------------------------------------
const prepareSystem = () => {
	logger(`info`, `시스템 준비 시작 (대기: ${200}ms)`);

	const start = Date.now();
	while (Date.now() - start < 200) {}

	logger(`success`, `대기 완료`);
};

// 2. 파일 정리 ------------------------------------------------------------------------------
const cleanup = () => {
	logger(`info`, `파일 삭제 시작`);

	const tgts = [
		{ name: `node_modules`, isDir: true },
		{ name: `package-lock.json`, isDir: false },
		{ name: `bun.lockb`, isDir: false },
		{ name: `yarn.lock`, isDir: false },
		{ name: `pnpm-lock.yaml`, isDir: false },
		{ name: `pnpm-workspace.yaml`, isDir: false }
	];
	tgts.forEach((tgt, idx) => {
		logger(`info`, `${idx + 1}/${tgts.length}: ${tgt.name} 확인 중`);

		try {
			tgt.isDir ? (
				delDir(tgt.name)
			) : (
				delFile(tgt.name)
			);
		}
		catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			logger(`error`, `${tgt.name} 삭제 실패: ${msg}`);
			throw e;
		}
	});

	logger(`success`, `파일 삭제 완료`);
};

// 4. 패키지매니저 설치 ----------------------------------------------------------------------------
const installPmg = (mgr = ``) => {
	logger(`info`, `${mgr}로 의존성 설치 시도`);

	try {
		mgr === `npm` && runCmd(`npm`, [`install`]);
		mgr === `pnpm` && runCmd(`pnpm`, [`install`]);
		mgr === `yarn` && runCmd(`yarn`, [`install`]);
		mgr === `bun` && runCmd(`bun`, [`install`]);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${mgr}로 의존성 설치 실패: ${msg}`);
		throw e;
	}

	logger(`success`, `${mgr}로 의존성 설치 완료`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || 'none'}`);
	logger(`info`, `전달된 인자 2 : ${args2 || 'none'}`);

	try {
		[`npm`, `pnpm`, `yarn`, `bun`].includes(args1) && (() => {
			prepareSystem();
			cleanup();
			installPmg(args1);
			logger(`success`, `프로젝트 리셋 완료`);
		})();
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();
