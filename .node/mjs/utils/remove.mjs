/**
 * @file remove.mjs
 * @description env.mjs에 정의된 삭제 대상 파일/폴더를 삭제하는 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-07
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { logger, delDir, delFile } from "../../lib/utils.mjs";
import { env } from "../../lib/env.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const clearList = env.clearFiles;
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
  `--npm`,
  `--pnpm`,
  `--yarn`,
  `--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [`--remove`].includes(arg))?.replace(`--`, ``) || ``;

// 2. 파일 정리 ------------------------------------------------------------------------------
const cleanup = () => {
  logger(`info`, `파일 삭제 시작`);

  (!Array.isArray(clearList) || clearList.length === 0) && (() => {
    logger(`warn`, `삭제 대상 목록이 비어 있습니다 (env.cleanup.clearFiles)`);
  })();

  Array.isArray(clearList) && clearList.length > 0 && (() => {
    clearList.forEach((tgt, idx) => {
      try {
        logger(`info`, `${idx + 1}/${clearList.length}: ${tgt.name} 확인 중`);
        const isFile = (tgt.type === `file`);
        const isFolder = (tgt.type === `folder`);
        isFile && delFile(tgt.name);
        isFolder && delDir(tgt.name);
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger(`error`, `${tgt.name} 삭제 실패: ${errMsg}`);
        throw error;
      }
    });
  })();

  logger(`success`, `파일 삭제 완료`);
};

// 3. 클리어 프로세스 실행 -------------------------------------------------------------------
const runClearProcess = () => {
  cleanup();
  logger(`success`, `클리어 프로세스 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
  try {
    logger(`info`, `스크립트 실행: ${TITLE}`);
    logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
    logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
    // logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
  }
  catch {
    logger(`warn`, `인자 파싱 오류 발생`);
    process.exit(0);
  }
  try {
    args2 === `remove` && runClearProcess();
    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
    process.exit(1);
  }
})();
