/**
 * @file run-paste-files.mjs
 * @description 프로젝트 내 파일 일괄 복사 (ESM)
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
const rootPath = envPaths.workspaceRoot;
const ignoreFolders = [`node_modules`, `bin`, `target`, `build`, `out`, `dist`, `.gradle`, `.idea`, `.git`, `.history`];
const projectMarkers = [`package.json`, `pom.xml`, `build.gradle`];
let sourceFolder = ``;
let sourceFiles = [];
let selectedRoots = [];
let commonPath = ``;
let allProjects = [];
let excludedProjects = [];

// 2. 유틸 함수 -------------------------------------------------------------------------------

const isProjectRoot = (dirPath) => {
  for (const marker of projectMarkers) {
    if (fs.existsSync(path.join(dirPath, marker))) {
      return true;
    }
  }
  return false;
};

const findProjectRoots = (root) => {
  const projects = [];
  let childDirs = [];
  try {
    childDirs = fs.readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory());
  }
  catch {
    return projects;
  }

  for (const dir of childDirs) {
    if (ignoreFolders.includes(dir.name)) {
      continue;
    }

    const dirFullPath = path.join(root, dir.name);
    if (isProjectRoot(dirFullPath)) {
      projects.push(dirFullPath);

      const clientPath = path.join(dirFullPath, `client`);
      if (fs.existsSync(clientPath) && isProjectRoot(clientPath)) {
        projects.push(clientPath);
      }
    }
  }

  return projects;
};

// 3. 파일 붙여넣기 프로세스 -------------------------------------------------------------------

const run1 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 소스 폴더를 선택하세요 (rootPath 기준)`);
  ui.printText(`DarkGray`, `- rootPath: ${rootPath}`);
  ui.printEmpty();

  let folders = [];
  try {
    folders = fs.readdirSync(rootPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  catch {
    // ignore
  }

  if (folders.length === 0) {
    ui.printText(`Red`, `! rootPath에 폴더가 없습니다.`);
    await ui.printContinue(getFileName());
  }

  for (let i = 0; i < folders.length; i++) {
    ui.printText(`White`, `- ${i + 1}: ${folders[i].name}`);
  }
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 폴더 선택:`);
  const idx = inputs.trim();
  const num = Number(idx);
  const valid = /^\d+$/.test(idx) && num >= 1 && num <= folders.length;

  if (!valid) {
    ui.printText(`Red`, `! 잘못된 선택입니다.`);
    await ui.printContinue(getFileName());
  }

  sourceFolder = path.join(rootPath, folders[num - 1].name);
  ui.printText(`Green`, `✓ 소스 폴더: ${sourceFolder}`);
};

const run2 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 복사할 파일을 선택하세요`);
  ui.printEmpty();

  let files = [];
  try {
    files = fs.readdirSync(sourceFolder, { withFileTypes: true })
      .filter((f) => f.isFile());
  }
  catch {
    // ignore
  }

  if (files.length === 0) {
    ui.printText(`Red`, `! 폴더에 파일이 없습니다: ${sourceFolder}`);
    await ui.printContinue(getFileName());
  }

  for (let i = 0; i < files.length; i++) {
    ui.printText(`White`, `- ${i + 1}: ${files[i].name}`);
  }
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 파일 선택 (쉼표로 구분, 예: 1,2,3 / all=전체):`);

  if (inputs.trim().toLowerCase() === `all`) {
    for (const file of files) {
      sourceFiles.push(file.name);
      ui.printText(`Green`, `✓ 선택됨: ${file.name}`);
    }
  }
  else {
    const indices = inputs.split(`,`).map((s) => s.trim());
    for (const idx of indices) {
      const num = Number(idx);
      if (/^\d+$/.test(idx) && num >= 1 && num <= files.length) {
        sourceFiles.push(files[num - 1].name);
        ui.printText(`Green`, `✓ 선택됨: ${files[num - 1].name}`);
      }
      else {
        ui.printText(`Red`, `! 잘못된 선택: ${idx}`);
      }
    }
  }

  if (sourceFiles.length === 0) {
    ui.printText(`Red`, `! 최소 1개 이상의 파일을 선택해야 합니다.`);
    await ui.printContinue(getFileName());
  }
};

const run3 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 대상 루트 경로를 선택하세요 (다중 선택 가능)`);
  ui.printEmpty();

  let folders = [];
  try {
    folders = fs.readdirSync(rootPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  catch {
    // ignore
  }

  if (folders.length === 0) {
    ui.printText(`Red`, `! rootPath에 폴더가 없습니다.`);
    await ui.printContinue(getFileName());
  }

  for (let i = 0; i < folders.length; i++) {
    ui.printText(`White`, `- ${i + 1}: ${folders[i].name}`);
  }
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 선택 (쉼표로 구분, 예: 1,2):`);
  const indices = inputs.split(`,`).map((s) => s.trim());

  for (const idx of indices) {
    const num = Number(idx);
    if (/^\d+$/.test(idx) && num >= 1 && num <= folders.length) {
      const targetRoot = path.join(rootPath, folders[num - 1].name);
      selectedRoots.push(targetRoot);
      ui.printText(`Green`, `✓ 추가됨: ${targetRoot}`);
    }
    else {
      ui.printText(`Red`, `! 잘못된 선택: ${idx}`);
    }
  }

  if (selectedRoots.length === 0) {
    ui.printText(`Red`, `! 최소 1개 이상의 대상 경로가 필요합니다.`);
    await ui.printContinue(getFileName());
  }
};

const run4 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 프로젝트 폴더 내 공통 대상 경로를 입력하세요`);
  ui.printText(`DarkGray`, `- 예: .node, src/config, client/.node`);
  ui.printText(`DarkGray`, `- 빈 입력 = 프로젝트 루트에 복사`);
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 공통 경로:`);
  commonPath = inputs.trim();

  if (commonPath === ``) {
    ui.printText(`DarkGray`, `- 프로젝트 루트에 복사합니다.`);
  }
  else {
    ui.printText(`Green`, `✓ 공통 경로: ${commonPath}`);
  }
};

const run5 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 발견된 프로젝트 목록`);
  ui.printEmpty();

  allProjects = [];
  for (const root of selectedRoots) {
    const projects = findProjectRoots(root);
    for (const project of projects) {
      allProjects.push(project);
    }
  }

  if (allProjects.length === 0) {
    ui.printText(`Red`, `! 프로젝트가 발견되지 않았습니다.`);
    await ui.printContinue(getFileName());
  }

  for (let i = 0; i < allProjects.length; i++) {
    const relativePath = allProjects[i].replace(rootPath, ``).replace(/^[\\/]/, ``);
    ui.printText(`White`, `- ${i + 1}: ${relativePath}`);
  }
  ui.printEmpty();

  ui.printText(`DarkGray`, `- 제외할 프로젝트 번호를 입력하세요`);
  ui.printText(`DarkGray`, `- 빈 입력 = 모든 프로젝트 포함`);
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 제외할 프로젝트 (쉼표로 구분, 예: 1,3,5):`);

  if (inputs.trim() !== ``) {
    const indices = inputs.split(`,`).map((s) => s.trim());
    for (const idx of indices) {
      const num = Number(idx);
      if (/^\d+$/.test(idx) && num >= 1 && num <= allProjects.length) {
        const excludePath = allProjects[num - 1];
        excludedProjects.push(excludePath);
        const relativePath = excludePath.replace(rootPath, ``).replace(/^[\\/]/, ``);
        ui.printText(`Red`, `✗ 제외됨: ${relativePath}`);
      }
      else {
        ui.printText(`Red`, `! 잘못된 선택: ${idx}`);
      }
    }
  }
  else {
    ui.printText(`DarkGray`, `- 모든 프로젝트가 포함됩니다.`);
  }

  const includeCount = allProjects.length - excludedProjects.length;
  ui.printEmpty();
  ui.printText(`Green`, `✓ 포함될 프로젝트: ${includeCount} 개`);
};

const run6 = () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 작업 요약`);
  ui.printText(`White`, `- 소스: ${sourceFolder}`);
  ui.printText(`White`, `- 파일: ${sourceFiles.join(`, `)}`);
  ui.printText(`White`, `- 대상 루트: ${selectedRoots.join(`, `)}`);
  ui.printText(`White`, `- 공통 경로: ${commonPath === `` ? `(프로젝트 루트)` : commonPath}`);
  ui.printText(`White`, `- 제외 프로젝트: ${excludedProjects.length}개`);
  ui.printEmpty();

  let totalSuccess = 0;
  let totalFail = 0;
  let totalSkipped = 0;

  for (const root of selectedRoots) {
    ui.printLine(`White`);
    ui.printText(`White`, `▶ 처리 중: ${root}`);

    const projects = findProjectRoots(root);
    ui.printText(`White`, `▶ 발견된 프로젝트: ${projects.length}개`);
    ui.printEmpty();

    let success = 0;
    let fail = 0;
    let skipped = 0;

    for (const project of projects) {
      if (excludedProjects.includes(project)) {
        const relativePath = project.replace(rootPath, ``).replace(/^[\\/]/, ``);
        ui.printText(`DarkGray`, `- 건너뜀 (제외됨): ${relativePath}`);
        skipped++;
        continue;
      }

      const targetDir = commonPath === `` ? project : path.join(project, commonPath);

      if (!fs.existsSync(targetDir)) {
        ui.printText(`DarkGray`, `- 경로 없음: ${targetDir}`);
        continue;
      }

      ui.printText(`White`, `- 복사 중: ${targetDir}`);
      let copied = 0;

      for (const fileName of sourceFiles) {
        const sourcePath = path.join(sourceFolder, fileName);
        const destPath = path.join(targetDir, fileName);

        try {
          fs.copyFileSync(sourcePath, destPath);
          ui.printText(`Green`, `  ✓ ${fileName}`);
          copied++;
        }
        catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          ui.printText(`Red`, `  ! ${fileName} - ${errMsg}`);
        }
      }

      if (copied > 0) {
        success++;
      }
      else {
        fail++;
      }
    }

    ui.printText(`Green`, `✓ 완료 - 성공: ${success} | 실패: ${fail} | 건너뜀: ${skipped}`);
    totalSuccess += success;
    totalFail += fail;
    totalSkipped += skipped;
  }

  ui.printLine(`Green`);
  ui.printText(`Green`, `▶ 전체 복사 완료 - 성공: ${totalSuccess} | 실패: ${totalFail} | 건너뜀: ${totalSkipped}`);
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  await run2();
  await run3();
  await run4();
  await run5();
  run6();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
