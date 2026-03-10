/**
 * @file run-kill-onedrive.mjs
 * @description OneDrive 완전 제거 (ESM)
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
const username = process.env.USERNAME || process.env.USER || ``;
let workspaceDir = ``;
let backupDir = ``;
const englishFolders = [`Desktop`, `Documents`, `Downloads`, `Pictures`, `Music`, `Videos`];

// 2. 유틸 함수 -------------------------------------------------------------------------------

const checkAdmin = () => {
  if (!isWindows) return false;
  try {
    execSync(`net session`, { stdio: `pipe` });
    return true;
  }
  catch {
    return false;
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

const removeRegKey = (regPath, label) => {
  try {
    execSync(`reg query "${regPath}"`, { stdio: `pipe` });
    execSync(`reg delete "${regPath}" /f`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ 레지스트리 키 삭제: ${label}`);
  }
  catch {
    ui.printText(`Gray`, `- 레지스트리 키 삭제 실패 또는 없음: ${label}`);
  }
};

const backupAndRemoveRegKey = (regPath, label) => {
  try {
    execSync(`reg query "${regPath}"`, { stdio: `pipe` });
    const safe = regPath.replace(/[:\\\/*?\[\]| ]/g, `_`);
    const outFile = path.join(backupDir, `${safe}.reg`);
    try {
      execSync(`reg export "${regPath}" "${outFile}" /y`, { stdio: `pipe` });
    }
    catch {
      // backup export failure is non-critical
    }
    execSync(`reg delete "${regPath}" /f`, { stdio: `pipe` });
    ui.printText(`Yellow`, `✓ 레지스트리 키 삭제: ${regPath}`);
  }
  catch {
    ui.printText(`Gray`, `- 레지스트리 키 삭제 실패: ${regPath}`);
  }
};

const removePath = (targetPath) => {
  if (!fs.existsSync(targetPath)) return;
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    ui.printText(`Yellow`, `✓ 삭제 완료: ${targetPath}`);
  }
  catch {
    ui.printText(`Gray`, `- 삭제 실패: ${targetPath}`);
  }
};

// 3. OneDrive 제거 프로세스 -----------------------------------------------------------------

const run1 = async () => {
  if (!isWindows) {
    ui.printText(`Red`, `! 이 스크립트는 Windows에서만 실행 가능합니다.`);
    await ui.printContinue(getFileName());
  }

  if (!checkAdmin()) {
    ui.printText(`Red`, `! 관리자 권한이 필요합니다. 관리자 권한으로 다시 실행해주세요.`);
    await ui.printContinue(getFileName());
  }
};

const run2 = () => {
  const downloadsPath = path.join(userProfile, `Downloads`);
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }

  const workspaceRoot = path.join(downloadsPath, `backup`);
  if (!fs.existsSync(workspaceRoot)) {
    fs.mkdirSync(workspaceRoot, { recursive: true });
  }

  const stamp = formatTimestamp();
  workspaceDir = path.join(workspaceRoot, `run_${stamp}`);
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }

  backupDir = path.join(workspaceDir, `reg_backup`);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  ui.printText(`Green`, `✓ 작업 공간 생성: [${workspaceDir}]`);
};

const run3 = () => {
  const processNames = [`OneDrive`, `OneDriveStandaloneUpdater`, `OneDriveSetup`, `FileCoAuth`];

  for (const name of processNames) {
    try {
      execSync(`taskkill /IM ${name}.exe /F`, { stdio: `pipe` });
      ui.printText(`Yellow`, `✓ 프로세스 종료: ${name}`);
    }
    catch {
      ui.printText(`Gray`, `- 프로세스 종료 실패 또는 미실행: ${name}`);
    }
  }
};

const run4 = () => {
  const systemRoot = process.env.SystemRoot || `C:\\Windows`;
  const setupPaths = [
    path.join(systemRoot, `System32`, `OneDriveSetup.exe`),
    path.join(systemRoot, `SysWOW64`, `OneDriveSetup.exe`),
  ];

  for (const setupPath of setupPaths) {
    if (fs.existsSync(setupPath)) {
      try {
        execSync(`"${setupPath}" /uninstall`, { stdio: `pipe`, timeout: 60000 });
        ui.printText(`Yellow`, `✓ Setup 제거 실행: ${setupPath}`);
      }
      catch {
        ui.printText(`Gray`, `- Setup 제거 실패: ${setupPath}`);
      }
    }
  }

  // AppxPackage 제거 (PowerShell 필요)
  try {
    execSync(`powershell -Command "Get-AppxPackage -AllUsers *OneDrive* | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue"`, { stdio: `pipe`, timeout: 60000 });
    ui.printText(`Yellow`, `✓ Appx 패키지 제거 완료`);
  }
  catch {
    ui.printText(`Gray`, `- Appx 패키지 제거 실패 또는 없음`);
  }

  // 사전배포 패키지 제거
  try {
    execSync(`powershell -Command "Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like '*OneDrive*' } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue"`, { stdio: `pipe`, timeout: 60000 });
    ui.printText(`Yellow`, `✓ 사전배포 패키지 제거 완료`);
  }
  catch {
    ui.printText(`Gray`, `- 사전배포 패키지 제거 실패 또는 없음`);
  }
};

const run5 = () => {
  try {
    const output = execSync(`schtasks /query /fo CSV /nh`, { encoding: `utf8`, stdio: `pipe` });
    const lines = output.split(`\n`).filter((l) => l.toLowerCase().includes(`onedrive`));

    for (const line of lines) {
      const parts = line.split(`,`);
      if (parts.length > 0) {
        const taskName = parts[0].replace(/"/g, ``).trim();
        if (taskName) {
          try {
            execSync(`schtasks /delete /tn "${taskName}" /f`, { stdio: `pipe` });
            ui.printText(`Yellow`, `✓ 예약 작업 삭제: ${taskName}`);
          }
          catch {
            ui.printText(`Gray`, `- 예약 작업 삭제 실패: ${taskName}`);
          }
        }
      }
    }
  }
  catch {
    ui.printText(`Gray`, `- 예약 작업 조회 실패`);
  }
};

const run6 = () => {
  const programData = process.env.ProgramData || `C:\\ProgramData`;
  const localAppData = process.env.LOCALAPPDATA || ``;
  const programFiles = process.env.ProgramFiles || `C:\\Program Files`;
  const programFilesX86 = process.env[`ProgramFiles(x86)`] || `C:\\Program Files (x86)`;

  const commonPaths = [
    path.join(programData, `Microsoft OneDrive`),
    path.join(programData, `Microsoft`, `OneDrive`),
    path.join(localAppData, `Microsoft`, `OneDrive`),
    path.join(localAppData, `OneDrive`),
    path.join(programFiles, `Microsoft OneDrive`),
    path.join(programFilesX86, `Microsoft OneDrive`),
  ];

  for (const p of commonPaths) {
    if (!p || p.trim() === ``) continue;
    removePath(p);
  }

  // 각 사용자 프로필의 OneDrive 관련 경로 삭제
  try {
    const profileListKey = `HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList`;
    const output = execSync(`reg query "${profileListKey}"`, { encoding: `utf8`, stdio: `pipe` });
    const sidKeys = output.split(`\n`).filter((l) => l.includes(profileListKey + `\\`)).map((l) => l.trim());

    for (const sidKeyLine of sidKeys) {
      const sidKey = sidKeyLine.trim();
      try {
        const profileOutput = execSync(`reg query "${sidKey}" /v ProfileImagePath`, { encoding: `utf8`, stdio: `pipe` });
        const match = profileOutput.match(/ProfileImagePath\s+REG_\w+\s+(.+)/);
        if (!match) continue;

        const profilePath = match[1].trim();
        if (!fs.existsSync(profilePath)) continue;

        const userPaths = [
          path.join(profilePath, `OneDrive`),
          path.join(profilePath, `AppData`, `Local`, `Microsoft`, `OneDrive`),
          path.join(profilePath, `AppData`, `Local`, `OneDrive`),
          path.join(profilePath, `AppData`, `Roaming`, `Microsoft`, `OneDrive`),
          path.join(profilePath, `AppData`, `Roaming`, `OneDrive`),
          path.join(profilePath, `Links`, `OneDrive.lnk`),
          path.join(profilePath, `Start Menu`, `Programs`, `OneDrive.lnk`),
          path.join(profilePath, `Desktop`, `OneDrive.lnk`),
        ];

        for (const p of userPaths) {
          removePath(p);
        }
      }
      catch {
        // ignore individual profile errors
      }
    }
  }
  catch {
    ui.printText(`Gray`, `- 사용자 프로필 목록 조회 실패`);
  }
};

const run7 = () => {
  const clsidOneDrive = `{018D5C66-4533-4307-9B53-224DE2ED1FE6}`;
  const skyDriveKF = `{A52BBA46-E9E1-435f-B3D9-28DAA648C0F6}`;

  const regKeys = [
    `HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\OneDrive`,
    `HKLM\\SOFTWARE\\Microsoft\\OneDrive`,
    `HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\OneDrive`,
    `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${clsidOneDrive}`,
    `HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${clsidOneDrive}`,
    `HKCR\\CLSID\\${clsidOneDrive}`,
    `HKCR\\Wow6432Node\\CLSID\\${clsidOneDrive}`,
    `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FolderDescriptions\\${skyDriveKF}`,
    `HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FolderDescriptions\\${skyDriveKF}`,
    `HKCR\\*\\shellex\\ContextMenuHandlers\\OneDrive`,
    `HKCR\\AllFileSystemObjects\\shellex\\ContextMenuHandlers\\OneDrive`,
    `HKCR\\Directory\\shellex\\ContextMenuHandlers\\OneDrive`,
    `HKCR\\Directory\\Background\\shellex\\ContextMenuHandlers\\OneDrive`,
    `HKCR\\Drive\\shellex\\ContextMenuHandlers\\OneDrive`,
  ];

  for (const key of regKeys) {
    backupAndRemoveRegKey(key, key);
  }

  const hkcuKeys = [
    `HKCU\\Software\\Microsoft\\OneDrive`,
    `HKCU\\Software\\Microsoft\\SkyDrive`,
    `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\NameSpace\\${clsidOneDrive}`,
  ];

  for (const key of hkcuKeys) {
    removeRegKey(key, key);
  }
};

const run8 = () => {
  const pf = userProfile;
  const usfKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders`;
  const sfKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders`;

  const folders = [
    { name: `Desktop`, rel: `Desktop`, guid: `{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}`, usf: [`Desktop`], sf: [`Desktop`] },
    { name: `Documents`, rel: `Documents`, guid: `{FDD39AD0-238F-46AF-ADB4-6C85480369C7}`, usf: [`Personal`], sf: [`Personal`] },
    { name: `Downloads`, rel: `Downloads`, guid: `{374DE290-123F-4565-9164-39C4925E467B}`, usf: [`Downloads`], sf: [`Downloads`] },
    { name: `Pictures`, rel: `Pictures`, guid: `{33E28130-4E1E-4676-835A-98395C3BC3BB}`, usf: [`My Pictures`], sf: [`My Pictures`] },
    { name: `Music`, rel: `Music`, guid: `{4BD8D571-6D19-48D3-BE97-422220080E43}`, usf: [`My Music`], sf: [`My Music`] },
    { name: `Videos`, rel: `Videos`, guid: `{18989B1D-99B5-455B-841C-AB7C74E4DDFC}`, usf: [`My Video`], sf: [`My Video`] },
  ];

  for (const kf of folders) {
    const abs = path.join(pf, kf.rel);
    if (!fs.existsSync(abs)) {
      fs.mkdirSync(abs, { recursive: true });
    }

    const expandValue = `%USERPROFILE%\\${kf.rel}`;

    // User Shell Folders
    for (const n of kf.usf) {
      try {
        execSync(`reg add "${usfKey}" /v "${n}" /t REG_EXPAND_SZ /d "${expandValue}" /f`, { stdio: `pipe` });
      }
      catch {
        // ignore
      }
    }

    // GUID entry
    try {
      execSync(`reg add "${usfKey}" /v "${kf.guid}" /t REG_EXPAND_SZ /d "${expandValue}" /f`, { stdio: `pipe` });
    }
    catch {
      // ignore
    }

    // Shell Folders
    for (const n of kf.sf) {
      try {
        execSync(`reg add "${sfKey}" /v "${n}" /t REG_SZ /d "${abs}" /f`, { stdio: `pipe` });
      }
      catch {
        // ignore
      }
    }
  }

  ui.printText(`Green`, `✓ 표준 폴더 경로 복구 완료`);
};

const run9 = () => {
  const map = {
    Desktop: `Desktop`,
    Documents: `Documents`,
    Downloads: `Downloads`,
    Pictures: `Pictures`,
    Music: `Music`,
    Videos: `Videos`,
  };

  const pf = userProfile;

  for (const name of englishFolders) {
    if (!map[name]) continue;

    const folderPath = path.join(pf, name);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ini = path.join(folderPath, `desktop.ini`);
    const content = `[.ShellClassInfo]\r\nLocalizedResourceName=${map[name]}`;

    try {
      fs.writeFileSync(ini, content, { encoding: `utf16le` });
      try { execSync(`attrib +s +h "${ini}"`, { stdio: `pipe` }); } catch { /* ignore */ }
      try { execSync(`attrib +r +s "${folderPath}"`, { stdio: `pipe` }); } catch { /* ignore */ }
      ui.printText(`Yellow`, `✓ 영어 표시 적용: ${folderPath}`);
    }
    catch {
      ui.printText(`Gray`, `- 영어 표시 적용 실패: ${folderPath}`);
    }
  }
};

