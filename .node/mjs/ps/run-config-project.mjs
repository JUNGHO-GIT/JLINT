/**
 * @file run-config-project.mjs
 * @description Project common file configuration script (ESM)
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
const rootPath = envPaths.gitRoot;
const listFilePath = `.etc/config/overwrite_list.conf`;
const deleteListFilePath = `.etc/config/delete_list.conf`;
const commonFilePath = `.etc/config/common`;
let projectList = [];
let projectName = ``;
let commonFileList = [];

// 2. 유틸 함수 -------------------------------------------------------------------------------
const getProjectList = () => {
  const list = [];
  if (!fs.existsSync(rootPath)) {
    return list;
  }

  const dirs = fs.readdirSync(rootPath, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== `git`);

  let i = 1;
  for (const d of dirs) {
    list.push({ number: i, name: d.name });
    i++;
  }
  return list;
};

const getCommonFileList = () => {
  const dirPath = path.join(rootPath, projectName, commonFilePath);
  const list = [];
  if (!fs.existsSync(dirPath)) {
    return list;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((f) => f.isFile());

  for (const f of files) {
    list.push({ name: f.name, path: path.join(dirPath, f.name) });
  }
  return list;
};

// 3. 프로젝트 설정 --------------------------------------------------------------------------
const run1 = async () => {
  ui.printLine(`Yellow`);
  projectList = getProjectList();

  if (projectList.length === 0) {
    ui.printText(`Red`, `! 프로젝트가 없습니다. 먼저 프로젝트를 생성하세요.`);
    await ui.printContinue(getFileName());
  }

  ui.printText(`Yellow`, `▶ 프로젝트 목록:`);
  for (const p of projectList) {
    ui.printText(`Yellow`, `▶ ${p.number}. ${p.name}`);
  }

  ui.printLine(`Yellow`);
  const inputNum = await ui.textInput(`Yellow`, `▶ 설정할 프로젝트 번호를 입력하세요 (1-${projectList.length}):`);

  try {
    const sel = Number(inputNum);
    if (sel < 1 || sel > projectList.length || isNaN(sel)) {
      throw new Error(`Range Error`);
    }
    projectName = projectList[sel - 1].name;
    ui.printText(`Yellow`, `▶ 선택한 프로젝트: ${projectName}`);
  }
  catch {
    ui.printText(`Red`, `! 잘못된 입력입니다.`);
    await ui.printContinue(getFileName());
  }

  // 공통 파일 목록 로드
  ui.printLine(`Yellow`);
  commonFileList = getCommonFileList();

  if (commonFileList.length === 0) {
    ui.printText(`Red`, `! 선택한 프로젝트에 공통 파일이 없습니다.`);
    await ui.printContinue(getFileName());
  }

  ui.printText(`Yellow`, `▶ 공통 파일 목록:`);
  for (const f of commonFileList) {
    ui.printText(`Yellow`, `▶ ${f.name}`);
  }
};

const run2 = () => {
  const configPath = path.join(rootPath, projectName, listFilePath);

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 공통 파일 덮어쓰기 시작`);
  ui.printText(`Cyan`, `▶ 설정 파일: ${configPath}`);

  if (!fs.existsSync(configPath)) {
    ui.printText(`Red`, `! 설정 파일이 존재하지 않습니다.`);
    return;
  }

  const targets = fs.readFileSync(configPath, `utf8`)
    .split(`\n`)
    .map((l) => l.trim())
    .filter((l) => l !== `` && !l.startsWith(`#`) && !l.startsWith(`[`));

  if (targets.length === 0) {
    ui.printText(`Red`, `! 설정 파일에 적용할 경로가 없습니다.`);
    return;
  }

  let cnt = 0;
  const projRoot = path.join(rootPath, projectName);

  for (const rel of targets) {
    const abs = path.join(projRoot, rel.trim());

    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      // 폴더인 경우
      for (const cf of commonFileList) {
        const dest = path.join(abs, cf.name);
        if (fs.existsSync(dest)) {
          fs.copyFileSync(cf.path, dest);
          ui.printText(`Green`, `▶ 덮어씀: ${dest}`);
          cnt++;
        }
        else {
          ui.printText(`Yellow`, `▶ 대상 파일 없음(스킵): ${dest}`);
        }
      }
    }
    else if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      // 파일인 경우
      const name = path.basename(abs);
      let match = false;
      for (const cf of commonFileList) {
        if (cf.name === name) {
          fs.copyFileSync(cf.path, abs);
          ui.printText(`Green`, `▶ 덮어씀: ${abs}`);
          cnt++;
          match = true;
        }
      }
      if (!match) {
        ui.printText(`Yellow`, `▶ 공통 목록에 없음(스킵): ${abs}`);
      }
    }
    else {
      ui.printText(`Red`, `! 경로 없음: ${abs}`);
    }
  }

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 총 ${cnt} 개의 파일을 덮어썼습니다.`);
};

const run3 = () => {
  const delConfigPath = path.join(rootPath, projectName, deleteListFilePath);

  if (!fs.existsSync(delConfigPath)) {
    return;
  }

  const delList = fs.readFileSync(delConfigPath, `utf8`)
    .split(`\n`)
    .map((l) => l.trim())
    .filter((l) => l !== `` && !l.startsWith(`#`) && !l.startsWith(`[`));

  if (delList.length === 0) {
    ui.printText(`Red`, `! 삭제할 파일 목록이 없습니다.`);
    return;
  }

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 불필요 파일 삭제 시작`);
  ui.printText(`Cyan`, `▶ 설정 파일: ${delConfigPath}`);

  let cnt = 0;
  const projRoot = path.join(rootPath, projectName);

  for (const rel of delList) {
    const abs = path.join(projRoot, rel.trim());
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
      ui.printText(`Green`, `▶ 삭제됨: ${abs}`);
      cnt++;
    }
    else {
      ui.printText(`Yellow`, `▶ 파일 없음(스킵): ${abs}`);
    }
  }

  ui.printText(`Cyan`, `▶ 총 ${cnt} 개의 파일을 삭제했습니다.`);
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
