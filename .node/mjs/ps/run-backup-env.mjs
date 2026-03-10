/**
 * @file run-backup-env.mjs
 * @description Environment variable backup script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const outputPath = path.join(envPaths.outputDir, `env_variables.txt`);

// 2. 환경변수 백업 --------------------------------------------------------------------------
const run1 = () => {
  try {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `▶ 환경변수 백업 시작`);

    // 기존 파일이 있으면 삭제
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // 출력 디렉터리가 없으면 생성
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 환경변수를 파일에 저장
    const lines = Object.entries(process.env)
    .map(([ key, value ]) => `${key}=${value}`)
    .join(`\n`);

    fs.writeFileSync(outputPath, lines, `utf8`);

    ui.printLine(`Green`);
    ui.printText(`Green`, `✓ 환경변수들이 ${outputPath} 에 저장되었습니다.`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printLine(`Red`);
    ui.printText(`Red`, `! 환경변수 백업 중 오류가 발생했습니다: ${errMsg}`);
    ui.printText(`Red`, `! 프로세스를 종료합니다.`);
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
