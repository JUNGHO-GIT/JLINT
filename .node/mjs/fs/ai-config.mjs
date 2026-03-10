/**
 * @file ai-config.mjs
 * @description AI 설정파일 동기화 (to-jnode: 로컬 -> 프로젝트, to-local: 프로젝트 -> 로컬) (ESM)
 * @author Jungho
 * @since 2025-12-10
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { env } from "../../lib/env.mjs";
import { settings } from "../../lib/settings.mjs";
import { createDir, logger } from "../../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = String(argv[0] || ``).trim();

// 2. 공통 설정 ------------------------------------------------------------------------------
const aiConfig = settings.aiConfig;
const PROJECT_AI_DIR_SEGMENTS = Array.isArray(aiConfig.projectDirSegments) &&
  aiConfig.projectDirSegments.length > 0
  ? aiConfig.projectDirSegments
  : [
    `src`,
    `private`,
    `ai`,
  ];
const AI_LOCAL_DIR_NAMES = aiConfig.localDirNames || {};
const PROJECT_ROOT_CANDIDATES = [
  process.cwd(),
  path.resolve(__dirname, `..`, `..`),
  path.resolve(__dirname, `..`, `..`, `..`, `..`),
];
const UNIQUE_PROJECT_ROOT_CANDIDATES = [...new Set(PROJECT_ROOT_CANDIDATES)];
const resolveProjectRoot = (projectAiDirSegments = []) => {
  const matchedProjectRoot = UNIQUE_PROJECT_ROOT_CANDIDATES.find((candidateRoot) => {
    const candidateAiDir = path.join(candidateRoot, ...projectAiDirSegments);
    const existsCandidateAiDir = fs.existsSync(candidateAiDir);

    return existsCandidateAiDir;
  }) || ``;
  const projectRoot = matchedProjectRoot || UNIQUE_PROJECT_ROOT_CANDIDATES[0];

  return projectRoot;
};
const PROJECT_ROOT = resolveProjectRoot(PROJECT_AI_DIR_SEGMENTS);
const PROJECT_AI_DIR = path.join(PROJECT_ROOT, ...PROJECT_AI_DIR_SEGMENTS);
const USER_HOME_DIR = env.userPath;
const AI_LOCAL_DIR_MAP = {
  codex: path.join(USER_HOME_DIR, AI_LOCAL_DIR_NAMES.codex || `.codex`),
  claude: path.join(USER_HOME_DIR, AI_LOCAL_DIR_NAMES.claude || `.claude`),
  copilot: path.join(USER_HOME_DIR, AI_LOCAL_DIR_NAMES.copilot || `.copilot`),
  gemini: path.join(USER_HOME_DIR, AI_LOCAL_DIR_NAMES.gemini || `.gemini`),
};
const AI_SYNC_MANIFEST = settings.aiSyncManifest;

// 3. 유틸 함수 ------------------------------------------------------------------------------
const ensureDir = (dirPath = ``) => {
  !fs.existsSync(dirPath) && createDir(dirPath);
};
const getErrorMessage = (error) => {
  let errorMessage = ``;
  errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage;
};
const resolveLocalAiDir = (aiName = ``) => {
  let localAiDir = ``;
  localAiDir = Object.hasOwn(AI_LOCAL_DIR_MAP, aiName) ? AI_LOCAL_DIR_MAP[aiName] : path.join(USER_HOME_DIR, `.${aiName}`);

  return localAiDir;
};

// 4. 실행 인자 처리 -------------------------------------------------------------------------
const parseMode = (modeArg = ``) => ([ `to-local`, `to-jnode` ].includes(modeArg) ? modeArg : ``);
const printUsage = () => {
  logger(`warn`, `사용법: node .node/mjs/ai-config.mjs <to-local|to-jnode>`);
  logger(`warn`, `to-local: src/private/ai -> C:\\Users\\...\\.(ai 실제 경로)`);
  logger(`warn`, `to-jnode: C:\\Users\\...\\.(ai 실제 경로) -> src/private/ai`);
};

// 5. AI 설정파일 동기화 ---------------------------------------------------------------------
const syncAiConfig = (mode = ``) => {
  const syncContext = mode === `to-jnode` ? {
    "sourceDir": `${USER_HOME_DIR} (AI별 실제 경로)`,
    "targetDir": PROJECT_AI_DIR,
    "modeLabel": `to-jnode (실제 사용자 경로 -> 프로젝트)`,
  } : {
    "sourceDir": PROJECT_AI_DIR,
    "targetDir": `${USER_HOME_DIR} (AI별 실제 경로)`,
    "modeLabel": `to-local (프로젝트 -> 실제 사용자 경로)`,
  };

  logger(`info`, `AI 설정파일 동기화 시작`);
  logger(`info`, `모드: ${syncContext.modeLabel}`);
  logger(`info`, `프로젝트 루트: ${PROJECT_ROOT}`);
  logger(`info`, `소스 경로: ${syncContext.sourceDir}`);
  logger(`info`, `대상 경로: ${syncContext.targetDir}`);

  if (!fs.existsSync(PROJECT_AI_DIR)) {
    logger(`error`, `프로젝트 AI 경로가 존재하지 않습니다: ${PROJECT_AI_DIR}`);
    process.exit(1);
  }

  const aiNames = Object.keys(AI_SYNC_MANIFEST);

  if (aiNames.length === 0) {
    logger(`warn`, `AI 동기화 고정 목록이 비어 있습니다.`);
    return;
  }

  let totalSuccess = 0;
  let totalFail = 0;

  for (const aiName of aiNames) {
    const manifest = AI_SYNC_MANIFEST[aiName];
    const localAiPath = resolveLocalAiDir(aiName);
    const aiSourcePath = mode === `to-jnode` ? localAiPath : path.join(PROJECT_AI_DIR, aiName);
    const aiTargetPath = mode === `to-jnode` ? path.join(PROJECT_AI_DIR, aiName) : localAiPath;

    logger(`info`, `[${aiName}] 처리 중...`);
    logger(`info`, `[${aiName}] 소스: ${aiSourcePath}`);
    logger(`info`, `[${aiName}] 대상: ${aiTargetPath}`);

    if (!fs.existsSync(aiSourcePath)) {
      logger(`warn`, `[${aiName}] 소스 경로가 없어 건너뜁니다.`);
      continue;
    }

    ensureDir(aiTargetPath);

    for (const folderPath of manifest.folders) {
      const targetFolderPath = path.join(aiTargetPath, folderPath);

      ensureDir(targetFolderPath);
    }

    if (manifest.files.length === 0) {
      logger(`warn`, `[${aiName}] 고정 파일 목록이 없습니다.`);
      continue;
    }

    for (const relativePath of manifest.files) {
      const sourceFilePath = path.join(aiSourcePath, relativePath);
      const destPath = path.join(aiTargetPath, relativePath);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(sourceFilePath)) {
        logger(`warn`, `[${aiName}] ${relativePath} - 소스 파일이 없어 건너뜁니다.`);
        continue;
      }

      try {
        ensureDir(destDir);
        fs.copyFileSync(sourceFilePath, destPath);
        logger(`success`, `[${aiName}] ${relativePath}`);
        totalSuccess++;
      }
      catch (error) {
        const errorMessage = getErrorMessage(error);
        logger(`error`, `[${aiName}] ${relativePath} - ${errorMessage}`);
        totalFail++;
      }
    }
  }

  logger(`info`, `──────────────────────────────────`);
  logger(`info`, `AI 설정파일 동기화 완료`);
  logger(`info`, `성공: ${totalSuccess} | 실패: ${totalFail}`);
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
  try {
    logger(`info`, `스크립트 실행: ${TITLE}`);
    logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
    // logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
    // logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
  }
  catch {
    logger(`warn`, `인자 파싱 오류 발생`);
    process.exit(0);
  }

  const mode = parseMode(args1);

  if (mode === ``) {
    printUsage();
    process.exit(1);
  }

  try {
    syncAiConfig(mode);
    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errorMessage = getErrorMessage(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errorMessage}`);
    process.exit(1);
  }
})();
