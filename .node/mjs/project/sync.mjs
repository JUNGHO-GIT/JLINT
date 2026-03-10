/**
 * @file sync.mjs
 * @description GitHub API에서 실시간으로 .node 폴더의 코드를 동기화 (ESM)
 * @author Jungho
 * @since 2025-12-02
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import https from "node:https";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { env } from "../../lib/env.mjs";
import { settings } from "../../lib/settings.mjs";
import { logger, fileExists } from "../../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
  `--npm`,
  `--pnpm`,
  `--yarn`,
  `--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [`--sync`].includes(arg))?.replace(`--`, ``) || ``;
const args3 = argv.find((arg) => [
  `--server`,
  `--client`,
].includes(arg))?.replace(`--`, ``) || ``;
const mode = args3 === `client` ? `client` : `server`;

// 2. 스크립트 위치 기준 프로젝트 루트 계산 --------------------------------------------------
const SCRIPT_DIR = __dirname;
const NODE_ROOT = path.resolve(SCRIPT_DIR, `..`, `..`);
const PROJECT_ROOT = path.resolve(NODE_ROOT, `..`);
const syncTooling = env?.tooling?.sync || {};
const syncHttpTooling = syncTooling.http || {};
const syncCdnTooling = syncTooling.cdn || {};
const syncMetaTooling = syncTooling.meta || {};
const httpTooling = env?.tooling?.http || {};
const HTTP_TIMEOUT_MS = Number(httpTooling.requestTimeoutMs) || 10_000;
const SYNC_HTTP_USER_AGENT = syncHttpTooling.userAgent || `JNODE-Sync`;
const SYNC_GITHUB_TOKEN_ENV_KEY = syncHttpTooling.githubTokenEnvKey || `GITHUB_TOKEN`;
const DEFAULT_GITHUB_API_BASE_URL = syncCdnTooling.defaultGithubApiBaseUrl || `https://api.github.com`;
const GITHUB_API_ACCEPT = syncHttpTooling.githubApiAccept || `application/vnd.github+json`;
const GITHUB_API_VERSION = syncHttpTooling.githubApiVersion || `2022-11-28`;
const SELF_UPDATE_TEMP_SUFFIX = syncMetaTooling.selfUpdateTempSuffix || `.next`;
const SYNC_META_FILE_NAME = syncMetaTooling.fileName || `sync-meta.json`;
const SYNC_META_VERSION = Number(syncMetaTooling.version) || 1;
const SYNC_META_PATH = path.join(NODE_ROOT, SYNC_META_FILE_NAME);
const legacyRawGithubBaseUrl = syncCdnTooling.rawGithubBaseUrl || ``;
const configuredGithubApiBaseUrl = syncCdnTooling.githubApiBaseUrl || legacyRawGithubBaseUrl;
const normalizedGithubApiBaseUrl = configuredGithubApiBaseUrl.includes(`api.github.com`)
  ? configuredGithubApiBaseUrl
  : DEFAULT_GITHUB_API_BASE_URL;
const normalizeRemoteFilePath = (filePath = ``) => String(filePath || ``)
  .split(`/`)
  .filter((segment) => segment !== ``)
  .map((segment) => encodeURIComponent(segment))
  .join(`/`);
const CDN = {
  rawGithub: (owner, repo, branch, filePath) => {
    const encodedOwner = encodeURIComponent(owner);
    const encodedRepo = encodeURIComponent(repo);
    const encodedBranch = encodeURIComponent(branch);
    const encodedFilePath = normalizeRemoteFilePath(filePath);
    const url = `${normalizedGithubApiBaseUrl}/repos/${encodedOwner}/${encodedRepo}/contents/${encodedFilePath}?ref=${encodedBranch}`;

    return url;
  },
};

// 3. HTTP GET 요청 (Promise) ----------------------------------------------------------------
const buildGithubApiHeaders = (token = ``) => {
  const headers = {
    "User-Agent": SYNC_HTTP_USER_AGENT,
    "Accept": GITHUB_API_ACCEPT,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const httpGet = (url = ``, token = ``) => new Promise((resolve, reject) => {
  const headers = buildGithubApiHeaders(token);
  const req = https.get(url, { headers: headers }, (res) => {
    const statusCode = res.statusCode || 0;
    let data = ``;

    res.on(`data`, (chunk) => {
      data += chunk;
    });

    res.on(`end`, () => {
      if (statusCode !== 200) {
        const preview = data.slice(0, 240).replaceAll(`\n`, ` `);
        reject(new Error(`HTTP ${statusCode}: ${url} - ${preview}`));
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        reject(new Error(`GitHub API 응답 파싱 실패: ${url} - ${errMsg}`));
      }
    });
  });

  req.on(`error`, reject);
  req.setTimeout(HTTP_TIMEOUT_MS, () => {
    req.destroy();
    reject(new Error(`Timeout: ${url}`));
  });
});

const decodeGithubContent = (payload = {}) => {
  const encodedContent = typeof payload.content === `string` ? payload.content : ``;

  if (!encodedContent) {
    throw new Error(`GitHub API 응답에 content가 없습니다`);
  }

  const normalizedBase64 = encodedContent.replaceAll(`\n`, ``);
  const decodedContent = Buffer.from(normalizedBase64, `base64`).toString(`utf8`);

  return decodedContent;
};

const readWindowsMachineEnv = (envKey = ``) => {
  const isWindowsPlatform = process.platform === `win32`;
  const hasEnvKey = typeof envKey === `string` && envKey.trim() !== ``;
  let machineEnvValue = ``;

  if (isWindowsPlatform && hasEnvKey) {
    const escapedEnvKey = envKey.replaceAll(`'`, `''`);
    const command = `[System.Environment]::GetEnvironmentVariable('${escapedEnvKey}', 'Machine')`;

    try {
      const machineEnvRaw = execFileSync(
        `pwsh`,
        [ `-NoProfile`, `-NonInteractive`, `-Command`, command ],
        { "encoding": `utf8`, "stdio": [ `ignore`, `pipe`, `ignore` ] },
      );
      machineEnvValue = String(machineEnvRaw || ``).trim();
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger(`warn`, `컴퓨터 환경변수 조회 실패(${envKey}): ${errMsg}`);
    }
  }

  return machineEnvValue;
};

const resolveGithubToken = (envKey = ``) => {
  const machineToken = readWindowsMachineEnv(envKey);
  const processEnvToken = process.env[envKey] || ``;
  const token = machineToken || processEnvToken;

  return token;
};

// 4. server / client 동기화 루트 결정 -------------------------------------------------------
const resolveSyncRoot = (rootMode = `server`) => {
  const isClientRoot = path.basename(PROJECT_ROOT) === `client`;
  const hasClientSub = fileExists(path.join(PROJECT_ROOT, `client`));
  const baseRoot = PROJECT_ROOT;

  const syncRoot = rootMode === `client` ? (
		isClientRoot ? baseRoot : hasClientSub ? path.join(baseRoot, `client`) : baseRoot
	) : (
		baseRoot
	);

  return syncRoot;
};

// 5. 폴더/파일 스킵 규칙 --------------------------------------------------------------------
const normalizeRelPath = (p = ``) => (p ? p.replaceAll(`\\`, `/`) : ``);

const shouldSkipFolder = (rootMode = `server`, relTargetPath = ``) => {
  const normalized = normalizeRelPath(relTargetPath);
  const segments = normalized ? normalized.split(`/`) : [];
  const hasClient = segments.includes(`client`);
  const hasServer = segments.includes(`server`);

  const skip = rootMode === `server` ? (
		hasClient
	) : rootMode === `client` ? (
		hasServer
	) : (
		false
	);

  return skip;
};

const shouldSkipFile = (rootMode = `server`, fileName = ``) => {
  const isClientFile = fileName.includes(`client`);
  const isServerFile = fileName.includes(`server`);

  const skip = rootMode === `server` ? (
		isClientFile && !isServerFile
	) : rootMode === `client` ? (
		isServerFile && !isClientFile
	) : (
		false
	);

  return skip;
};

const normalizeAbsPath = (targetPath = ``) => {
  const resolvedPath = path.resolve(targetPath);
  const normalizedPath = process.platform === `win32` ? resolvedPath.toLowerCase() : resolvedPath;

  return normalizedPath;
};

const isRunningScriptPath = (targetPath = ``) => {
  const currentScriptPath = normalizeAbsPath(__filename);
  const candidatePath = normalizeAbsPath(targetPath);
  const isSamePath = candidatePath === currentScriptPath;

  return isSamePath;
};

const scheduleSelfReplace = (tempFilePath = ``, targetFilePath = ``) => {
  const isWindowsPlatform = process.platform === `win32`;
  const windowsCommand = `ping 127.0.0.1 -n 2 > nul && move /y "${tempFilePath}" "${targetFilePath}" > nul`;
  const nonWindowsCommand = `sleep 1 && mv "${tempFilePath}" "${targetFilePath}"`;
  const command = isWindowsPlatform ? windowsCommand : nonWindowsCommand;
  const cmd = isWindowsPlatform ? `cmd` : `sh`;
  const cmdArgs = isWindowsPlatform ? [ `/d`, `/s`, `/c`, command ] : [ `-c`, command ];
  const spawnOptions = isWindowsPlatform ? {
    "detached": true,
    "stdio": `ignore`,
    "windowsHide": true,
  } : {
    "detached": true,
    "stdio": `ignore`,
  };

  const replaceTask = spawn(cmd, cmdArgs, spawnOptions);
  replaceTask.unref();
};

// 6. 동기화 핵심 로직 -----------------------------------------------------------------------
const ensureDir = (dirPath = ``, displayPath = ``) => {
  !fileExists(dirPath) && (() => {
    fs.mkdirSync(dirPath, { recursive: true });
    logger(`info`, `폴더 생성: ${displayPath} (${dirPath})`);
  })();
};

const resolveTargetDir = (syncRoot = ``, relTargetPath = ``) => {
  const normalizedTarget = normalizeRelPath(relTargetPath);
  const targetDir = !relTargetPath ? syncRoot : normalizedTarget === `client` ? syncRoot : path.join(syncRoot, relTargetPath);

  return targetDir;
};

const createContentHash = (content = ``) => {
  const hash = createHash(`sha256`).update(content, `utf8`).digest(`hex`);
  const result = hash;
  return result;
};

const createSyncRecordKey = (rootMode = `server`, relTargetPath = ``, fileName = ``) => {
  const normalizedTargetPath = normalizeRelPath(relTargetPath) || `.`;
  const key = `${rootMode}:${normalizedTargetPath}/${fileName}`;
  const result = key;
  return result;
};

const createDefaultSyncSummary = () => {
  const result = {
    "checkedFiles": 0,
    "updatedFiles": 0,
    "unchangedFiles": 0,
    "deletedFiles": 0,
    "failedFiles": 0,
    "skippedFiles": 0,
  };
  return result;
};

const resolveSyncDecision = (summary = {}) => {
  const failedFiles = Number(summary.failedFiles) || 0;
  const updatedFiles = Number(summary.updatedFiles) || 0;
  const deletedFiles = Number(summary.deletedFiles) || 0;
  const decision = failedFiles > 0 ? (
    `최신 여부 판단 불가 (오류 ${failedFiles}건)`
  ) : updatedFiles === 0 && deletedFiles === 0 ? (
    `최신 상태`
  ) : (
    `변경 반영됨`
  );

  const result = decision;
  return result;
};

const readTextFileSafely = (filePath = ``) => {
  let success = false;
  let content = ``;

  try {
    content = fs.readFileSync(filePath, `utf8`);
    success = true;
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`warn`, `파일 읽기 실패(비교 단계): ${filePath} - ${errMsg}`);
  }

  const result = {
    "success": success,
    "content": content,
  };
  return result;
};

const writeSyncMetadata = (metadataPath = ``, metadata = {}) => {
  let success = false;
  let errorMessage = ``;

  try {
    const targetDir = path.dirname(metadataPath);
    !fileExists(targetDir) && fs.mkdirSync(targetDir, { recursive: true });
    const json = `${JSON.stringify(metadata, null, 2)}\n`;
    fs.writeFileSync(metadataPath, json, `utf8`);
    success = true;
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    errorMessage = errMsg;
    logger(`error`, `sync 메타데이터 저장 실패: ${metadataPath} - ${errMsg}`);
  }

  const result = {
    "success": success,
    "error": errorMessage,
  };
  return result;
};

const overwritePackageDefaultScripts = () => {
  if (!fileExists(`package.json`)) {
    logger(`info`, `package.json 없음 - 기본 scripts 덮어쓰기 건너뜀`);
    return;
  }

  const defaultScripts = settings?.packageJsonScripts;
  const canSync = defaultScripts &&
    typeof defaultScripts === `object` &&
    Object.keys(defaultScripts).length > 0;

  if (!canSync) {
    logger(`info`, `settings.packageJsonScripts 설정 없음 - 기본 scripts 덮어쓰기 건너뜀`);
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(`package.json`, `utf8`));
    const currentScripts = pkg?.scripts && typeof pkg.scripts === `object`
      ? pkg.scripts
      : {};
    const nextScripts = {
      ...defaultScripts,
    };

    const hasSameScriptCount = Object.keys(currentScripts).length === Object.keys(nextScripts).length;
    let hasChanged = !hasSameScriptCount;

    !hasChanged && Object.entries(nextScripts).forEach(([
      key,
      value,
    ]) => {
      if (currentScripts[key] !== value) {
        hasChanged = true;
      }
    });

    if (!hasChanged) {
      logger(`info`, `package.json 기본 scripts 이미 최신 상태`);
      return;
    }

    pkg.scripts = nextScripts;
    fs.writeFileSync(`package.json`, `${JSON.stringify(pkg, null, 2)}\n`, `utf8`);
    logger(`success`, `package.json 기본 scripts 초기화 후 덮어쓰기 완료 (sync)`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `package.json 기본 scripts 덮어쓰기 실패(sync): ${errMsg}`);
    throw error;
  }
};

const syncAll = async () => {
  logger(`info`, `GitHub API 동기화 시작`);

  const gitRemotes = settings.gitRemotes;
  const cdnOwner = settings.cdnOwner;
  const cdnRepo = settings.cdnRepo;
  const cdnRepoPrivate = settings.cdnRepoPrivate;
  const cdnDefaultRemote = settings.cdnDefaultRemote;
  const cdnDefaultCdn = settings.cdnDefaultCdn;
  const cdnFolders = settings.cdnFolders;

  const isPrivate = cdnDefaultRemote === `private`;
  const owner = cdnOwner;
  const repo = isPrivate ? cdnRepoPrivate : cdnRepo;
  const branch = isPrivate ? gitRemotes.private.branch : gitRemotes.public.branch;
  const cdnType = cdnDefaultCdn;
  const token = isPrivate ? resolveGithubToken(SYNC_GITHUB_TOKEN_ENV_KEY) : ``;

  const buildUrl = CDN[cdnType];
  const syncRoot = resolveSyncRoot(mode);
  let canRun = true;
  let pendingSelfReplace = null;
  const syncSummary = createDefaultSyncSummary();
  const syncFileRecords = [];

  !buildUrl && (() => {
    logger(`error`, `지원하지 않는 CDN 타입: ${cdnType}`);
    canRun = false;
  })();

  (!Array.isArray(cdnFolders) || cdnFolders.length === 0) && (() => {
    logger(`warn`, `동기화 대상 폴더가 설정되지 않았습니다 (settings.cdnFolders 비어 있음)`);
    canRun = false;
  })();

  !fileExists(syncRoot) && (() => {
    logger(`error`, `동기화 루트 경로가 존재하지 않습니다: ${syncRoot}`);
    canRun = false;
  })();

  (isPrivate && !token) && (() => {
    logger(`error`, `private 저장소 동기화에는 ${SYNC_GITHUB_TOKEN_ENV_KEY} 환경변수가 필요합니다`);
    canRun = false;
  })();

  logger(`info`, `원격: ${cdnDefaultRemote}`);
  logger(`info`, `저장소: ${owner}/${repo}`);
  logger(`info`, `브랜치: ${branch}`);
  logger(`info`, `대상 타입: ${mode}`);
  logger(`info`, `GitHub API Base URL: ${normalizedGithubApiBaseUrl}`);
  logger(`info`, `SCRIPT_DIR: ${SCRIPT_DIR}`);
  logger(`info`, `PROJECT_ROOT: ${PROJECT_ROOT}`);
  logger(`info`, `동기화 루트 경로: ${syncRoot}`);

  if (!canRun) {
    logger(`warn`, `동기화 조건 불충족으로 실행 중단`);
    return;
  }

  for (const [ folderIndex, folder ] of cdnFolders.entries()) {
    if (!folder || !Array.isArray(folder.files)) {
      logger(`warn`, `잘못된 폴더 설정 감지, 건너뜀: ${JSON.stringify(folder)}`);
      continue;
    }

    const { sourcePath, targetPath: relTargetPath, files } = folder;

    if (shouldSkipFolder(mode, relTargetPath || ``)) {
      logger(`info`, `모드(${mode})에서 제외된 폴더: ${relTargetPath || `루트`} (index: ${folderIndex})`);
      const validFilesInSkippedFolder = files.filter((fileName) => typeof fileName === `string` && fileName !== ``);
      syncSummary.skippedFiles += validFilesInSkippedFolder.length;
      validFilesInSkippedFolder.forEach((fileName) => {
        const recordKey = createSyncRecordKey(mode, relTargetPath || ``, fileName);
        syncFileRecords.push({
          "key": recordKey,
          "mode": mode,
          "sourcePath": sourcePath || ``,
          "targetPath": normalizeRelPath(path.join(relTargetPath || ``, fileName)),
          "status": `skipped`,
          "reason": `folder-skip-rule`,
          "checkedAt": new Date().toISOString(),
        });
      });
      continue;
    }

    const targetDir = resolveTargetDir(syncRoot, relTargetPath);
    const displayPath = relTargetPath || `루트`;
    const isRoot = !relTargetPath || targetDir === syncRoot;

    logger(`info`, `대상 폴더: ${displayPath} (index: ${folderIndex})`);
    !isRoot && ensureDir(targetDir, displayPath);

    for (const fileName of files) {
      if (!fileName) {
        logger(`warn`, `파일명이 비어 있어 건너뜀 (폴더: ${displayPath})`);
        syncSummary.skippedFiles += 1;
        continue;
      }

      const recordKey = createSyncRecordKey(mode, relTargetPath || ``, fileName);
      const targetFilePath = path.join(targetDir, fileName);
      const targetPathForRecord = normalizeRelPath(path.relative(PROJECT_ROOT, targetFilePath));

      if (shouldSkipFile(mode, fileName)) {
        logger(`info`, `모드(${mode})에서 제외된 파일: ${fileName} (폴더: ${displayPath})`);
        syncSummary.skippedFiles += 1;
        syncFileRecords.push({
          "key": recordKey,
          "mode": mode,
          "sourcePath": sourcePath || ``,
          "targetPath": targetPathForRecord,
          "status": `skipped`,
          "reason": `file-skip-rule`,
          "checkedAt": new Date().toISOString(),
        });
        continue;
      }

      syncSummary.checkedFiles += 1;

      const isSelfTarget = isRunningScriptPath(targetFilePath);
      const remoteFilePath = `${sourcePath}/${fileName}`;
      const apiUrl = buildUrl(owner, repo, branch, remoteFilePath);

      logger(`info`, `GitHub API 요청 시작: ${fileName} (${apiUrl})`);

      try {
        const payload = await httpGet(apiUrl, token);
        const content = decodeGithubContent(payload);
        const remoteSha = typeof payload.sha === `string` ? payload.sha : ``;
        const remoteContentHash = createContentHash(content);
        const hasLocalFile = fileExists(targetFilePath);
        const readResult = hasLocalFile ? readTextFileSafely(targetFilePath) : {
          "success": false,
          "content": ``,
        };
        const localContentHash = readResult.success ? createContentHash(readResult.content) : ``;
        const isAlreadyLatest = readResult.success && localContentHash === remoteContentHash;
        const checkedAt = new Date().toISOString();

        if (isSelfTarget) {
          if (isAlreadyLatest) {
            syncSummary.unchangedFiles += 1;
            syncFileRecords.push({
              "key": recordKey,
              "mode": mode,
              "sourcePath": sourcePath || ``,
              "targetPath": targetPathForRecord,
              "status": `unchanged`,
              "remoteSha": remoteSha,
              "remoteContentHash": remoteContentHash,
              "localContentHash": localContentHash,
              "selfTarget": true,
              "checkedAt": checkedAt,
            });
            logger(`info`, `최신 상태 유지(자기 자신): ${targetFilePath}`);
          }
          else {
            const tempFilePath = `${targetFilePath}${SELF_UPDATE_TEMP_SUFFIX}`;
            fs.writeFileSync(tempFilePath, content, `utf8`);
            pendingSelfReplace = {
              "tempFilePath": tempFilePath,
              "targetFilePath": targetFilePath,
            };
            syncSummary.updatedFiles += 1;
            syncFileRecords.push({
              "key": recordKey,
              "mode": mode,
              "sourcePath": sourcePath || ``,
              "targetPath": targetPathForRecord,
              "status": `updated`,
              "remoteSha": remoteSha,
              "remoteContentHash": remoteContentHash,
              "localContentHash": remoteContentHash,
              "selfTarget": true,
              "checkedAt": checkedAt,
            });
            logger(`warn`, `실행 중인 파일은 종료 후 교체 예약: ${targetFilePath}`);
          }
        }
        else {
          if (isAlreadyLatest) {
            syncSummary.unchangedFiles += 1;
            syncFileRecords.push({
              "key": recordKey,
              "mode": mode,
              "sourcePath": sourcePath || ``,
              "targetPath": targetPathForRecord,
              "status": `unchanged`,
              "remoteSha": remoteSha,
              "remoteContentHash": remoteContentHash,
              "localContentHash": localContentHash,
              "selfTarget": false,
              "checkedAt": checkedAt,
            });
            logger(`info`, `최신 상태 유지: ${fileName} → ${targetFilePath}`);
          }
          else {
            fs.writeFileSync(targetFilePath, content, `utf8`);
            syncSummary.updatedFiles += 1;
            syncFileRecords.push({
              "key": recordKey,
              "mode": mode,
              "sourcePath": sourcePath || ``,
              "targetPath": targetPathForRecord,
              "status": `updated`,
              "remoteSha": remoteSha,
              "remoteContentHash": remoteContentHash,
              "localContentHash": remoteContentHash,
              "selfTarget": false,
              "checkedAt": checkedAt,
            });
            logger(`info`, `동기화 완료: ${fileName} → ${targetFilePath}`);
          }
        }
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const isNotFoundError = errMsg.includes(`HTTP 404`);
        logger(`error`, `파일 가져오기 실패: ${fileName} - ${errMsg}`);

        // 원격에 존재하지 않음(404)인 경우 로컬 파일 처리
        if (!isNotFoundError) {
          logger(`info`, `[삭제 건너뜀] 원격 파일 오류가 404가 아님: ${fileName}`);
          syncSummary.failedFiles += 1;
          syncFileRecords.push({
            "key": recordKey,
            "mode": mode,
            "sourcePath": sourcePath || ``,
            "targetPath": targetPathForRecord,
            "status": `failed`,
            "error": errMsg,
            "checkedAt": new Date().toISOString(),
          });
          continue;
        }

        if (isSelfTarget) {
          logger(`warn`, `[삭제 건너뜀] 실행 중인 자기 자신 파일: ${targetFilePath}`);
          syncSummary.skippedFiles += 1;
          syncFileRecords.push({
            "key": recordKey,
            "mode": mode,
            "sourcePath": sourcePath || ``,
            "targetPath": targetPathForRecord,
            "status": `skipped`,
            "reason": `self-target-delete-skip`,
            "checkedAt": new Date().toISOString(),
          });
          continue;
        }

        // 1. 로컬에 파일이 존재하는지 명확히 확인
        if (!fileExists(targetFilePath)) {
          logger(`info`, `[삭제 건너뜀] 로컬에 파일이 존재하지 않음: ${targetFilePath}`);
          syncSummary.skippedFiles += 1;
          syncFileRecords.push({
            "key": recordKey,
            "mode": mode,
            "sourcePath": sourcePath || ``,
            "targetPath": targetPathForRecord,
            "status": `skipped`,
            "reason": `local-file-not-found`,
            "checkedAt": new Date().toISOString(),
          });
          continue;
        }

        // 2. 파일 삭제 시도
        try {
          fs.unlinkSync(targetFilePath);
          logger(`warn`, `[삭제 성공] 원격 미존재로 로컬 파일 삭제: ${targetFilePath}`);
          syncSummary.deletedFiles += 1;
          syncFileRecords.push({
            "key": recordKey,
            "mode": mode,
            "sourcePath": sourcePath || ``,
            "targetPath": targetPathForRecord,
            "status": `deleted`,
            "checkedAt": new Date().toISOString(),
          });
        }

        // 3. 권한 문제(EBUSY, EPERM) 등으로 삭제 실패 시 에러 출력
        catch (error) {
          const deleteErrMsg = error instanceof Error ? error.message : String(error);
          logger(`error`, `[삭제 실패] 파일 삭제 중 오류 발생: ${deleteErrMsg}`);
          syncSummary.failedFiles += 1;
          syncFileRecords.push({
            "key": recordKey,
            "mode": mode,
            "sourcePath": sourcePath || ``,
            "targetPath": targetPathForRecord,
            "status": `failed`,
            "error": deleteErrMsg,
            "checkedAt": new Date().toISOString(),
          });
        }
      }
    }
  }

  if (pendingSelfReplace) {
    const { tempFilePath, targetFilePath } = pendingSelfReplace;

    try {
      scheduleSelfReplace(tempFilePath, targetFilePath);
      logger(`warn`, `자기 자신 파일 교체 예약 완료: ${targetFilePath}`);
    }
    catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger(`error`, `자기 자신 파일 교체 예약 실패: ${targetFilePath} - ${errMsg}`);
      syncSummary.failedFiles += 1;
      syncFileRecords.push({
        "key": createSyncRecordKey(mode, normalizeRelPath(path.relative(syncRoot, path.dirname(targetFilePath))), path.basename(targetFilePath)),
        "mode": mode,
        "sourcePath": ``,
        "targetPath": normalizeRelPath(path.relative(PROJECT_ROOT, targetFilePath)),
        "status": `failed`,
        "error": `self-replace-schedule-failed: ${errMsg}`,
        "checkedAt": new Date().toISOString(),
      });
    }
  }

  const sortedRecords = [ ...syncFileRecords ].sort((a, b) => {
    const aKey = typeof a.key === `string` ? a.key : ``;
    const bKey = typeof b.key === `string` ? b.key : ``;
    const result = aKey.localeCompare(bKey);
    return result;
  });
  const metadata = {
    "version": SYNC_META_VERSION,
    "updatedAt": new Date().toISOString(),
    "mode": mode,
    "syncRoot": syncRoot,
    "remote": {
      "owner": owner,
      "repo": repo,
      "branch": branch,
      "remote": cdnDefaultRemote,
      "cdnType": cdnType,
      "githubApiBaseUrl": normalizedGithubApiBaseUrl,
    },
    "summary": syncSummary,
    "files": sortedRecords,
  };
  const writeResult = writeSyncMetadata(SYNC_META_PATH, metadata);
  writeResult.success && logger(`info`, `sync 메타데이터 저장 완료: ${SYNC_META_PATH}`);

  const decision = resolveSyncDecision(syncSummary);
  logger(`info`, `동기화 요약 - checked:${syncSummary.checkedFiles}, updated:${syncSummary.updatedFiles}, unchanged:${syncSummary.unchangedFiles}, deleted:${syncSummary.deletedFiles}, failed:${syncSummary.failedFiles}, skipped:${syncSummary.skippedFiles}`);
  logger(`info`, `동기화 판정: ${decision}`);
  logger(`info`, `GitHub API 동기화 완료`);
};

// 98. settings.cdn.rmFiles 기반 후처리 삭제 ---------------------------------------------------
const removeFiles = (syncRoot = ``) => {
  const rmFiles = settings?.cdnRmFiles;
  let canRun = true;

  (!Array.isArray(rmFiles) || rmFiles.length === 0) && (() => {
    logger(`info`, `rmFiles 설정 없음 (settings.cdnRmFiles 비어 있음)`);
    canRun = false;
  })();

  if (!canRun) {
    return;
  }

  const isClientRoot = path.basename(PROJECT_ROOT) === `client`;
  const baseRoot = PROJECT_ROOT;

  for (const rel of rmFiles) {
    if (!rel) {
      logger(`warn`, `[rmFiles 건너뜀] 경로가 비어 있음`);
      continue;
    }

    let normalized = String(rel).replaceAll(`\\`, `/`).replace(/^\.\//, ``);
    isClientRoot && normalized.startsWith(`client/`) && (() => {
      normalized = normalized.slice(`client/`.length);
    })();

    const candidateByProjectRoot = path.resolve(baseRoot, normalized);
    const candidateBySyncRoot = path.resolve(syncRoot, normalized);
    const candidates = [...new Set([ candidateByProjectRoot, candidateBySyncRoot ])];

    let handled = false;

    for (const targetAbs of candidates) {
      if (!fileExists(targetAbs)) {
        continue;
      }

      const resolvedTarget = path.resolve(targetAbs);
      const resolvedProjectRoot = path.resolve(PROJECT_ROOT);
      const resolvedSyncRoot = path.resolve(syncRoot);

      if (resolvedTarget === resolvedProjectRoot || resolvedTarget === resolvedSyncRoot) {
        logger(`warn`, `[rmFiles 건너뜀] 보호 경로로 판단됨: ${resolvedTarget}`);
        handled = true;
        break;
      }

      // PROJECT_ROOT 밖이면 삭제 금지
      if (!resolvedTarget.startsWith(resolvedProjectRoot + path.sep) && resolvedTarget !== resolvedProjectRoot) {
        logger(`warn`, `[rmFiles 건너뜀] 프로젝트 루트 경로: ${resolvedTarget}`);
        handled = true;
        break;
      }

      try {
        fs.rmSync(resolvedTarget, { recursive: true, force: true });
        logger(`warn`, `[rmFiles 삭제 성공] ${resolvedTarget}`);
        handled = true;
        break;
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger(`error`, `[rmFiles 삭제 실패] ${resolvedTarget} - ${errMsg}`);
        handled = true;
        break;
      }
    }

    !handled && logger(`info`, `[rmFiles 건너뜀] 대상 경로가 존재하지 않음: ${normalized}`);
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
  try {
    logger(`info`, `스크립트 실행: ${TITLE}`);
    logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
    logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
    logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`warn`, `인자 파싱 오류 발생: ${errMsg}`);
    process.exit(0);
  }
  try {
    const hasSyncMode = args2 === `sync`;
    !hasSyncMode && logger(`warn`, `실행 모드가 없습니다. --sync 를 사용하세요.`);
    hasSyncMode && await syncAll();
    hasSyncMode && removeFiles(resolveSyncRoot(mode));
    hasSyncMode && overwritePackageDefaultScripts();

    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
    process.exit(1);
  }
})();
