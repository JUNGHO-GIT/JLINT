/**
 * @file sync.mjs
 * @description GitHub CDN에서 실시간으로 .node 폴더의 코드를 동기화 (ESM)
 * @author Jungho
 * @since 2025-12-02
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import https from "node:https";
import { fileURLToPath } from "node:url";
import { settings } from "../lib/settings.mjs";
import { logger, fileExists } from "../lib/utils.mjs";

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
const NODE_ROOT = path.resolve(SCRIPT_DIR, `..`);
const PROJECT_ROOT = path.resolve(NODE_ROOT, `..`);
const CDN = { rawGithub: (owner, repo, branch, filePath) => `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}` };

// 3. HTTP GET 요청 (Promise) ----------------------------------------------------------------
const httpGet = (url = ``, token = ``) => new Promise((resolve, reject) => {
  const headers = { "User-Agent": `JNODE-Sync` };
  token && (headers.Authorization = `token ${token}`);

  const req = https.get(url, { headers: headers }, (res) => {
    const statusCode = res.statusCode || 0;
    const location = res.headers.location;

		(statusCode >= 300 && statusCode < 400 && location) ? (
			httpGet(location, token).then(resolve).catch(reject)
		) : statusCode !== 200 ? (
			reject(new Error(`HTTP ${statusCode}: ${url}`))
		) : (() => {
		  let data = ``;
		  res.on(`data`, (chunk) => {
		    data += chunk;
		  });
		  res.on(`end`, () => {
		    resolve(data);
		  });
		})();
  });

  req.on(`error`, reject);
  req.setTimeout(10_000, () => {
    req.destroy();
    reject(new Error(`Timeout: ${url}`));
  });
});

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

const syncAll = async () => {
  logger(`info`, `GitHub CDN 동기화 시작`);

  const { cdn, git } = settings;

  const isPrivate = cdn.defaultRemote === `private`;
  const owner = cdn.owner;
  const repo = isPrivate ? cdn.repoPrivate : cdn.repo;
  const branch = isPrivate ? git.remotes.private.branch : git.remotes.public.branch;
  const cdnType = cdn.defaultCdn;
  const token = isPrivate ? process.env.GITHUB_TOKEN || `` : ``;

  const buildUrl = CDN[cdnType];
  const syncRoot = resolveSyncRoot(mode);
  let canRun = true;

  !buildUrl && (() => {
    logger(`error`, `지원하지 않는 CDN 타입: ${cdnType}`);
    canRun = false;
  })();

  (!Array.isArray(cdn.folders) || cdn.folders.length === 0) && (() => {
    logger(`warn`, `동기화 대상 폴더가 설정되지 않았습니다 (settings.cdn.folders 비어 있음)`);
    canRun = false;
  })();

  !fileExists(syncRoot) && (() => {
    logger(`error`, `동기화 루트 경로가 존재하지 않습니다: ${syncRoot}`);
    canRun = false;
  })();

  logger(`info`, `원격: ${cdn.defaultRemote}`);
  logger(`info`, `저장소: ${owner}/${repo}`);
  logger(`info`, `브랜치: ${branch}`);
  logger(`info`, `대상 타입: ${mode}`);
  logger(`info`, `SCRIPT_DIR: ${SCRIPT_DIR}`);
  logger(`info`, `PROJECT_ROOT: ${PROJECT_ROOT}`);
  logger(`info`, `동기화 루트 경로: ${syncRoot}`);

  if (!canRun) {
    logger(`warn`, `동기화 조건 불충족으로 실행 중단`);
    return;
  }

  for (const [ folderIndex, folder ] of cdn.folders.entries()) {
    if (!folder || !Array.isArray(folder.files)) {
      logger(`warn`, `잘못된 폴더 설정 감지, 건너뜀: ${JSON.stringify(folder)}`);
      continue;
    }

    const { sourcePath, targetPath: relTargetPath, files } = folder;

    if (shouldSkipFolder(mode, relTargetPath || ``)) {
      logger(`info`, `모드(${mode})에서 제외된 폴더: ${relTargetPath || `루트`} (index: ${folderIndex})`);
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
        continue;
      }

      if (shouldSkipFile(mode, fileName)) {
        logger(`info`, `모드(${mode})에서 제외된 파일: ${fileName} (폴더: ${displayPath})`);
        continue;
      }

      const targetFilePath = path.join(targetDir, fileName);
      const remoteFilePath = `${sourcePath}/${fileName}`;
      const url = buildUrl(owner, repo, branch, remoteFilePath);

      logger(`info`, `다운로드 시작: ${fileName} (${url})`);

      try {
        const content = await httpGet(url, token);
        fs.writeFileSync(targetFilePath, content, `utf8`);
        logger(`info`, `동기화 완료: ${fileName} → ${targetFilePath}`);
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger(`error`, `파일 가져오기 실패: ${fileName} - ${errMsg}`);

        // 원격에 존재하지 않음(404)인 경우 로컬 파일 처리
        if (!errMsg.includes(`HTTP 404`)) {
          logger(`info`, `[삭제 건너뜀] 원격 파일 오류가 404가 아님: ${fileName}`);
        }

        // 1. 로컬에 파일이 존재하는지 명확히 확인
        if (!fileExists(targetFilePath)) {
          logger(`info`, `[삭제 건너뜀] 로컬에 파일이 존재하지 않음: ${targetFilePath}`);
        }

        // 2. 파일 삭제 시도
        try {
          fs.unlinkSync(targetFilePath);
          logger(`warn`, `[삭제 성공] 원격 미존재로 로컬 파일 삭제: ${targetFilePath}`);
        }
        catch (error) {
          // 3. 권한 문제(EBUSY, EPERM) 등으로 삭제 실패 시 에러 출력
          logger(`error`, `[삭제 실패] 파일 삭제 중 오류 발생: ${error.message}`);
        }
      }
    }
  }

  logger(`info`, `GitHub CDN 동기화 완료`);
};

// 98. settings.cdn.rmFiles 기반 후처리 삭제 ---------------------------------------------------
const removeFiles = (syncRoot = ``) => {
  const rmFiles = settings?.cdn?.rmFiles;
  let canRun = true;

  (!Array.isArray(rmFiles) || rmFiles.length === 0) && (() => {
    logger(`info`, `rmFiles 설정 없음 (settings.cdn.rmFiles 비어 있음)`);
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
        logger(`warn`, `[rmFiles 건너뜀] 프로젝트 루트 خارج 경로: ${resolvedTarget}`);
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
  catch {
    logger(`warn`, `인자 파싱 오류 발생`);
    process.exit(0);
  }
  try {
    args2 === `sync` && await syncAll();
    args2 === `sync` && removeFiles(resolveSyncRoot(mode));

    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
    process.exit(1);
  }
})();
