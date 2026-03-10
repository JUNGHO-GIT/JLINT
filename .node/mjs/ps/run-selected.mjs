/**
 * @file run-selected.mjs
 * @description Select and run mjs scripts in current directory
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ui } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const thisFilePath = fileURLToPath(import.meta.url);
const thisFileName = path.basename(thisFilePath);
const thisDirectoryPath = path.dirname(thisFilePath);

// 2. 유틸 함수 -------------------------------------------------------------------------------
const getRunnableScriptList = () => {
  const directoryEntries = fs.readdirSync(thisDirectoryPath, { "withFileTypes": true });
  const scriptNameList = directoryEntries
  .filter((entry) => {
    const isMjsFile = entry.isFile() && entry.name.endsWith(`.mjs`);
    const isCurrentFile = entry.name === thisFileName;
    const result = isMjsFile && !isCurrentFile;
    return result;
  })
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

  const scriptList = scriptNameList.map((name, index) => {
    const result = { "number": index + 1, "name": name };
    return result;
  });
  const result = scriptList;
  return result;
};

const printScriptList = (scriptList = []) => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 실행 가능한 MJS 파일 목록`);
  scriptList.forEach((script) => {
    ui.printText(`Cyan`, `  ${script.number}. ${script.name}`);
  });
};

const getSelectedScript = (input = ``, scriptList = []) => {
  const parsedNumber = Number(input.trim());
  const isValidInteger = Number.isInteger(parsedNumber);
  const isValidRange = parsedNumber >= 1 && parsedNumber <= scriptList.length;
  const selectedScript = isValidInteger && isValidRange
    ? scriptList[parsedNumber - 1]
    : null;
  const result = selectedScript;
  return result;
};

const runSelectedScript = async (selectedScript) => {
  const scriptPath = path.join(thisDirectoryPath, selectedScript.name);

  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      "stdio": `inherit`,
      "cwd": process.cwd(),
      "env": process.env,
    });

    child.once(`error`, (error) => {
      const wrappedError = new Error(`선택한 파일 실행 중 오류가 발생했습니다: ${error.message}`);
      reject(wrappedError);
    });

    child.once(`close`, (code) => {
      const exitCode = typeof code === `number` ? code : 1;
      if (exitCode === 0) {
        resolve();
      }
      else {
        const wrappedError = new Error(`선택한 파일이 비정상 종료되었습니다. exit code = ${exitCode}`);
        reject(wrappedError);
      }
    });
  });

  return result;
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();

  const scriptList = getRunnableScriptList();
  if (scriptList.length === 0) {
    ui.printText(`Red`, `! 실행 가능한 mjs 파일이 없습니다.`);
    process.exit(1);
  }

  printScriptList(scriptList);

  ui.printLine(`Yellow`);
  const input = await ui.textInput(`Green`, `실행할 번호를 입력하세요 (1-${scriptList.length}):`);
  const selectedScript = getSelectedScript(input, scriptList);

  if (!selectedScript) {
    ui.printText(`Red`, `! 유효한 번호를 입력하세요.`);
    process.exit(1);
  }

  ui.printLine(`Yellow`);
  ui.printText(`Green`, `▶ 선택한 스크립트 실행: ${selectedScript.name}`);
  await runSelectedScript(selectedScript);
  ui.printLine(`Green`);
  ui.printText(`Green`, `✓ 실행 완료: ${selectedScript.name}`);
};

await runScript(import.meta.url, executeScript);
