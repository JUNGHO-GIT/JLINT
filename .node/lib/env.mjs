/**
 * @file env.mjs
 * @description 프로젝트 공통 환경 설정
 * @author Jungho
 * @since 2025-12-02
 */

import { settings } from "./settings.mjs";

// 1. 프로젝트 정보 ---------------------------------------------------------------------------
const project = {
  "basePath": `/var/www`,
  "domain": `junghomun.com`,
  "name": `LIFECHANGE`,
};

// 2. 사용자/로컬/서버 ------------------------------------------------------------------------
const user = {
  "homePath": `C:\\Users\\jungh`,
};
const local = {
  "port": {
    "client": 3000,
    "server": 4001,
  },
};
const server = {
  "ip": `104.196.212.101`,
};

// 3. 툴링 설정 ------------------------------------------------------------------------------
const tooling = {
  "http": {
    "requestTimeoutMs": 10_000,
  },
  "sync": {
    "http": {
      "userAgent": `JNODE-Sync`,
      "githubTokenEnvKey": `GITHUB_TOKEN`,
      "githubApiAccept": `application/vnd.github+json`,
      "githubApiVersion": `2022-11-28`,
    },
    "cdn": {
      "githubApiBaseUrl": `https://api.github.com`,
      "defaultGithubApiBaseUrl": `https://api.github.com`,
    },
    "meta": {
      "fileName": `sync-meta.json`,
      "version": 1,
      "selfUpdateTempSuffix": `.next`,
    },
  },
  "gcloud": {
    "client": {
      "buildDirName": `build`,
      "archiveFileName": `build.tar.gz`,
      "remoteClientDirName": `client`,
      "remoteExtractStripComponents": 1,
    },
    "server": {
      "cleanupPaths": [
        `.node`,
        `.idea`,
        `.github`,
        `.vscode`,
        `.gitattributes`,
        `.gitignore`,
        `.gitignore.private`,
        `.gitignore.public`,
        `.server.swcrc`,
        `eslint.config.mjs`,
        `package.default.json`,
        `tsconfig.default.json`,
      ],
    },
  },
  "aiConfig": {
    "projectAiDirSegments": settings.aiConfig.projectDirSegments,
    "localDirNames": settings.aiConfig.localDirNames,
  },
};

// 4. 클라우드/접속 정보 ----------------------------------------------------------------------
const cloud = {
  "gcp": {
    "bucket": `jungho-bucket`,
    "path": `LIFECHANGE/SERVER/build.tar.gz`,
    "callback": `api/auth/google/callback`,
  },
  "ssh": {
    "win": {
      "keyPath": `C:\\Users\\jungh\\.ssh\\JKEY`,
      "serviceId": `junghomun00`,
    },
    "linux": {
      "keyPath": `~/ssh/JKEY`,
      "serviceId": `junghomun1234`,
    },
  },
};

// 5. 정리 대상 (옵션) ------------------------------------------------------------------------
const cleanup = {
  "clearFiles": [],
};

// 99. export --------------------------------------------------------------------------------
export const env = {
  "project": project,
  "user": user,
  "local": local,
  "server": server,
  "packageJson": settings.packageJson,
  "tooling": tooling,
  "cloud": cloud,
  "ai": settings.ai,
  "cleanup": cleanup,
  "basePath": project.basePath,
  "domain": project.domain,
  "projectName": project.name,
  "serverIp": server.ip,
  "userPath": user.homePath,
  "localPort": local.port,
  "gcp": cloud.gcp,
  "ssh": cloud.ssh,
  "aiConfig": settings.aiConfig,
  "aiSyncManifest": settings.aiSyncManifest,
  "clearFiles": cleanup.clearFiles,
};