const run10 = () => {
  const pf = userProfile;

  for (const name of englishFolders) {
    const folderPath = path.join(pf, name);
    if (fs.existsSync(folderPath)) {
      try { execSync(`icacls "${folderPath}" /inheritance:e`, { stdio: `pipe` }); } catch { /* ignore */ }
      try { execSync(`icacls "${folderPath}" /grant "${username}:(OI)(CI)M"`, { stdio: `pipe` }); } catch { /* ignore */ }
    }
  }

  try { execSync(`ie4uinit.exe -ClearIconCache`, { stdio: `pipe` }); } catch { /* ignore */ }
  try { execSync(`ie4uinit.exe -show`, { stdio: `pipe` }); } catch { /* ignore */ }
  try { execSync(`rundll32.exe user32.dll,UpdatePerUserSystemParameters 1, True`, { stdio: `pipe` }); } catch { /* ignore */ }

  ui.printText(`Green`, `✓ 권한 정합화 및 캐시 갱신 완료`);
};

const run11 = () => {
  // WinUILanguageOverride 제거
  try {
    execSync(`reg delete "HKCU\\Control Panel\\International" /v "WinUILanguageOverride" /f`, { stdio: `pipe` });
  }
  catch {
    // ignore
  }

  // PreferredUILanguages 복구 (PowerShell)
  try {
    execSync(`powershell -Command "$list = Get-WinUserLanguageList; if ($list) { $pref = $list | ForEach-Object { $_.LanguageTag }; New-ItemProperty -LiteralPath 'HKCU:\\Control Panel\\Desktop' -Name 'PreferredUILanguages' -PropertyType MultiString -Value $pref -Force | Out-Null }"`, { stdio: `pipe`, timeout: 30000 });
  }
  catch {
    // ignore
  }

  ui.printText(`Green`, `✓ UI 언어 복구 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  run2();
  run3();
  run4();
  run5();
  run6();
  run7();
  run8();
  run9();
  run10();
  run11();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
