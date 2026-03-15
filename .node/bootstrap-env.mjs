/**
 * @file bootstrap-env.mjs
 * @description .node sync 부트스트랩 환경 설정 (상수/변수 전용)
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// 1. 프로젝트 런타임 --------------------------------------------------------------------------
const scriptFilePath = fileURLToPath(import.meta.url);
const nodeDirPath = path.dirname(scriptFilePath);
const projectRootPath = path.resolve(nodeDirPath, `..`);
const passedArgs = process.argv.slice(2);
const runArgs = passedArgs.length > 0 ? passedArgs : [`--sync`];

// 2. 원격 기본값 ------------------------------------------------------------------------------
const remote = {
  "owner": `JUNGHO-GIT`,
  "repo": `JNODE`,
  "branch": `public/main`,
  "apiBase": `https://api.github.com`,
  "apiAccept": `application/vnd.github+json`,
  "apiVersion": `2022-11-28`,
  "userAgent": `JNODE-Sync-Bootstrap`,
  "candidates": [
    `JNODE/public/mjs/remote/shared.mjs`,
    `public/mjs/remote/shared.mjs`,
  ],
  "companionFiles": [
    `shared-constants.mjs`,
    `shared-utils.mjs`,
    `shared-remote.mjs`,
    `shared-handlers.mjs`,
  ],
};

// 3. 인증/실행 정책 --------------------------------------------------------------------------
const auth = {
  "token": ``,
  "tokenType": `Bearer`,
  "tokenMaskPattern": `Bearer\\s+[A-Za-z0-9._-]+`,
  "tokenMaskFlags": `gu`,
  "tokenMaskReplacement": `Bearer ***`,
};

const runtime = {
  "metaFileName": `bootstrap-meta.json`,
  "metaPath": path.join(nodeDirPath, `bootstrap-meta.json`),
  "remoteEntryFileName": `shared.mjs`,
  "tempDirPrefix": `jnode-sync-`,
  "defaultActionArg": `--sync`,
  "passedArgs": passedArgs,
  "runArgs": runArgs,
  "nodeDirPath": nodeDirPath,
  "projectRootPath": projectRootPath,
  "errorSummaryMaxLength": 200,
};

// 4. 메타/메시지 ------------------------------------------------------------------------------
const meta = {
  "template": {
    "version": 1,
    "status": `idle`,
    "updatedAt": ``,
    "startedAt": ``,
    "endedAt": ``,
    "selectedCandidate": ``,
    "exitCode": 0,
    "lastRunArgs": [],
    "errorSummary": ``,
  },
  "status": {
    "idle": `idle`,
    "running": `running`,
    "success": `success`,
    "failed": `failed`,
  },
  "exitCode": {
    "success": 0,
    "failed": 1,
  },
};

const messages = {
  "logPrefix": `[jnode-sync]`,
  "remoteFetchFailedPrefix": `원격 조회 실패(HTTP `,
  "remoteRunFailedPrefix": `원격 sync 실행 실패 (exit code: `,
  "remoteNotFound": `원격 public/mjs/remote/shared.mjs를 찾지 못했습니다. JNODE 최신 소스를 먼저 푸시하세요.`,
};

// 99. export ---------------------------------------------------------------------------------
export const env = {
  "remote": remote,
  "auth": auth,
  "runtime": runtime,
  "meta": meta,
  "messages": messages,
  "projectRootPath": runtime.projectRootPath,
  "runArgs": runtime.runArgs,
  "metaPath": runtime.metaPath,
  "remoteOwner": remote.owner,
  "remoteRepo": remote.repo,
  "remoteBranch": remote.branch,
};
