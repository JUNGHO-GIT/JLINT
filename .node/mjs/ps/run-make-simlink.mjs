/**
 * @file run-make-simlink.mjs
 * @description 심볼릭 링크/정션 생성 (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const isWindows = process.platform === `win32`;
let sourcePaths = [];
let targetBasePaths = [];
let isDirectory = false;
let isExpand = false;
let cloneType = ``;

// 2. 심링크 생성 ---------------------------------------------------------------------------

const run1 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 복제 대상 정보를 입력합니다.`);

  // 1. 복제 유형 선택
  while (true) {
    cloneType = await ui.textInput(`Green`, `번호를 입력하세요. (1.file / 2.dir / 3.dir-expand)`);

    if (!cloneType || cloneType.trim() === ``) {
      ui.printText(`Red`, `✗ 복제 유형은 비워둘 수 없습니다. 다시 입력하세요.`);
      continue;
    }

    cloneType = cloneType.trim().toLowerCase();

    if (cloneType === `1`) cloneType = `file`;
    else if (cloneType === `2`) cloneType = `dir`;
    else if (cloneType === `3`) cloneType = `dir-expand`;

    if (cloneType !== `file` && cloneType !== `dir` && cloneType !== `dir-expand`) {
      ui.printText(`Red`, `✗ 복제 유형은 '1', '2', '3', 'file', 'dir', 'dir-expand' 만 입력할 수 있습니다.`);
      continue;
    }

    break;
  }

  isDirectory = (cloneType === `dir`) || (cloneType === `dir-expand`);
  isExpand = cloneType === `dir-expand`;

  // 2. 원본 경로 입력
  let promptMsg = ``;
  if (isExpand) {
    promptMsg = `복제할 원본 폴더 경로를 입력하세요. (내부 항목들을 대상에 펼침)`;
  }
  else if (isDirectory) {
    promptMsg = `복제할 원본 폴더 경로를 입력하세요.`;
  }
  else {
    promptMsg = `복제할 원본 파일 경로를 입력하세요. (콤마로 다중 파일 가능)`;
  }

  while (true) {
    sourcePaths = [];
    const inputSources = await ui.textInput(`Green`, promptMsg);

    if (inputSources) {
      for (const part of inputSources.split(`,`)) {
        const trimmed = part.replace(/"/g, ``).trim();
        if (trimmed) {
          sourcePaths.push(trimmed);
        }
      }
    }

    if (sourcePaths.length === 0) {
      ui.printText(`Red`, `✗ 원본 경로는 비워둘 수 없습니다. 다시 입력하세요.`);
      continue;
    }

    break;
  }

  // 3. 대상 경로 입력
  let targetPrompt = ``;
  if (isExpand) {
    targetPrompt = `대상 경로를 입력하세요. (콤마로 다중 경로 가능, 원본 내부 항목들이 여기에 생성됨)`;
  }
  else {
    targetPrompt = `대상 경로를 입력하세요. (콤마로 다중 경로 가능, 원본명 자동 추가)`;
  }

  while (true) {
    targetBasePaths = [];
    const inputTargets = await ui.textInput(`Green`, targetPrompt);

    if (inputTargets) {
      for (const part of inputTargets.split(`,`)) {
        const trimmed = part.replace(/"/g, ``).trim();
        if (trimmed) {
          targetBasePaths.push(trimmed);
        }
      }
    }

    if (targetBasePaths.length === 0) {
      ui.printText(`Red`, `✗ 대상 경로는 비워둘 수 없습니다. 다시 입력하세요.`);
      continue;
    }

    break;
  }

  ui.printEmpty();
  ui.printText(`Cyan`, `복제 유형: ${cloneType}`);
  ui.printText(`Cyan`, `원본 경로 (${sourcePaths.length}개):`);
  for (const s of sourcePaths) {
    ui.printText(`Cyan`, `  → ${s}`);
  }
  ui.printText(`Cyan`, `대상 경로 (${targetBasePaths.length}개):`);
  for (const t of targetBasePaths) {
    ui.printText(`Cyan`, `  → ${t}`);
  }
};

const run2 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 경로 유효성 검사를 수행합니다.`);

  // 원본 경로 검증
  for (const sourcePath of sourcePaths) {
    if (!fs.existsSync(sourcePath)) {
      ui.printText(`Red`, `✗ 원본 경로가 존재하지 않습니다: ${sourcePath}`);
      await ui.printContinue(getFileName());
    }

    try {
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory() && !isDirectory) {
        ui.printText(`Red`, `✗ 디렉터리를 선택했지만 복제 유형을 'file' 로 지정했습니다: ${sourcePath}`);
        await ui.printContinue(getFileName());
      }

      if (!stat.isDirectory() && isDirectory) {
        ui.printText(`Red`, `✗ 파일을 선택했지만 복제 유형을 'dir' 또는 'dir-expand' 로 지정했습니다: ${sourcePath}`);
        await ui.printContinue(getFileName());
      }
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      ui.printText(`Red`, `✗ 원본 정보를 가져오는 중 오류가 발생했습니다: ${errMsg}`);
      await ui.printContinue(getFileName());
    }
  }

  // 대상 경로 검증 및 준비
  for (const targetBase of targetBasePaths) {
    // dir-expand 모드: 대상 폴더 자체만 준비
    if (isExpand) {
      if (!fs.existsSync(targetBase)) {
        fs.mkdirSync(targetBase, { recursive: true });
        ui.printText(`Cyan`, `  대상 폴더 생성: ${targetBase}`);
      }
    }
    // 일반 모드: 원본별로 대상 경로 준비
    else {
      for (const sourcePath of sourcePaths) {
        const sourceName = path.basename(sourcePath);
        const targetPath = path.join(targetBase, sourceName);

        if (fs.existsSync(targetPath)) {
          try {
            const stat = fs.lstatSync(targetPath);
            const isLink = stat.isSymbolicLink();

            if (isLink) {
              fs.rmSync(targetPath, { force: true });
              ui.printText(`Magenta`, `  기존 링크 삭제: ${targetPath}`);
            }
            else {
              fs.rmSync(targetPath, { recursive: true, force: true });
              ui.printText(`Magenta`, `  기존 항목 삭제: ${targetPath}`);
            }
          }
          catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            ui.printText(`Red`, `✗ 기존 경로 삭제 중 오류가 발생했습니다: ${errMsg}`);
            await ui.printContinue(getFileName());
          }
        }

        const targetParent = path.dirname(targetPath);
        if (targetParent && !fs.existsSync(targetParent)) {
          fs.mkdirSync(targetParent, { recursive: true });
          ui.printText(`Cyan`, `  상위 폴더 생성: ${targetParent}`);
        }
      }
    }
  }

  ui.printText(`Green`, `✓ 경로 유효성 검사가 완료되었습니다.`);
};

const run3 = () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 심볼릭 링크(또는 정션) 생성 작업을 시작합니다.`);

  // dir-expand 모드
  if (isExpand) {
    for (const targetBase of targetBasePaths) {
      for (const sourcePath of sourcePaths) {
        let childItems = [];
        try {
          childItems = fs.readdirSync(sourcePath, { withFileTypes: true });
        }
        catch {
          continue;
        }

        for (const childItem of childItems) {
          const childFullPath = path.join(sourcePath, childItem.name);
          const targetPath = path.join(targetBase, childItem.name);
          const isChildDir = childItem.isDirectory();

          const linkType = isChildDir ? `junction` : `file`;
          const linkName = isChildDir ? `정션(Junction)` : `심볼릭 링크(SymbolicLink)`;

          // 기존 항목 처리
          if (fs.existsSync(targetPath)) {
            try {
              fs.rmSync(targetPath, { recursive: true, force: true });
              ui.printText(`Magenta`, `  기존 항목 삭제: ${targetPath}`);
            }
            catch {
              // ignore
            }
          }

          try {
            ui.printText(`Cyan`, `${linkName} 생성 중: ${targetPath}`);
            fs.symlinkSync(childFullPath, targetPath, linkType);
            ui.printText(`Green`, `  ✓ 생성 완료`);
          }
          catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            ui.printText(`Red`, `  ✗ 링크 생성 실패: ${errMsg}`);
          }
        }
      }
    }
  }
  // 일반 모드
  else {
    const linkType = isDirectory ? `junction` : `file`;
    const linkName = isDirectory ? `폴더 정션(Junction)` : `파일 심볼릭 링크(SymbolicLink)`;

    for (const targetBase of targetBasePaths) {
      for (const sourcePath of sourcePaths) {
        const sourceName = path.basename(sourcePath);
        const targetPath = path.join(targetBase, sourceName);

        try {
          ui.printText(`Cyan`, `${linkName} 생성 중: ${targetPath}`);
          fs.symlinkSync(sourcePath, targetPath, linkType);
          ui.printText(`Green`, `  ✓ 생성 완료`);
        }
        catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          ui.printText(`Red`, `  ✗ 링크 생성 실패: ${errMsg}`);
        }
      }
    }
  }

  ui.printText(`Green`, `✓ 모든 링크 생성 작업이 완료되었습니다.`);
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  await run2();
  run3();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
