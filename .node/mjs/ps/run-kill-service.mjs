/**
 * @file run-kill-service.mjs
 * @description Symlink/junction creation script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const isWindows = process.platform === `win32`;
let sourcePath = ``;
let targetPath = ``;
let cloneType = ``;

// 2. 서비스 파일 복제 -----------------------------------------------------------------------
const run1 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 복제 대상 정보를 입력합니다.`);

  cloneType = await ui.textInput(`Green`, `번호를 입력하세요. (1.file / 2.dir)`);
  cloneType = (cloneType ?? ``).trim().toLowerCase();

  if (!cloneType) {
    ui.printText(`Red`, `✗ 복제 유형은 비워둘 수 없습니다.`);
    process.exit(1);
  }

  if (cloneType === `1`) {
    cloneType = `file`;
  }
  else if (cloneType === `2`) {
    cloneType = `dir`;
  }

  if (cloneType !== `file` && cloneType !== `dir`) {
    ui.printText(`Red`, `✗ 복제 유형은 '1', '2', 'file', 'dir' 만 입력할 수 있습니다.`);
    process.exit(1);
  }

  sourcePath = await ui.textInput(`Green`, `복제할 원본 경로를 입력하세요.`);
  targetPath = await ui.textInput(`Green`, `복제본(링크)이 생성될 대상 경로를 입력하세요.`);

  sourcePath = (sourcePath ?? ``).replace(/^"|"$/g, ``).trim();
  targetPath = (targetPath ?? ``).replace(/^"|"$/g, ``).trim();

  if (!sourcePath) {
    ui.printText(`Red`, `✗ 원본 경로는 비워둘 수 없습니다.`);
    process.exit(1);
  }
  if (!targetPath) {
    ui.printText(`Red`, `✗ 대상 경로는 비워둘 수 없습니다.`);
    process.exit(1);
  }

  ui.printEmpty();
  ui.printText(`Cyan`, `원본 경로 : [${sourcePath}]`);
  ui.printText(`Cyan`, `대상 경로 : [${targetPath}]`);
};

const run2 = () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 경로 유효성 검사를 수행합니다.`);

  const isDirectory = cloneType === `dir`;

  if (!fs.existsSync(sourcePath)) {
    ui.printText(`Red`, `✗ 원본 경로가 존재하지 않습니다: ${sourcePath}`);
    process.exit(1);
  }

  const stat = fs.statSync(sourcePath);

  if (stat.isDirectory() && !isDirectory) {
    ui.printText(`Red`, `✗ 디렉터리를 선택했지만 복제 유형을 'file' 로 지정했습니다. 'dir' 로 다시 실행하세요.`);
    process.exit(1);
  }
  if (!stat.isDirectory() && isDirectory) {
    ui.printText(`Red`, `✗ 파일을 선택했지만 복제 유형을 'dir' 로 지정했습니다. 'file' 로 다시 실행하세요.`);
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    ui.printText(`Red`, `✗ 대상 경로가 이미 존재합니다. 다른 경로를 지정하거나 수동으로 정리한 후 다시 실행하세요.\n  → ${targetPath}`);
    process.exit(1);
  }

  const targetParent = path.dirname(targetPath);
  if (targetParent && !fs.existsSync(targetParent)) {
    try {
      fs.mkdirSync(targetParent, { recursive: true });
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      ui.printText(`Red`, `✗ 대상 경로의 상위 폴더를 생성하는 중 오류가 발생했습니다: ${errMsg}`);
      process.exit(1);
    }
  }

  ui.printText(`Green`, `✓ 경로 유효성 검사가 완료되었습니다.`);
};

const run3 = () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 심볼릭 링크(또는 정션) 생성 작업을 시작합니다.`);

  const isDirectory = cloneType === `dir`;

  try {
    if (isDirectory) {
      if (isWindows) {
        execSync(`mklink /J "${targetPath}" "${sourcePath}"`, { stdio: `pipe`, shell: `cmd.exe` });
      }
      else {
        fs.symlinkSync(sourcePath, targetPath, `dir`);
      }
      ui.printText(`Green`, `✓ 폴더 정션이 성공적으로 생성되었습니다.`);
    }
    else {
      fs.symlinkSync(sourcePath, targetPath, `file`);
      ui.printText(`Green`, `✓ 파일 심볼릭 링크가 성공적으로 생성되었습니다.`);
    }
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `✗ 링크 생성 중 오류가 발생했습니다: ${errMsg}`);
    process.exit(1);
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  run2();
  run3();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
