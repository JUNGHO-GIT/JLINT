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
      "files": [`shared.mjs`],
    },
    {
      "sourcePath": `src/public/node/mjs/etc`,
      "targetPath": `.node/mjs/etc`,
      "files": [
        `gcloud.mjs`,
        `vsce.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/project`,
      "targetPath": `.node/mjs/project`,
      "files": [
        `sync.mjs`,
        `swc.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/fs`,
      "targetPath": `.node/mjs/fs`,
      "files": [
        `ai-config.mjs`,
        `vscode-config.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/git`,
      "targetPath": `.node/mjs/git`,
      "files": [
        `action.mjs`,
        `fetch.mjs`,
        `push.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/ps`,
      "targetPath": `.node/mjs/ps`,
      "files": [
        `run-backup-env.mjs`,
        `run-backup-vsix.mjs`,
        `run-config-project.mjs`,
        `run-fix-pwsh.mjs`,
        `run-http-loop.mjs`,
        `run-kill-debloat.mjs`,
        `run-kill-java.mjs`,
        `run-kill-node.mjs`,
        `run-kill-onedrive.mjs`,
        `run-kill-port.mjs`,
        `run-kill-service.mjs`,
        `run-make-simlink.mjs`,
        `run-paste-files.mjs`,
        `run-remove-files.mjs`,
        `run-selected.mjs`,
        `run-sql-result.mjs`,
        `run-update-npm.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/ps/lib`,
      "targetPath": `.node/mjs/ps/lib`,
      "files": [
        `classes.mjs`,
        `env.mjs`,
        `script-runtime.mjs`,
      ],
    },
    {
      "sourcePath": `src/public/node/mjs/utils`,
      "targetPath": `.node/mjs/utils`,
      "files": [
        `fix.mjs`,
        `remove.mjs`,
        `reset.mjs`,
        `sort.mjs`,
        `selected.mjs`,
        `sql-result.mjs`,
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
      "sourcePath": `src/public/git`,
      "targetPath": ``,
      "files": [
        `.gitattributes`,
        `.gitignore.public`,
        `.gitignore.private`,
      ],
    },
    {
      "sourcePath": `src/public/config`,
      "targetPath": ``,
      "files": [
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
      "folders": [ `agents`, `skills` ],
      "files": [
        `AGENTS.md`,
        `config.toml`,
        `agents/debugger.toml`,
        `agents/architect.toml`,
        `agents/explorer.toml`,
        `agents/monitor.toml`,
        `agents/reviewer.toml`,
        `agents/worker.toml`,
        `skills/.system/skill-installer/SKILL.md`,
        `skills/.system/skill-creator/SKILL.md`,
        `skills/.system/spreadsheets/SKILL.md`,
        `skills/.system/slides/SKILL.md`,
        `skills/gh-fix-ci/SKILL.md`,
        `skills/security-threat-model/SKILL.md`,
        `skills/security-best-practices/SKILL.md`,
        `skills/sentry/SKILL.md`,
        `skills/yeet/SKILL.md`,
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
    "etc": `bun run .node/mjs/shared.mjs --etc`,
    "project": `bun run .node/mjs/shared.mjs --project`,
    "fs": `bun run .node/mjs/shared.mjs --fs`,
    "git": `bun run .node/mjs/shared.mjs --git`,
    "ps": `bun run .node/mjs/shared.mjs --ps`,
    "utils": `bun run .node/mjs/shared.mjs --utils`
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
