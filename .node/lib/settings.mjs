/**
 * @file settings.mjs
 * @description 프로젝트 공통 설정 (ESM)
 * @author Jungho
 * @since 2025-12-02
 */

// 1. Git 설정 --------------------------------------------------------------------------------
const git = {
  "remotes": {
    "public": {
      "name": `public`,
      "branch": `public/main`,
    },
    "private": {
      "name": `private`,
      "branch": `private/main`,
    },
  },
  "deploy": {
    "resetBranch": `private/private/main`,
  },
};

// 2. CDN 동기화 설정 -------------------------------------------------------------------------
const cdn = {
  "owner": `JUNGHO-GIT`,
  "repo": `JNODE`,
  "repoPrivate": `JNODE_PRIVATE`,
  "defaultRemote": `private`,
  "defaultCdn": `rawGithub`,

  // 1. folders
  "folders": [
    // 1-1. node
    {
      "sourcePath": `src/public/node/lib`,
      "targetPath": `.node/lib`,
      "files": [
        `settings.mjs`,
        `utils.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs`,
      "targetPath": `.node/mjs`,
      "files": [
        `sync.mjs`,
        `swc.mjs`,
        `git.mjs`,
        `fix.mjs`,
        `reset.mjs`,
        `gcloud.mjs`,
        `vsce.mjs`,
        `sort.mjs`,
        `remove.mjs`,
        `ai-config.mjs`,
        `vscode-config.mjs`,
      ],
    },

    // 1-2. copilot
    {
      "sourcePath": `src/private/ai/copilot`,
      "targetPath": `.github`,
      "files": [`copilot-instructions.md`],
    },

    // 1-3. config
    {
      "sourcePath": `src/public/config`,
      "targetPath": ``,
      "files": [
        `.gitattributes`,
        `.gitignore.public`,
        `.gitignore.private`,
        `.server.swcrc`,
        `eslint.config.mjs`,
        `.editorconfig`,
        `license.md`,
      ],
    },
    {
      "sourcePath": `src/public/config`,
      "targetPath": `client`,
      "files": [`.client.swcrc`],
    },
  ],

  // 2. rm files -----------------------------------------------------------------------------
  "rmFiles": [
    `client/.server.swcrc`,
    `client/eslint.config.mjs`,
    `client/.gitignore`,
    `client/.gitignore.public`,
    `client/.gitignore.private`,
    `client/.gitattributes`,
    `client/license.md`,
    `client/.editorconfig`,
  ],
};

// 3. AI 설정 동기화 --------------------------------------------------------------------------
const ai = {
  "config": {
    "projectDirSegments": [
      `src`,
      `private`,
      `ai`,
    ],
    "localDirNames": {
      "codex": `.codex`,
      "claude": `.claude`,
      "copilot": `.copilot`,
      "gemini": `.gemini`,
    },
  },
  "syncManifest": {
    "claude": {
      "folders": [],
      "files": [
        `claud-instructions.md`,
        `CLAUDE.md`,
        `settings.json`,
      ],
    },
    "codex": {
      "folders": [`agents`],
      "files": [
        `AGENTS.md`,
        `config.toml`,
        `agents/debugger.toml`,
        `agents/architect.toml`,
        `agents/explorer.toml`,
        `agents/monitor.toml`,
        `agents/reviewer.toml`,
        `agents/worker.toml`,
      ],
    },
    "copilot": {
      "folders": [],
      "files": [
        `config.json`,
        `copilot-instructions.md`,
      ],
    },
    "gemini": {
      "folders": [],
      "files": [
        `gemini-instructions.md`,
        `settings.json`,
      ],
    },
  },
};

// 4. package.json 기본값 ---------------------------------------------------------------------
const packageJson = {
  "scripts": {
    "sync": "bun .node/mjs/sync.mjs --bun --sync --server",
    "start": "bun .node/mjs/swc.mjs --bun --start --server",
    "build": "bun .node/mjs/swc.mjs --bun --build --server",
    "fix": "bun .node/mjs/fix.mjs --bun --fix",
    "sort": "bun .node/mjs/sort.mjs --bun --sort",
    "selected": "node .node/mjs/selected.mjs --bun --selected",
    "reset": "bun .node/mjs/reset.mjs --bun --reset",
    "remove": "bun .node/mjs/remove.mjs --bun --remove",
    "vsce": "bun .node/mjs/vsce.mjs --bun --package",
    "gcloud": "bun .node/mjs/gcloud.mjs --bun --server",
    "git-fetch": "bun .node/mjs/git.mjs --bun --fetch",
    "git-push-msg-y": "bun .node/mjs/git.mjs --bun --push --y",
    "git-push-msg-n": "bun .node/mjs/git.mjs --bun --push --n",
    "fs:ai-to-local": "bun .node/mjs/ai-config.mjs to-local",
    "fs:ai-to-jnode": "bun .node/mjs/ai-config.mjs to-jnode",
    "fs:vscode-to-local": "bun .node/mjs/vscode-config.mjs to-local",
    "fs:vscode-to-jnode": "bun .node/mjs/vscode-config.mjs to-jnode"
  },
};

// 99. export ---------------------------------------------------------------------------------
export const settings = {
  "git": git,
  "cdn": cdn,
  "gitRemotes": git.remotes,
  "gitDeploy": git.deploy,
  "cdnOwner": cdn.owner,
  "cdnRepo": cdn.repo,
  "cdnRepoPrivate": cdn.repoPrivate,
  "cdnDefaultRemote": cdn.defaultRemote,
  "cdnDefaultCdn": cdn.defaultCdn,
  "cdnFolders": cdn.folders,
  "cdnRmFiles": cdn.rmFiles,
  "ai": ai,
  "packageJson": packageJson,
  "aiConfig": ai.config,
  "aiSyncManifest": ai.syncManifest,
  "packageJsonScripts": packageJson.scripts,
};
