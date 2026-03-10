/**
 * @file script-runtime.mjs
 * @description ps common runtime wrapper (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { logger } from "../../lib/utils.mjs";

// 1. 공통 유틸 ------------------------------------------------------------------------------
export const getScriptTitle = (importMetaUrl = ``) => {
  const scriptPath = fileURLToPath(importMetaUrl);
  const scriptTitle = path.basename(scriptPath);
  const result = scriptTitle;
  return result;
};

export const getErrorMessage = (error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const result = errorMessage;
  return result;
};

// 2. 공통 실행 래퍼 -------------------------------------------------------------------------
export const runScript = async (importMetaUrl = ``, execute = async () => {}) => {
  const scriptTitle = getScriptTitle(importMetaUrl);

  try {
    logger(`info`, `스크립트 실행: ${scriptTitle}`);
    await execute();
    logger(`info`, `스크립트 정상 종료: ${scriptTitle}`);
    process.exit(0);
  }
  catch (error) {
    const errorMessage = getErrorMessage(error);
    logger(`error`, `${scriptTitle} 스크립트 실행 실패: ${errorMessage}`);
    process.exit(1);
  }
};
