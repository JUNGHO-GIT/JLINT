/**
 * @file run-kill-node.mjs
 * @description Node ecosystem process kill script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import { execFileSync, execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const isWindows = process.platform === `win32`;
const excludedPidSet = new Set([String(process.pid), String(process.ppid)]);
const directProcessNamePattern = /^(?:node|bun|npm|npx|pnpm(?:-win)?|yarn(?:pkg)?|corepack|tsx)(?:\.exe|\.cmd|\.bat)?$/i;
const shellProcessNamePattern = isWindows ? /^(?:cmd)(?:\.exe)?$/i : /^(?:sh|bash|zsh|fish)$/i;
const commandKeywordPattern = /(?:^|[\s"'`=\\/])(?:node(?:\.exe)?|npm|npx|pnpm|pnpm-win|yarn|yarnpkg|bun|corepack|tsx|ts-node)(?:$|[\s"'`=\\/])/i;

// 2. 유틸 함수 -------------------------------------------------------------------------------
const truncateText = (value = ``, maxLength = 140) => {
  const normalizedValue = typeof value === `string` ? value.trim() : ``;
  const shouldTrim = normalizedValue.length > maxLength;
  const result = shouldTrim ? `${normalizedValue.slice(0, maxLength - 3)}...` : normalizedValue;
  return result;
};

const toProcessArray = (rawValue) => {
  const rawList = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
  const processList = rawList
    .map((item) => {
      const pid = String(item?.pid ?? item?.ProcessId ?? ``).trim();
      const name = String(item?.name ?? item?.Name ?? ``).trim();
      const commandLine = String(item?.commandLine ?? item?.CommandLine ?? ``).trim();
      const hasPid = /^\d+$/.test(pid);
      const result = hasPid ? {
        "pid": pid,
        "name": name,
        "commandLine": commandLine,
      } : null;
      return result;
    })
    .filter((item) => item !== null);
  const result = processList;
  return result;
};

const getWindowsProcessList = () => {
  const powershellScript = [
    `Get-CimInstance Win32_Process |`,
    `Select-Object @{Name='pid';Expression={[string]$_.ProcessId}},`,
    `@{Name='name';Expression={$_.Name}},`,
    `@{Name='commandLine';Expression={$_.CommandLine}} |`,
    `ConvertTo-Json -Compress`,
  ].join(` `);

  let processList = [];

  try {
    const output = execFileSync(`powershell.exe`, [`-NoProfile`, `-Command`, powershellScript], {
      "encoding": `utf8`,
      "stdio": [`ignore`, `pipe`, `pipe`],
    });
    const trimmedOutput = output.trim();
    const parsedValue = trimmedOutput ? JSON.parse(trimmedOutput) : [];
    processList = toProcessArray(parsedValue);
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `! Windows 프로세스 목록 조회 실패: ${errorMessage}`);
  }

  const result = processList;
  return result;
};

const getUnixProcessList = () => {
  let processList = [];

  try {
    const output = execSync(`ps -eo pid=,comm=,args=`, {
      "encoding": `utf8`,
      "stdio": `pipe`,
    });
    processList = output
      .split(`\n`)
      .map((line) => {
        const match = line.match(/^\s*(\d+)\s+(\S+)(?:\s+(.*))?$/);
        const pid = match?.[1] ?? ``;
        const name = match?.[2] ?? ``;
        const commandLine = match?.[3] ?? ``;
        const hasPid = Boolean(match?.[1]);
        const result = hasPid ? {
          "pid": pid,
          "name": name,
          "commandLine": commandLine.trim(),
        } : null;
        return result;
      })
      .filter((item) => item !== null);
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `! Unix 프로세스 목록 조회 실패: ${errorMessage}`);
  }

  const result = processList;
  return result;
};

const isNodeRelatedProcess = (processInfo) => {
  const pid = String(processInfo?.pid ?? ``).trim();
  const name = String(processInfo?.name ?? ``).trim();
  const commandLine = String(processInfo?.commandLine ?? ``).trim();
  const isExcludedProcess = excludedPidSet.has(pid);
  const isDirectProcess = directProcessNamePattern.test(name);
  const isShellProcess = shellProcessNamePattern.test(name);
  const isShellWrappedNodeProcess = isShellProcess && commandKeywordPattern.test(commandLine);
  const result = !isExcludedProcess && (isDirectProcess || isShellWrappedNodeProcess);
  return result;
};

const getNodeRelatedProcesses = () => {
  const processList = isWindows ? getWindowsProcessList() : getUnixProcessList();
  const processMap = new Map();

  for (const processInfo of processList) {
    const isTargetProcess = isNodeRelatedProcess(processInfo);

    if (!isTargetProcess) {
      continue;
    }

    processMap.set(processInfo.pid, processInfo);
  }

  const sortedProcessList = [...processMap.values()].sort((left, right) => Number(left.pid) - Number(right.pid));
  const result = sortedProcessList;
  return result;
};

const printProcessList = (processList = []) => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 종료 대상 Node 관련 프로세스 목록`);

  for (const processInfo of processList) {
    const displayCommandLine = truncateText(processInfo.commandLine || processInfo.name);
    ui.printText(`Cyan`, ` - PID: ${processInfo.pid} / NAME: ${processInfo.name}`);
    ui.printText(`Gray`, `   CMD: ${displayCommandLine}`);
  }
};

const killProcess = (processInfo) => {
  let isKilled = false;

  try {
    if (isWindows) {
      execSync(`taskkill /PID ${processInfo.pid} /T /F`, { "stdio": `pipe` });
    }
    else {
      execSync(`kill -9 ${processInfo.pid}`, { "stdio": `pipe` });
    }

    isKilled = true;
    ui.printText(`Green`, `✓ 종료 완료: PID ${processInfo.pid} (${processInfo.name})`);
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `! 종료 실패: PID ${processInfo.pid} (${processInfo.name}) / ${errorMessage}`);
  }

  const result = isKilled;
  return result;
};

// 3. Node 관련 프로세스 종료 ----------------------------------------------------------------
const run1 = () => {
  const processList = getNodeRelatedProcesses();

  if (processList.length === 0) {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `! 실행 중인 Node 관련 프로세스가 없습니다.`);
  }
  else {
    printProcessList(processList);
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `▶ Node 관련 프로세스를 강제 종료합니다...`);

    for (const processInfo of processList) {
      killProcess(processInfo);
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
