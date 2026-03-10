/**
 * @file run-kill-port.mjs
 * @description Port-based process kill script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const isWindows = process.platform === `win32`;

// 2. 포트 프로세스 조회 ---------------------------------------------------------------------
const findPidsWindows = (port) => {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: `utf8`, stdio: `pipe` });
    const pids = new Set();
    for (const line of output.split(`\n`)) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== `0` && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }
    return [...pids];
  }
  catch {
    return [];
  }
};

const findPidsLinux = (port) => {
  try {
    const output = execSync(`lsof -ti:${port}`, { encoding: `utf8`, stdio: `pipe` });
    return output.trim().split(`\n`).filter((pid) => pid && /^\d+$/.test(pid));
  }
  catch {
    return [];
  }
};

// 3. 포트 프로세스 종료 ---------------------------------------------------------------------
const run1 = async () => {
  const port = await ui.textInput(`Cyan`, `▶ 종료할 포트 번호를 입력하세요:`);

  if (!port) {
    ui.printLine(`Red`);
    ui.printText(`Red`, `! 포트 번호가 입력되지 않았습니다.`);
    return;
  }

  const pids = isWindows ? findPidsWindows(port) : findPidsLinux(port);

  if (pids.length === 0) {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `! 포트 ${port} 를 사용하는 프로세스가 없습니다.`);
    return;
  }

  for (const pid of pids) {
    try {
      ui.printLine(`Yellow`);
      ui.printText(`Yellow`, `▶ 포트 ${port} 에서 실행 중인 프로세스가 발견되었습니다:`);
      ui.printText(`Yellow`, ` - 프로세스 ID: ${pid}`);
      ui.printLine(`Yellow`);
      ui.printText(`Yellow`, `▶ 해당 프로세스를 강제 종료합니다...`);

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
  await run1();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
