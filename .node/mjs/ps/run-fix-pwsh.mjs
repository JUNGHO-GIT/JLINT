/**
 * @file run-fix-pwsh.mjs
 * @description Windows registry certificate timeout fix script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const registryPath = `HKLM\\SOFTWARE\\Policies\\Microsoft\\SystemCertificates\\ChainEngine\\Config`;
const timeoutValue = 1000;

// 2. 레지스트리 수정 -------------------------------------------------------------------------
const run1 = () => {
  try {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `▶ 레지스트리 수정을 시작합니다.`);

    execSync(
      `reg add "${registryPath}" /v ChainUrlRetrievalTimeoutMilliseconds /t REG_DWORD /d ${timeoutValue} /f`,
      { stdio: `pipe` },
    );

    execSync(
      `reg add "${registryPath}" /v ChainRevAccumulativeUrlRetrievalTimeoutMilliseconds /t REG_DWORD /d ${timeoutValue} /f`,
      { stdio: `pipe` },
    );

    ui.printLine(`Green`);
    ui.printText(`Green`, `✓ 레지스트리 수정이 완료되었습니다.`);
    ui.printText(`Cyan`, `  경로: ${registryPath}`);
    ui.printText(`Cyan`, `  ChainUrlRetrievalTimeoutMilliseconds = ${timeoutValue}`);
    ui.printText(`Cyan`, `  ChainRevAccumulativeUrlRetrievalTimeoutMilliseconds = ${timeoutValue}`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printLine(`Red`);
    ui.printText(`Red`, `! 오류가 발생하여 작업을 종료합니다.`);
    ui.printText(`Red`, errMsg);
    process.exit(1);
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  run1();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
