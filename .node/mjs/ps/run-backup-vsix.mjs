/**
 * @file run-backup-vsix.mjs
 * @description VS Code extension VSIX backup script (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const userProfile = process.env.USERPROFILE || process.env.HOME || ``;
const srcPath = path.join(userProfile, `.vscode`, `extensions`);
let dstPath = envPaths.vsixDstPath;
let extensions = [];
let days = 7;
const useCreationTime = true;
const platforms = [
  `win32-x64`, `win32-arm64`, `linux-x64`, `linux-arm64`,
  `darwin-x64`, `darwin-arm64`, `alpine-x64`, `alpine-arm64`, `web`,
];

// 2. 유틸 함수 -------------------------------------------------------------------------------
const parseExtensionName = (extName) => {
  const result = { publisher: ``, name: ``, version: ``, platform: `` };

  let platform = ``;
  let nameWithoutPlatform = extName;

  for (const p of platforms) {
    if (extName.endsWith(`-${p}`)) {
      platform = p;
      nameWithoutPlatform = extName.substring(0, extName.length - p.length - 1);
      break;
    }
  }

  const match = nameWithoutPlatform.match(/^([a-zA-Z0-9-]+)\.(.+)-(\d+\.\d+\.\d+.*)$/);
  if (match) {
    result.publisher = match[1];
    result.name = match[2];
    result.version = match[3];
    result.platform = platform;
  }

  return result;
};

const getGroupKey = (parsed) => {
  let key = `${parsed.publisher}.${parsed.name}`;
  if (parsed.platform && parsed.platform.trim() !== ``) {
    key += `|${parsed.platform}`;
  }
  return key;
};

const compareVersion = (a, b) => {
  const aMain = a.split(`-`)[0];
  const bMain = b.split(`-`)[0];

  const aParts = aMain.split(`.`).map(Number);
  const bParts = bMain.split(`.`).map(Number);

  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i] || 0;
    const bv = bParts[i] || 0;
    if (av !== bv) return av - bv;
  }
  return a.localeCompare(b);
};

const getUpdateTime = (stat) => {
  return useCreationTime ? stat.birthtime : stat.mtime;
};

const existsAnyVsix = (destPath, parsed) => {
  if (!parsed.publisher || !parsed.name) return false;
  if (!fs.existsSync(destPath)) return false;

  const files = fs.readdirSync(destPath);
  const base = `${parsed.publisher}.${parsed.name}-`;

  // 플랫폼이 있으면 해당 플랫폼 패턴 먼저 검사
  if (parsed.platform && parsed.platform.trim() !== ``) {
    const platformSuffix = `-${parsed.platform}.vsix`;
    for (const f of files) {
      if (f.startsWith(base) && f.endsWith(platformSuffix)) return true;
    }
  }

  // 같은 확장으로라도 있으면 스킵
  for (const f of files) {
    if (f.startsWith(base) && f.endsWith(`.vsix`)) return true;
  }

  return false;
};

const dedupLatestByGroup = (dirs) => {
  const map = {};

  for (const d of dirs) {
    const parsed = parseExtensionName(d.name);
    const key = getGroupKey(parsed);

    if (!key || key.trim() === ``) continue;

    if (!map[key]) {
      map[key] = { dir: d, parsed, time: getUpdateTime(d.stat) };
      continue;
    }

    const curr = map[key];
    const cmp = compareVersion(parsed.version, curr.parsed.version);

    if (cmp > 0) {
      map[key] = { dir: d, parsed, time: getUpdateTime(d.stat) };
    }
    else if (cmp === 0) {
      const t = getUpdateTime(d.stat);
      if (t > curr.time) {
        map[key] = { dir: d, parsed, time: t };
      }
    }
  }

  const result = [];
  for (const k of Object.keys(map)) {
    result.push(map[k].dir);
  }
  return result;
};

// 3. VSIX 백업 프로세스 ---------------------------------------------------------------------
const run1 = async () => {
  if (!fs.existsSync(srcPath)) {
    ui.printText(`Red`, `! 소스 경로가 존재하지 않습니다: ${srcPath}`);
    await ui.printContinue(getFileName());
  }

  ui.printText(`Yellow`, `▶ 소스 경로: ${srcPath}`);
  ui.printText(`Yellow`, `▶ 기본 대상 경로: ${dstPath}`);
  ui.printEmpty();

  const inputPath = await ui.textInput(`Green`, `대상 경로를 입력하세요 (Enter: 기본경로 사용):`);

  if (inputPath && inputPath.trim() !== ``) {
    dstPath = inputPath.trim();
  }

  if (!fs.existsSync(dstPath)) {
    fs.mkdirSync(dstPath, { recursive: true });
  }

  ui.printText(`Cyan`, `▶ 선택된 대상 경로: ${dstPath}`);
};

const run2 = async () => {
  ui.printEmpty();
  const inputDays = await ui.textInput(`Green`, `검색 기간(일)을 입력하세요 (Enter: 기본값 7일):`);

  if (inputDays && /^\d+$/.test(inputDays.trim())) {
    days = Number(inputDays.trim());
  }

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);

  // 확장 폴더 스캔
  let raw = [];
  try {
    const entries = fs.readdirSync(srcPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!/^[a-zA-Z0-9-]+\..+-\d+\.\d+\.\d+/.test(entry.name)) continue;

      const stat = fs.statSync(path.join(srcPath, entry.name));
      const updateTime = getUpdateTime(stat);
      if (updateTime >= targetDate) {
        raw.push({ name: entry.name, stat });
      }
    }
  }
  catch {
    // ignore
  }

  // 같은 확장(버전만 다른) 중 최신만 남김
  const dedup = dedupLatestByGroup(raw);

  // 업데이트 시간 내림차순 정렬
  extensions = dedup.sort((a, b) => getUpdateTime(b.stat).getTime() - getUpdateTime(a.stat).getTime());

  ui.printLine(`Yellow`);
  const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, `0`)}-${String(targetDate.getDate()).padStart(2, `0`)}`;
  ui.printText(`Yellow`, `▶ 기준일: ${dateStr} 이후 업데이트 (${days} 일)`);
  const timeBasis = useCreationTime ? `CreationTime` : `LastWriteTime`;
  ui.printText(`DarkGray`, `  - 날짜 기준: ${timeBasis}`);
  ui.printText(`Yellow`, `▶ 발견된 확장 프로그램 수(중복 제거 후): ${extensions.length}개`);

  if (extensions.length > 0) {
    ui.printEmpty();
    ui.printText(`Cyan`, `▶ 확장 목록:`);
    let idx = 1;
    for (const ext of extensions) {
      const t = getUpdateTime(ext.stat);
      const tStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, `0`)}-${String(t.getDate()).padStart(2, `0`)} ${String(t.getHours()).padStart(2, `0`)}:${String(t.getMinutes()).padStart(2, `0`)}:${String(t.getSeconds()).padStart(2, `0`)}`;
      ui.printText(`DarkGray`, `  ${idx}. ${ext.name}  [${tStr}]`);
      idx++;
    }
  }
};

const run3 = async () => {
  if (extensions.length === 0) {
    ui.printText(`Yellow`, `! 백업할 확장 프로그램이 없습니다.`);
    return false;
  }

  ui.printEmpty();
  const input = await ui.textInput(`Green`, `다운로드를 진행하시겠습니까? (Enter/Y:전체, n:종료, 1,3:선택):`);

  if (!input || input.trim() === `` || input.trim().toLowerCase() === `y`) {
    return true;
  }

  if (input.trim().toLowerCase() === `n`) {
    return false;
  }

  if (/^[\d,\s]+$/.test(input)) {
    const indices = input.split(`,`).map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
    const selectedExtensions = [];

    for (const idxStr of indices) {
      const idx = Number(idxStr);
      if (idx >= 1 && idx <= extensions.length) {
        selectedExtensions.push(extensions[idx - 1]);
      }
    }

    if (selectedExtensions.length > 0) {
      extensions = selectedExtensions;
      ui.printText(`Cyan`, `▶ 선택된 항목 수: ${extensions.length}개`);
      return true;
    }
    else {
      ui.printText(`Red`, `! 유효한 번호가 선택되지 않았습니다.`);
      return false;
    }
  }

  return false;
};

const run4 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 마켓플레이스에서 VSIX 다운로드 시작 (병렬 처리)...`);
  ui.printEmpty();

  // 다운로드 대상 필터링 (버전 무관 중복 방지)
  const toDownload = [];
  const existsList = [];

  for (const ext of extensions) {
    const parsed = parseExtensionName(ext.name);

    if (!parsed.publisher || !parsed.name || !parsed.version) {
      existsList.push(`${ext.name} (파싱 실패)`);
      continue;
    }

    if (existsAnyVsix(dstPath, parsed)) {
      existsList.push(ext.name);
    }
    else {
      toDownload.push(ext);
    }
  }

  for (const name of existsList) {
    const displayName = ui.formatText(name, 50);
    ui.printText(`DarkGray`, `[SKIP] ● ${displayName} - 동일 확장 VSIX 존재(버전 무관)`);
  }

  if (toDownload.length === 0) {
    ui.printLine(`Cyan`);
    ui.printText(`Cyan`, `▶ 백업 완료!`);
    ui.printText(`DarkGray`, `  - 기존: ${existsList.length} 개`);
    return;
  }

  // 병렬 다운로드
  const downloadTasks = toDownload.map((ext) => {
    return (async () => {
      const extName = ext.name;
      const parsed = parseExtensionName(extName);
      const result = { name: extName, status: `failed`, error: `` };

      try {
        let downloadUrl = `https://${parsed.publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${parsed.publisher}/extension/${parsed.name}/${parsed.version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
        if (parsed.platform) {
          downloadUrl += `?targetPlatform=${parsed.platform}`;
        }

        const vsixPath = path.join(dstPath, `${extName}.vsix`);
        const response = await fetch(downloadUrl);

        if (!response.ok) {
          result.error = `HTTP ${response.status}`;
          return result;
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        if (buffer.length > 1000) {
          fs.writeFileSync(vsixPath, buffer);
          result.status = `success`;
        }
        else {
          result.error = `파일 크기 이상`;
        }
      }
      catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
      }

      return result;
    })();
  });

  const downloadResults = await Promise.allSettled(downloadTasks);

  let success = 0;
  let failed = 0;
  let skipped = 0;
  const failedList = [];

  for (const settled of downloadResults) {
    if (settled.status !== `fulfilled`) continue;
    const r = settled.value;
    const displayName = ui.formatText(r.name, 50);

    if (r.status === `success`) {
      ui.printText(`Green`, `[DONE] ✓ ${displayName}`);
      success++;
    }
    else if (r.status === `skipped`) {
      ui.printText(`Yellow`, `[SKIP] ○ ${displayName} - ${r.error}`);
      skipped++;
    }
    else {
      ui.printText(`Red`, `[FAIL] ✗ ${displayName}`);
      failedList.push(r);
      failed++;
    }
  }

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 백업 완료!`);
  ui.printText(`Green`, `  - 성공: ${success} 개`);
  if (existsList.length > 0) {
    ui.printText(`DarkGray`, `  - 기존: ${existsList.length} 개`);
  }
  if (skipped > 0) {
    ui.printText(`Yellow`, `  - 스킵: ${skipped} 개`);
  }
  if (failed > 0) {
    ui.printText(`Red`, `  - 실패: ${failed} 개`);
    ui.printEmpty();
    ui.printText(`Red`, `▶ 실패 상세:`);
    for (const item of failedList) {
      ui.printText(`Red`, `  [${item.name}]`);
      ui.printText(`DarkGray`, `    ${item.error}`);
    }
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  await run2();
  const proceed = await run3();
  if (proceed) {
    await run4();
  }
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
