/**
 * @file run-kill-debloat.mjs
 * @description Windows debloat cleanup script (ESM)
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
const userProfile = process.env.USERPROFILE || process.env.HOME || ``;
const localAppData = process.env.LOCALAPPDATA || ``;

// 2. 유틸 함수 -------------------------------------------------------------------------------
const checkAdmin = () => {
  if (!isWindows) {
    return false;
  }
  try {
    execSync(`net session`, { stdio: `pipe` });
    return true;
  }
  catch {
    return false;
  }
};

const removeRegKey = (regPath, label) => {
  try {
    execSync(`reg query "${regPath}"`, { stdio: `pipe` });
    execSync(`reg delete "${regPath}" /f`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ ${label} 제거 완료`);
  }
  catch {
    ui.printText(`Gray`, `- ${label} 항목이 이미 제거되어 있습니다`);
  }
};

const setRegDword = (regPath, name, value, label) => {
  try {
    execSync(`reg add "${regPath}" /v "${name}" /t REG_DWORD /d ${value} /f`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ ${label} 설정 완료`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `! ${label} 설정 실패: ${errMsg}`);
  }
};

const formatTimestamp = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, `0`);
  const d = String(now.getDate()).padStart(2, `0`);
  const h = String(now.getHours()).padStart(2, `0`);
  const mi = String(now.getMinutes()).padStart(2, `0`);
  const s = String(now.getSeconds()).padStart(2, `0`);
  return `${y}${m}${d}_${h}${mi}${s}`;
};

// 3. 디블로트 프로세스 -----------------------------------------------------------------------
const run1 = async () => {
  if (!isWindows) {
    ui.printText(`Red`, `! 이 스크립트는 Windows에서만 실행 가능합니다.`);
    await ui.printContinue(getFileName());
  }

  if (!checkAdmin()) {
    ui.printText(`Red`, `! 관리자 권한이 필요합니다. 관리자 권한으로 다시 실행하세요.`);
    await ui.printContinue(getFileName());
  }
};

const run2 = () => {
  ui.printLine(`Green`);
  ui.printText(`Green`, `✓ 파일 탐색기 홈/갤러리/기본폴더/원드라이브 항목 제거 시작...`);

  // 1) 홈/갤러리 제거
  const desktopNs = `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace`;
  const homeClsid = `{f874310e-b6b7-47dc-bc84-b9e6b38f5903}`;
  const galleryClsid = `{e88865ea-0e1c-4e20-9aa6-edcd0212c87c}`;

  removeRegKey(`${desktopNs}\\${homeClsid}`, `홈(Home)`);
  removeRegKey(`${desktopNs}\\${galleryClsid}`, `갤러리(Gallery)`);

  // 2) "내 PC" 기본 폴더 제거
  const myPcNs64 = `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace`;
  const myPcNs32 = `HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace`;

  const removeFromThisPc = [
    { name: `3D 개체`, clsid: `{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}` },
    { name: `동영상`, clsid: `{f86fa3ab-70d2-4fc7-9c99-fcbf05467f3a}` },
    { name: `음악`, clsid: `{3dfdf296-dbec-4fb4-81d1-6a3438bcf4de}` },
    { name: `사진`, clsid: `{24ad3ad4-a569-4530-98e1-ab02f9417aa8}` },
  ];

  for (const it of removeFromThisPc) {
    removeRegKey(`${myPcNs64}\\${it.clsid}`, `내 PC: ${it.name} (64-bit)`);
    removeRegKey(`${myPcNs32}\\${it.clsid}`, `내 PC: ${it.name} (32-bit)`);
  }

  // 3) OneDrive 탐색기 트리/네임스페이스 숨김
  const oneDriveClsid = `{018D5C66-4533-4307-9B53-224DE2ED1FE6}`;
  const oneDriveShell64 = `HKCR\\CLSID\\${oneDriveClsid}\\ShellFolder`;
  const oneDriveShell32 = `HKCR\\Wow6432Node\\CLSID\\${oneDriveClsid}\\ShellFolder`;

  setRegDword(oneDriveShell64, `System.IsPinnedToNameSpaceTree`, 0, `OneDrive 탐색기 트리 숨김 (64-bit)`);
  setRegDword(oneDriveShell32, `System.IsPinnedToNameSpaceTree`, 0, `OneDrive 탐색기 트리 숨김 (32-bit)`);

  removeRegKey(`HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${oneDriveClsid}`, `OneDrive 네임스페이스 (HKCU)`);
  removeRegKey(`HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${oneDriveClsid}`, `OneDrive 네임스페이스 (HKLM)`);
  removeRegKey(`HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${oneDriveClsid}`, `OneDrive 네임스페이스 (HKLM WOW6432Node)`);
};

const stopOneDrive = () => {
  try {
    execSync(`taskkill /IM OneDrive.exe /F`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ OneDrive 프로세스 종료 완료`);
  }
  catch {
    ui.printText(`Gray`, `- OneDrive 프로세스가 실행 중이 아닙니다`);
  }

  try {
    execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "OneDrive" /f`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ OneDrive 시작프로그램 항목 제거 완료`);
  }
  catch {
    ui.printText(`Gray`, `- OneDrive 시작프로그램 항목이 이미 없습니다`);
  }
};

const run4 = () => {
  ui.printLine(`Magenta`);
  ui.printText(`Magenta`, `✓ 사용자 경로 기본 폴더 정리 시작...`);

  stopOneDrive();

  const ts = formatTimestamp();
  const backupRoot = path.join(userProfile, `_deleted_default_folders`, ts);

  const targets = [
    { name: `3D Objects`, dirPath: path.join(userProfile, `3D Objects`) },
    { name: `Videos`, dirPath: path.join(userProfile, `Videos`) },
    { name: `Music`, dirPath: path.join(userProfile, `Music`) },
    { name: `Pictures`, dirPath: path.join(userProfile, `Pictures`) },
    { name: `OneDrive`, dirPath: path.join(userProfile, `OneDrive`) },
    { name: `Contacts`, dirPath: path.join(userProfile, `Contacts`) },
    { name: `Favorites`, dirPath: path.join(userProfile, `Favorites`) },
    { name: `Links`, dirPath: path.join(userProfile, `Links`) },
    { name: `Saved Games`, dirPath: path.join(userProfile, `Saved Games`) },
    { name: `Searches`, dirPath: path.join(userProfile, `Searches`) },
    { name: `OneDriveTemp`, dirPath: path.join(localAppData, `Microsoft`, `OneDrive`) },
  ];

  for (const it of targets) {
    const p = it.dirPath;
    const n = it.name;

    if (!fs.existsSync(p)) {
      ui.printText(`Gray`, `- ${n} 폴더 없음: ${p}`);
      continue;
    }

    try {
      const stat = fs.lstatSync(p);
      const isReparse = stat.isSymbolicLink();

      if (isReparse) {
        fs.rmSync(p, { force: true });
        ui.printText(`Yellow`, `✓ ${n} (ReparsePoint) 제거 완료: ${p}`);
        continue;
      }

      const children = fs.readdirSync(p);
      const hasChild = children.length > 0;

      if (hasChild) {
        if (!fs.existsSync(backupRoot)) {
          fs.mkdirSync(backupRoot, { recursive: true });
        }
        let dst = path.join(backupRoot, path.basename(p));
        if (fs.existsSync(dst)) {
          const now = new Date();
          const suffix = `${String(now.getHours()).padStart(2, `0`)}${String(now.getMinutes()).padStart(2, `0`)}${String(now.getSeconds()).padStart(2, `0`)}`;
          dst = `${dst}_${suffix}`;
        }
        fs.renameSync(p, dst);
        ui.printText(`Yellow`, `✓ ${n} 폴더 이동(백업) 후 제거: ${dst}`);
      }
      else {
        fs.rmSync(p, { recursive: true, force: true });
        ui.printText(`Yellow`, `✓ ${n} 폴더 삭제 완료: ${p}`);
      }
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      ui.printText(`Red`, `! ${n} 처리 실패: ${errMsg} / ${p}`);
    }
  }

  if (fs.existsSync(backupRoot)) {
    ui.printText(`Cyan`, `! 비어있지 않은 폴더는 안전하게 백업 이동됨: ${backupRoot}`);
  }
};

const run3 = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `! 변경사항이 즉시 반영되지 않으면 PC를 재부팅하세요.`);
  ui.printEmpty();

  const restart = await ui.textInput(`Green`, `▶ 탐색기를 지금 재시작하시겠습니까? (Y/N)`);

  if (restart === `Y` || restart === `y`) {
    ui.printText(`Yellow`, `✓ 탐색기 재시작 중...`);
    try {
      execSync(`taskkill /IM explorer.exe /F`, { stdio: `pipe` });
    }
    catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 2000));
    try {
      execSync(`start "" explorer.exe`, { stdio: `pipe`, shell: true });
    }
    catch {
      // ignore
    }
    ui.printText(`Green`, `✓ 탐색기 재시작 완료`);
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  run2();
  run4();
  await run3();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
