/**
 * @file reset.mjs
 * @description 의존성 재설치 및 프로젝트 리셋 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-03
 */

import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { logger, delDir, delFile, runCmd } from '../lib/utils.mjs';

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [
	`--reset`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 시스템 준비 (대기) ---------------------------------------------------------------------
const prepareSystem = () => {
	logger(`info`, `시스템 준비 시작 (대기: 200ms)`);
	const start = Date.now();
	while (Date.now() - start < 200) {}

	logger(`success`, `대기 완료`);
};

// 3. 파일 정리 ------------------------------------------------------------------------------
const cleanup = () => {
	logger(`info`, `파일 삭제 시작`);
	const tgts = [
		{ "name": `node_modules`, "isDir": true },
		{ "name": `package-lock.json`, "isDir": false },
		{ "name": `bun.lockb`, "isDir": false },
		{ "name": `yarn.lock`, "isDir": false },
		{ "name": `pnpm-lock.yaml`, "isDir": false },
		{ "name": `pnpm-workspace.yaml`, "isDir": false },
	];

	tgts.forEach((tgt, idx) => {
		logger(`info`, `${idx + 1}/${tgts.length}: ${tgt.name} 확인 중`);

		try {
			tgt.isDir ? delDir(tgt.name) : delFile(tgt.name);
		}
		catch (e) {
			const errMsg = e instanceof Error ? e.message : String(e);
			logger(`error`, `${tgt.name} 삭제 실패: ${errMsg}`);
			throw e;
		}
	});
	logger(`success`, `파일 삭제 완료`);
};

// 4. 패키지매니저 설치 ----------------------------------------------------------------------
const installPmg = (mgr = ``) => {
	logger(`info`, `${mgr}로 의존성 설치 시도`);
	try {
		runCmd(mgr, [
			`install`,
		]);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${mgr}로 의존성 설치 실패: ${errMsg}`);
		throw e;
	}

	logger(`success`, `${mgr}로 의존성 설치 완료`);
};

// 5. 리셋 프로세스 실행 ---------------------------------------------------------------------
const runResetProcess = (mgr = ``) => {
	prepareSystem();
	cleanup();
	installPmg(mgr);
	logger(`success`, `프로젝트 리셋 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
void (async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args1 && runResetProcess(args1);
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
