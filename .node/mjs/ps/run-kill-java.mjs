/**
 * @file run-kill-java.mjs
 * @description Java process kill script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const isWindows = process.platform === `win32`;

// 2. Java 프로세스 조회 ---------------------------------------------------------------------
const findJavaProcessesWindows = () => {
  try {
    const output = execSync(`tasklist /FI "IMAGENAME eq java.exe"`, { encoding: `utf8`, stdio: `pipe` });
    const lines = output.split(`\n`).filter((line) => line.trim().startsWith(`java.exe`));
    return lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return parts[1];
    }).filter((pid) => pid && /^\d+$/.test(pid));
  }
  catch {
    return [];
  }
};

const findJavaProcessesLinux = () => {
  try {
    const output = execSync(`pgrep -f java`, { encoding: `utf8`, stdio: `pipe` });
    return output.trim().split(`\n`).filter((pid) => pid && /^\d+$/.test(pid));
  }
  catch {
    return [];
  }
};

// 3. Java 프로세스 종료 ---------------------------------------------------------------------
const run1 = () => {
  const pids = isWindows ? findJavaProcessesWindows() : findJavaProcessesLinux();

  if (pids.length === 0) {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `! 실행 중인 Java 프로세스가 없습니다.`);
    return;
  }

  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 모든 Java 프로세스를 강제 종료합니다...`);

  for (const pid of pids) {
    try {
      ui.printLine(`Yellow`);
      ui.printText(`Yellow`, `▶ 실행 중인 Java 프로세스가 발견되었습니다:`);
      ui.printText(`Yellow`, ` - 프로세스 ID: ${pid}`);

      if (isWindows) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: `pipe` });
      }
      else {
        execSync(`kill -9 ${pid}`, { stdio: `pipe` });
      }

      ui.printText(`Yellow`, `▶ 프로세스 ID ${pid} 가 종료되었습니다.`);
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      ui.printText(`Red`, `! 프로세스 ID ${pid} 종료 실패: ${errMsg}`);
    }
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  run1();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
