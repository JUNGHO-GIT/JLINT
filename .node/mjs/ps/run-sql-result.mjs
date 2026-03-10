/**
 * @file run-sql-result.mjs
 * @description SQL query result wrapper script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const projectPath = envPaths.workspaceNodeJnode;
const exePath = `src/public/node/mjs/sql-result.mjs`;
let sqlInput = ``;
let sqlFilePath = ``;

// 2. SQL 결과 추출 -------------------------------------------------------------------------
const run1 = async () => {
  ui.printLine(`Green`);
  ui.printText(`Green`, `▶ 실행할 SELECT 쿼리를 그대로 복사/붙여넣기 하세요.`);
  ui.printText(`Green`, `▶ 입력을 마치려면 마지막 줄에서 한 번 더 엔터(빈 줄) 를 입력하세요.`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lines = [];

  const result = await new Promise((resolve) => {
    rl.on(`line`, (line) => {
      if (line.trim() === ``) {
        rl.close();
        resolve(lines);
      }
      else {
        lines.push(line);
      }
    });
  });

  sqlInput = result.join(os.EOL).trim();

  if (sqlInput === ``) {
    ui.printText(`Red`, `! 입력된 쿼리가 없습니다. 프로세스를 종료합니다.`);
    await ui.printContinue(getFileName());
  }

  sqlFilePath = path.join(os.tmpdir(), `sql_input_${Date.now()}.tmp`);
  fs.writeFileSync(sqlFilePath, sqlInput, `utf8`);

  ui.printText(`Green`, `▶ 입력된 SQL 저장 완료`);
  ui.printText(`Green`, `▶ 임시 SQL 파일: [${sqlFilePath}]`);
};

const run2 = () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ js 파일 실행`);

  try {
    ui.printText(`Yellow`, `▶ 작업 경로: [${projectPath}]`);
    ui.printText(`Yellow`, `▶ 실행 파일: [${exePath}]`);
    ui.printText(`Yellow`, `▶ 현재 위치: [${process.cwd()}]`);

    let bunCmd = `bun`;
    try {
      execSync(`which bun`, { stdio: `pipe` });
    }
    catch {
      bunCmd = envPaths.bunPath;
    }

    ui.printText(`Yellow`, `▶ bun 경로: [${bunCmd}]`);

    const scriptPath = path.join(projectPath, exePath);
    const output = execSync(`"${bunCmd}" "${scriptPath}" "${sqlFilePath}"`, {
      cwd: projectPath,
      encoding: `utf8`,
      stdio: [`pipe`, `pipe`, `pipe`],
    });

    if (output) {
      console.log(output);
    }
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printLine(`Red`);
    ui.printText(`Red`, `! 오류가 발생했습니다: ${errMsg}`);
    ui.printText(`Red`, `! 프로세스를 종료합니다.`);
  }
  finally {
    // 임시 파일 정리
    try {
      if (sqlFilePath && fs.existsSync(sqlFilePath)) {
        fs.unlinkSync(sqlFilePath);
      }
    }
    catch {
      // ignore cleanup errors
    }
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  run2();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
