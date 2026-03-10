/**
 * @file run-remove-files.mjs
 * @description 프로젝트 내 파일/폴더 일괄 삭제 (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const rootPath = envPaths.workspaceRoot;
const ignoreFolders = new Set([
  `node_modules`, `bin`, `target`, `build`, `out`, `dist`, `.gradle`, `.idea`, `.git`, `.history`,
]);
const projectMarkers = [ `package.json`, `pom.xml`, `build.gradle` ];
const deleteTargets = [];
const selectedRoots = [];
let commonPath = ``;
let allProjects = [];
const excludedProjects = [];

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
    if (ignoreFolders.has(dir.name)) {
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

// 3. 파일 삭제 프로세스 -----------------------------------------------------------------------

const run1 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 삭제할 파일/폴더명을 입력하세요`);
  ui.printText(`DarkGray`, `- 쉼표로 구분하여 다중 입력 가능`);
  ui.printText(`DarkGray`, `- 예: gitignore, .node, temp.txt`);
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 삭제 대상:`);
  const targets = inputs.split(`,`).map((s) => s.trim()).filter((s) => s !== ``);

  for (const target of targets) {
    deleteTargets.push(target);
    ui.printText(`Green`, `✓ 추가됨: ${target}`);
  }

  if (deleteTargets.length === 0) {
    ui.printText(`Red`, `! 최소 1개 이상의 삭제 대상이 필요합니다.`);
    await ui.printContinue(getFileName());
  }
};

const run2 = async () => {
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

  for (const [ i, folder ] of folders.entries()) {
    ui.printText(`White`, `- ${i + 1}: ${folder.name}`);
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

const run3 = async () => {
  ui.printLine(`Yellow`);
  ui.printText(`Yellow`, `▶ 프로젝트 폴더 내 공통 대상 경로를 입력하세요`);
  ui.printText(`DarkGray`, `- 예: .node, src/config, client/.node`);
  ui.printText(`DarkGray`, `- 빈 입력 = 프로젝트 루트에서 삭제`);
  ui.printEmpty();

  const inputs = await ui.textInput(`Yellow`, `▶ 공통 경로:`);
  commonPath = inputs.trim();

  if (commonPath === ``) {
    ui.printText(`DarkGray`, `- 프로젝트 루트에서 삭제합니다.`);
  }
  else {
    ui.printText(`Green`, `✓ 공통 경로: ${commonPath}`);
  }
};

const run4 = async () => {
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

  for (const [ i, allProject ] of allProjects.entries()) {
    const relativePath = allProject.replace(rootPath, ``).replace(/^[/\\]/, ``);
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
        const relativePath = excludePath.replace(rootPath, ``).replace(/^[/\\]/, ``);
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

const confirmDelete = async () => {
  ui.printLine(`Red`);
  ui.printText(`Red`, `▶ 삭제 작업 확인`);
  ui.printText(`White`, `- 삭제 대상: ${deleteTargets.join(`, `)}`);
  ui.printText(`White`, `- 대상 루트: ${selectedRoots.join(`, `)}`);
  ui.printText(`White`, `- 공통 경로: ${commonPath === `` ? `(프로젝트 루트)` : commonPath}`);
  ui.printText(`White`, `- 제외 프로젝트: ${excludedProjects.length}개`);
  ui.printEmpty();
  ui.printText(`Red`, `! 이 작업은 되돌릴 수 없습니다.`);
  ui.printEmpty();

  const inputs = await ui.textInput(`Red`, `▶ 계속하시겠습니까? (y/n):`);
  return inputs.trim().toLowerCase() === `y`;
};

const executeDelete = () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 삭제 작업 시작`);
  ui.printEmpty();

  let totalDeleted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const root of selectedRoots) {
    ui.printLine(`White`);
    ui.printText(`White`, `▶ 처리 중: ${root}`);

    const projects = findProjectRoots(root);
    ui.printText(`White`, `▶ 발견된 프로젝트: ${projects.length}개`);
    ui.printEmpty();

    let deleted = 0;
    let failed = 0;
    let skipped = 0;

    for (const project of projects) {
      if (excludedProjects.includes(project)) {
        const relativePath = project.replace(rootPath, ``).replace(/^[/\\]/, ``);
        ui.printText(`DarkGray`, `- 건너뜀 (제외됨): ${relativePath}`);
        skipped++;
        continue;
      }

      const targetDir = commonPath === `` ? project : path.join(project, commonPath);

      if (!fs.existsSync(targetDir)) {
        continue;
      }

      for (const target of deleteTargets) {
        const targetPath = path.join(targetDir, target);

        if (fs.existsSync(targetPath)) {
          try {
            fs.rmSync(targetPath, { recursive: true, force: true });
            ui.printText(`Green`, `✓ 삭제: ${targetPath}`);
            deleted++;
          }
          catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            ui.printText(`Red`, `! 실패: ${targetPath} - ${errMsg}`);
            failed++;
          }
        }
      }
    }

    ui.printText(`Green`, `✓ 완료 - 삭제: ${deleted} | 실패: ${failed} | 건너뜀: ${skipped}`);
    totalDeleted += deleted;
    totalFailed += failed;
    totalSkipped += skipped;
  }

  ui.printLine(`Green`);
  ui.printText(`Green`, `▶ 전체 삭제 완료 - 삭제: ${totalDeleted} | 실패: ${totalFailed} | 건너뜀: ${totalSkipped}`);
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await run1();
  await run2();
  await run3();
  await run4();

  const confirmed = await confirmDelete();
  if (confirmed) {
    executeDelete();
  }

  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
