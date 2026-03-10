/**
 * @file classes.mjs
 * @description PowerShell classes.psm1 conversion utilities (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import path from "node:path";
import process from "node:process";
import readline from "node:readline";

// 1. ANSI 색상 매핑 --------------------------------------------------------------------------
const ansiColors = {
  "Cyan": `\u001B[36m`,
  "Red": `\u001B[31m`,
  "Green": `\u001B[32m`,
  "Yellow": `\u001B[33m`,
  "White": `\u001B[37m`,
  "Gray": `\u001B[90m`,
  "DarkGray": `\u001B[90m`,
  "Magenta": `\u001B[35m`,
  "Reset": `\u001B[0m`,
};

const getAnsiColor = (color = `White`) => {
  const ansiColor = ansiColors[color] ?? ansiColors.White;
  const result = ansiColor;
  return result;
};

// 2. 글로벌 상수 -----------------------------------------------------------------------------
export const line = `────────────────────────────────────────────────────────────────`;
export const LINE = line;

export const getCurrentTime = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, `0`);
  const dd = String(now.getDate()).padStart(2, `0`);
  const HH = String(now.getHours()).padStart(2, `0`);
  const mm = String(now.getMinutes()).padStart(2, `0`);
  const ss = String(now.getSeconds()).padStart(2, `0`);
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};

export const getFileName = () => {
  const result = path.basename(process.argv[1] ?? `unknown`);
  return result;
};

// 3. 사용자 입력 헬퍼 ------------------------------------------------------------------------
const createPrompt = (question = ``) => {
  const rl = readline.createInterface({
    "input": process.stdin,
    "output": process.stdout,
  });

  const result = new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
  return result;
};

// 4. 출력/입력 유틸 객체 ---------------------------------------------------------------------
export const ui = {
  "printEmpty": () => {
    console.log(``);
  },

  "printLine": (color = `White`) => {
    const ansiColor = getAnsiColor(color);
    console.log(`${ansiColor}${line}${ansiColors.Reset}`);
  },

  "printText": (color = `White`, message = ``) => {
    const ansiColor = getAnsiColor(color);
    console.log(`${ansiColor}${message}${ansiColors.Reset}`);
  },

  "printExit": (color = `Red`, message = ``) => {
    const ansiColor = getAnsiColor(color);
    console.error(`${ansiColor}${message}${ansiColors.Reset}`);
    process.exit(1);
  },

  "printContinue": async (scriptPath = ``) => {
    const display = scriptPath || getFileName();
    ui.printLine(`Cyan`);
    ui.printText(`Yellow`, `스크립트: ${display}`);
    ui.printText(`Yellow`, `계속 진행하시겠습니까? (Y/N)`);
    ui.printLine(`Cyan`);

    const answer = await createPrompt(`${ansiColors.Green}> ${ansiColors.Reset}`);
    const normalized = answer.toLowerCase();

    if (normalized !== `y`) {
      ui.printText(`Red`, `사용자에 의해 취소되었습니다.`);
      process.exit(0);
    }
  },

  "formatText": (str = ``, target = 50) => {
    const result = str.length >= target
      ? str.substring(0, target)
      : str.padEnd(target, ` `);
    return result;
  },

  "textInput": async (color = `White`, message = ``) => {
    const ansiColor = getAnsiColor(color);
    const result = await createPrompt(`${ansiColor}${message}${ansiColors.Reset} `);
    return result;
  },

  "printStart": () => {
    const name = getFileName();
    const time = getCurrentTime();
    ui.printLine(`Cyan`);
    ui.printText(`Green`, `스크립트: ${name}`);
    ui.printText(`Green`, `시작 시간: ${time}`);
    ui.printLine(`Cyan`);
  },
};

// 하위 호환성을 위한 별칭 --------------------------------------------------------------------
export const T = {
  "PrintEmpty": ui.printEmpty,
  "PrintLine": ui.printLine,
  "PrintText": ui.printText,
  "PrintExit": ui.printExit,
  "PrintContinue": ui.printContinue,
  "TextFormat": ui.formatText,
  "TextInput": ui.textInput,
  "PrintStart": ui.printStart,
};
