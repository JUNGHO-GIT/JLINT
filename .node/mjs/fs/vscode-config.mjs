/**
 * @file vscode-config.mjs
 * @description VS Code 설정파일 동기화 (to-jnode: 로컬 -> 프로젝트, to-local: 프로젝트 -> 로컬) (ESM)
 * @author Jungho
 * @since 2026-03-02
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { logger } from "../../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = String(argv[0] || ``).trim();

// 2. 공통 설정 ------------------------------------------------------------------------------
const SUPPORTED_MODES = [
  `to-local`,
  `to-jnode`,
];
const PROJECT_SETTINGS_DIR_SEGMENTS = [
  `src`,
  `private`,
  `vscode`,
  `settings`,
];

const PROJECT_FILE_MANIFEST = [
  {
    "name": `argv.json`,
    "projectSegments": [
      `argv.json`,
    ],
    "buildLocalCandidates": (ctx = {}) => {
      const candidates = [
        ctx.vscodeHiddenDir ? path.join(ctx.vscodeHiddenDir, `argv.json`) : ``,
        ctx.codeDir ? path.join(ctx.codeDir, `argv.json`) : ``,
        ctx.codeInsidersDir ? path.join(ctx.codeInsidersDir, `argv.json`) : ``,
      ];
      const result = candidates;

      return result;
    },
  },
  {
    "name": `keybindings.json`,
    "projectSegments": [
      `keybindings.json`,
    ],
    "buildLocalCandidates": (ctx = {}) => {
      const candidates = [
        ctx.codeUserDir ? path.join(ctx.codeUserDir, `keybindings.json`) : ``,
        ctx.vscodeHiddenDir ? path.join(ctx.vscodeHiddenDir, `keybindings.json`) : ``,
        ctx.codeInsidersUserDir ? path.join(ctx.codeInsidersUserDir, `keybindings.json`) : ``,
      ];
      const result = candidates;

      return result;
    },
  },
  {
    "name": `mcp.json`,
    "projectSegments": [
      `mcp.json`,
    ],
    "buildLocalCandidates": (ctx = {}) => {
      const candidates = [
        ctx.codeUserDir ? path.join(ctx.codeUserDir, `mcp.json`) : ``,
        ctx.vscodeHiddenDir ? path.join(ctx.vscodeHiddenDir, `mcp.json`) : ``,
        ctx.codeInsidersUserDir ? path.join(ctx.codeInsidersUserDir, `mcp.json`) : ``,
      ];
      const result = candidates;

      return result;
    },
  },
  {
    "name": `settings.json`,
    "projectSegments": [
      `settings.json`,
    ],
    "buildLocalCandidates": (ctx = {}) => {
      const candidates = [
        ctx.codeUserDir ? path.join(ctx.codeUserDir, `settings.json`) : ``,
        ctx.vscodeHiddenDir ? path.join(ctx.vscodeHiddenDir, `settings.json`) : ``,
        ctx.codeInsidersUserDir ? path.join(ctx.codeInsidersUserDir, `settings.json`) : ``,
      ];
      const result = candidates;

      return result;
    },
  },
];

const PROJECT_ROOT_CANDIDATES = [
  process.cwd(),
  path.resolve(__dirname, `..`, `..`),
  path.resolve(__dirname, `..`, `..`, `..`, `..`),
];
const UNIQUE_PROJECT_ROOT_CANDIDATES = [...new Set(PROJECT_ROOT_CANDIDATES)];

// 3. 유틸 함수 ------------------------------------------------------------------------------
const getErrorMessage = (error) => {
  let errorMessage = ``;

  if (error instanceof Error) {
    errorMessage = error.message;
  }
  else {
    errorMessage = String(error);
  }

  const result = errorMessage;

  return result;
};

const parseMode = (modeArg = ``) => {
  const normalizedMode = String(modeArg || ``).trim();
  const isSupportedMode = SUPPORTED_MODES.includes(normalizedMode);
  const result = isSupportedMode ? normalizedMode : ``;

  return result;
};

const printUsage = () => {
  logger(`warn`, `사용법: bun .node/mjs/vscode-config.mjs <to-local|to-jnode>`);
  logger(`warn`, `to-local: src/private/vscode/settings -> 사용자 VS Code 실제 경로`);
  logger(`warn`, `to-jnode: 사용자 VS Code 실제 경로 -> src/private/vscode/settings`);
};

const resolveProjectRoot = (projectSettingsDirSegments = []) => {
  const matchedProjectRoot = UNIQUE_PROJECT_ROOT_CANDIDATES.find((candidateRoot) => {
    const candidateSettingsDir = path.join(candidateRoot, ...projectSettingsDirSegments);
    const existsCandidateSettingsDir = fs.existsSync(candidateSettingsDir);
    const result = existsCandidateSettingsDir;

    return result;
  }) || ``;
  const projectRoot = matchedProjectRoot || UNIQUE_PROJECT_ROOT_CANDIDATES[0];
  const result = projectRoot;

  return result;
};

const getPathContext = () => {
  const homePath = String(os.homedir() || ``).trim();
  const appDataPath = String(process.env.APPDATA || ``).trim();
  const roamingBasePath = appDataPath || (homePath ? path.join(homePath, `AppData`, `Roaming`) : ``);
  const vscodeHiddenDir = homePath ? path.join(homePath, `.vscode`) : ``;
  const codeDir = roamingBasePath ? path.join(roamingBasePath, `Code`) : ``;
  const codeUserDir = codeDir ? path.join(codeDir, `User`) : ``;
  const codeInsidersDir = roamingBasePath ? path.join(roamingBasePath, `Code - Insiders`) : ``;
  const codeInsidersUserDir = codeInsidersDir ? path.join(codeInsidersDir, `User`) : ``;
  const result = {
    "homePath": homePath,
    "appDataPath": appDataPath,
    "roamingBasePath": roamingBasePath,
    "vscodeHiddenDir": vscodeHiddenDir,
    "codeDir": codeDir,
    "codeUserDir": codeUserDir,
    "codeInsidersDir": codeInsidersDir,
    "codeInsidersUserDir": codeInsidersUserDir,
  };

  return result;
};

const normalizeCandidatePaths = (candidatePaths = []) => {
  const normalizedPaths = candidatePaths
    .map((candidatePath) => String(candidatePath || ``).trim())
    .filter((candidatePath) => candidatePath !== ``);
  const uniquePaths = [...new Set(normalizedPaths)];
  const result = uniquePaths;

  return result;
};

const resolveFirstExistingPath = (candidatePaths = []) => {
  const resolvedPath = candidatePaths.find((candidatePath) => {
    const existsCandidatePath = fs.existsSync(candidatePath);
    const result = existsCandidatePath;

    return result;
  }) || ``;
  const result = resolvedPath;

  return result;
};

const createSyncEntries = (projectSettingsDir = ``, pathContext = {}) => {
  const syncEntries = PROJECT_FILE_MANIFEST.map((manifest) => {
    const projectPath = path.join(projectSettingsDir, ...manifest.projectSegments);
    const rawLocalCandidates = manifest.buildLocalCandidates(pathContext);
    const localCandidates = normalizeCandidatePaths(rawLocalCandidates);
    const localExistingPath = resolveFirstExistingPath(localCandidates);
    const localTargetPath = localExistingPath || localCandidates[0] || ``;
    const entry = {
      "name": manifest.name,
      "projectPath": projectPath,
      "localCandidates": localCandidates,
      "localExistingPath": localExistingPath,
      "localTargetPath": localTargetPath,
    };

    return entry;
  });
  const result = syncEntries;

  return result;
};

const ensureDir = (dirPath = ``) => {
  const existsDir = fs.existsSync(dirPath);

  if (!existsDir) {
    fs.mkdirSync(dirPath, { "recursive": true });
  }
};

const validateSyncEntries = (syncEntries = [], mode = ``) => {
  const missingSourceEntries = syncEntries.filter((entry) => {
    const sourcePath = mode === `to-jnode` ? entry.localExistingPath : entry.projectPath;
    const existsSourcePath = sourcePath ? fs.existsSync(sourcePath) : false;
    const result = !existsSourcePath;

    return result;
  });

  if (missingSourceEntries.length > 0) {
    const missingMessages = missingSourceEntries.map((entry) => {
      const detailMessage = mode === `to-jnode`
        ? `${entry.name}: 후보 경로\n${entry.localCandidates.join(`\n`)}`
        : `${entry.name}: ${entry.projectPath}`;

      return detailMessage;
    });
    const message = missingMessages.join(`\n\n`);

    throw new Error(`Source settings files are missing.\n${message}`);
  }

  if (mode === `to-local`) {
    const invalidTargetEntries = syncEntries.filter((entry) => {
      const hasTargetPath = String(entry.localTargetPath || ``).trim() !== ``;
      const result = !hasTargetPath;

      return result;
    });

    if (invalidTargetEntries.length > 0) {
      const invalidMessages = invalidTargetEntries.map((entry) => `${entry.name}: 로컬 대상 경로 결정 실패`);
      const message = invalidMessages.join(`\n`);

      throw new Error(`로컬 대상 경로를 확인해주세요.\n${message}`);
    }
  }
};

const copySyncEntries = (syncEntries = [], mode = ``) => {
  let copiedCount = 0;

  for (const entry of syncEntries) {
    const sourcePath = mode === `to-jnode` ? entry.localExistingPath : entry.projectPath;
    const targetPath = mode === `to-jnode` ? entry.projectPath : entry.localTargetPath;
    const targetDir = path.dirname(targetPath);

    ensureDir(targetDir);
    fs.copyFileSync(sourcePath, targetPath);
    logger(`success`, `${entry.name} 복사 완료`);
    logger(`info`, `source: ${sourcePath}`);
    logger(`info`, `target: ${targetPath}`);
    copiedCount += 1;
  }

  const result = copiedCount;

  return result;
};

// 4. VS Code 설정파일 동기화 -----------------------------------------------------------------
const syncVscodeConfig = (mode = ``) => {
  const projectRoot = resolveProjectRoot(PROJECT_SETTINGS_DIR_SEGMENTS);
  const projectSettingsDir = path.join(projectRoot, ...PROJECT_SETTINGS_DIR_SEGMENTS);
  const pathContext = getPathContext();

  ensureDir(projectSettingsDir);

  const syncEntries = createSyncEntries(projectSettingsDir, pathContext);
  validateSyncEntries(syncEntries, mode);
  const copiedCount = copySyncEntries(syncEntries, mode);
  const modeLabel = mode === `to-jnode`
    ? `to-jnode (실제 사용자 경로 -> 프로젝트)`
    : `to-local (프로젝트 -> 실제 사용자 경로)`;
  const result = {
    "modeLabel": modeLabel,
    "projectSettingsDir": projectSettingsDir,
    "copiedCount": copiedCount,
  };

  return result;
};

// 99. run ------------------------------------------------------------------------------------
(() => {
  let exitCode = 0;

  try {
    logger(`info`, `스크립트 실행: ${TITLE}`);
    logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
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
    const syncResult = syncVscodeConfig(mode);

    logger(`info`, `VS Code 설정파일 동기화 완료`);
    logger(`info`, `모드: ${syncResult.modeLabel}`);
    logger(`info`, `프로젝트 경로: ${syncResult.projectSettingsDir}`);
    logger(`success`, `복사 파일 수: ${syncResult.copiedCount}`);
  }
  catch (error) {
    const errorMessage = getErrorMessage(error);

    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errorMessage}`);
    exitCode = 1;
  }

  process.exit(exitCode);
})();
