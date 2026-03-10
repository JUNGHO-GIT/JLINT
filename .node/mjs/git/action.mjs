/**
 * @file action.mjs
 * @description Git 관련 액션 엔트리 및 공통 유틸리티
 * @author Jungho
 * @since 2025-12-03
 */

// @ts-check
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { logger, fileExists } from "../../lib/utils.mjs";
import { env } from "../../lib/env.mjs";
import { settings } from "../../lib/settings.mjs";

const __filename = fileURLToPath(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
  `--npm`,
  `--pnpm`,
  `--yarn`,
  `--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [
  `--push`,
  `--fetch`,
].includes(arg))?.replace(`--`, ``) || ``;
const args3 = argv.find((arg) => [
  `--y`,
  `--n`,
].includes(arg))?.replace(`--`, ``) || ``;
const BACKUP_DIR = path.join(`.node`, `.tmp`);
const BACKUP_PATH = path.join(BACKUP_DIR, `git.mjs.backup.json`);

export const gitRemotes = settings.gitRemotes;

const isDirectRun = (importMetaUrl = ``) => {
  const hasArgvPath = typeof process.argv[1] === `string` && process.argv[1].trim() !== ``;
  const currentModulePath = fileURLToPath(importMetaUrl);
  const executedModulePath = hasArgvPath ? path.resolve(process.argv[1]) : ``;
  const isSamePath = hasArgvPath && path.resolve(currentModulePath) === executedModulePath;
  const result = isSamePath;

  return result;
};

export const getTimestamp = () => {
  const now = new Date();
  const result = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

  return result;
};

export const execSilent = (cmd = ``) => {
  let result = false;

  try {
    execSync(cmd, { "stdio": `pipe` });
    result = true;
  }
  catch {
    result = false;
  }

  return result;
};

export const execOutput = (cmd = ``) => {
  let result = ``;

  try {
    result = execSync(cmd, {
      "encoding": `utf8`,
      "stdio": `pipe`,
    }).trim();
  }
  catch {
    result = ``;
  }

  return result;
};

const purgeRemoteRefs = (remoteName = ``) => {
  if (!remoteName) {
    return;
  }

  let purged = false;
  const refsDir = path.join(`.git`, `refs`, `remotes`, remoteName);

  if (fs.existsSync(refsDir)) {
    try {
      fs.rmSync(refsDir, { "recursive": true, "force": true });
      fs.mkdirSync(refsDir, { "recursive": true });
      purged = true;
    }
    catch (error) {
      logger(`warn`, `loose refs 정리 실패 (${remoteName}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const packedRefsPath = path.join(`.git`, `packed-refs`);
  if (fs.existsSync(packedRefsPath)) {
    try {
      const content = fs.readFileSync(packedRefsPath, `utf8`);
      const prefix = `refs/remotes/${remoteName}/`;
      const hasEntries = content.includes(prefix);

      if (hasEntries) {
        const cleaned = content
          .split(/\n/)
          .filter((line) => !line.includes(prefix))
          .join(`\n`);
        fs.writeFileSync(packedRefsPath, cleaned, `utf8`);
        purged = true;
      }
    }
    catch (error) {
      logger(`warn`, `packed-refs 정리 실패 (${remoteName}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (purged) {
    logger(`info`, `remote tracking refs 정리 완료: ${remoteName}`);
  }
};

export const safeFetch = (remoteName = ``, options = ``, stdio = `pipe`) => {
  const cmd = `git fetch ${remoteName} ${options}`.trim();
  let result = false;

  try {
    execSync(cmd, { "stdio": stdio });
    result = true;
  }
  catch {
    logger(`warn`, `fetch 실패 - remote tracking refs 복구 후 재시도: ${remoteName}`);
    purgeRemoteRefs(remoteName);

    try {
      execSync(cmd, { "stdio": stdio });
      logger(`success`, `fetch 재시도 성공: ${remoteName}`);
      result = true;
    }
    catch (error) {
      logger(`error`, `fetch 재시도 실패 (${remoteName}): ${error instanceof Error ? error.message : String(error)}`);
      result = false;
    }
  }

  return result;
};

export const remoteUtils = {
  "getSettings": (remoteName = ``) => (remoteName === gitRemotes.public.name ? gitRemotes.public
      : remoteName === gitRemotes.private.name ? gitRemotes.private
        : null),

  "getBranch": (remoteName = ``) => remoteUtils.getSettings(remoteName)?.branch || null,

  "exists": (remoteName = ``) => execSilent(`git remote get-url ${remoteName}`),

  "branchExists": (remoteName = ``, branchName = ``) => execSilent(`git ls-remote --exit-code --heads ${remoteName} ${branchName}`),

  "hasLocalBranch": (branch = ``) => (branch ? execSilent(`git show-ref --verify --quiet refs/heads/${branch}`) : false),

  "ensureLocalFromRemote": function(branch = ``, remoteName = ``) {
    const canProceed = branch && remoteName && remoteUtils.exists(remoteName);
    let result = false;

    if (canProceed) {
      const fetchOk = safeFetch(remoteName, `--prune`);
      if (fetchOk) {
        result = execSilent(`git fetch ${remoteName} ${branch}`)
          && execSilent(`git checkout -B ${branch} FETCH_HEAD`);
      }
    }

    return result;
  },
};

const setDefaultBranches = () => {
  const remoteNames = [
    gitRemotes.public.name,
    gitRemotes.private.name,
  ];

  remoteNames.forEach((remoteName) => {
    if (!remoteUtils.exists(remoteName)) {
      logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 기본브랜치 설정 건너뜀`);
      return;
    }

    const targetBranch = remoteUtils.getBranch(remoteName);
    if (!targetBranch) {
      logger(`warn`, `원격 기본브랜치를 찾을 수 없습니다: ${remoteName}`);
      return;
    }

    if (!remoteUtils.branchExists(remoteName, targetBranch)) {
      return;
    }

    const remoteUrl = execOutput(`git remote get-url ${remoteName}`);
    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^./]+)/);
    if (!match) {
      return;
    }

    const [
      , owner,
      repo,
    ] = match;

    try {
      execSync(`gh api repos/${owner}/${repo} -X PATCH -f default_branch=${targetBranch}`, { "stdio": `pipe` });
      logger(`success`, `GitHub default branch 변경 완료: ${targetBranch}`);

      const shouldDeleteLegacyMain = remoteName === gitRemotes.public.name
        && targetBranch !== `main`;
      if (shouldDeleteLegacyMain) {
        execSilent(`git push ${remoteName} --delete main`)
          ? logger(`success`, `원격 'main' 브랜치 삭제 완료: ${remoteName}`)
          : logger(`info`, `원격 'main' 브랜치 없음 또는 이미 삭제됨`);
      }
    }
    catch (error) {
      logger(`warn`, `GitHub default branch 설정 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};

const cleanupBranches = () => {
  logger(`info`, `불필요한 브랜치 정리 시작`);

  const uniqueDefaults = [
    ...new Set([
      remoteUtils.getBranch(gitRemotes.public.name),
      remoteUtils.getBranch(gitRemotes.private.name),
    ].filter(Boolean)),
  ];

  if (uniqueDefaults.length === 0) {
    logger(`warn`, `기본브랜치 설정을 찾을 수 없습니다 - 브랜치 정리 스킵`);
    return;
  }

  cleanupLocalBranches(uniqueDefaults);
  cleanupRemoteBranches();
  logger(`success`, `브랜치 정리 완료`);
};

const cleanupLocalBranches = (uniqueDefaults = []) => {
  const localBranches = execOutput(`git branch --list`)
    .split(/\r?\n/)
    .map((branch) => branch.replace(/^\*?\s*/, ``).trim())
    .filter(Boolean);
  const localToDelete = localBranches.filter((branch) => !uniqueDefaults.includes(branch));

  if (localToDelete.length === 0) {
    return;
  }

  const currentBranch = execOutput(`git branch --show-current`);
  if (!uniqueDefaults.includes(currentBranch)) {
    const switchTo = String(uniqueDefaults[0] || ``);
    if (switchTo) {
      switchToDefaultBranch(switchTo);
    }
  }

  const afterBranch = execOutput(`git branch --show-current`);
  localToDelete
    .filter((branch) => branch !== afterBranch)
    .forEach((branch) => {
      execSilent(`git branch -D ${branch}`)
        ? logger(`success`, `로컬 브랜치 삭제 완료: ${branch}`)
        : logger(`warn`, `로컬 브랜치 삭제 실패: ${branch}`);
    });
};

const switchToDefaultBranch = (switchTo = ``) => {
  if (remoteUtils.hasLocalBranch(switchTo)) {
    execSilent(`git checkout ${switchTo}`) || logger(`warn`, `브랜치 전환 실패: ${switchTo}`);
    return;
  }

  const created = remoteUtils.ensureLocalFromRemote(switchTo, gitRemotes.private.name)
    || remoteUtils.ensureLocalFromRemote(switchTo, gitRemotes.public.name);

  created
    ? logger(`info`, `로컬 기본브랜치 생성/전환 완료: ${switchTo}`)
    : logger(`warn`, `로컬 기본브랜치 생성/전환 실패: ${switchTo}`);
};

const cleanupRemoteBranches = () => {
  const remoteNames = [
    gitRemotes.public.name,
    gitRemotes.private.name,
  ];

  remoteNames.forEach((remoteName) => {
    if (!remoteUtils.exists(remoteName)) {
      logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 원격 브랜치 정리 건너뜀`);
      return;
    }

    if (remoteName === gitRemotes.private.name) {
      logger(`info`, `Remote '${remoteName}' 원격 브랜치 삭제 건너뜀 (private 보호)`);
      return;
    }

    const targetBranch = remoteUtils.getBranch(remoteName);
    if (!targetBranch) {
      return;
    }

    const fetchOk = safeFetch(remoteName, `--prune`);
    if (!fetchOk) {
      logger(`warn`, `${remoteName} fetch 실패 - 원격 브랜치 정리 건너뜀`);
      return;
    }

    const remoteBranches = execOutput(`git branch -r --list "${remoteName}/*"`)
      .split(/\r?\n/)
      .map((branch) => branch.trim())
      .filter((branch) => branch && !branch.includes(`HEAD`))
      .map((branch) => branch.replace(`${remoteName}/`, ``));

    remoteBranches
      .filter((branch) => branch !== targetBranch)
      .forEach((branch) => {
        execSilent(`git push ${remoteName} --delete ${branch}`)
          ? logger(`success`, `원격 브랜치 삭제 완료: ${remoteName}/${branch}`)
          : logger(`warn`, `원격 브랜치 삭제 실패: ${remoteName}/${branch}`);
      });
  });
};

export const manageBranches = (mode = ``) => {
  if (mode === `setDefault`) {
    setDefaultBranches();
  }

  if (mode === `cleanup`) {
    cleanupBranches();
  }
};

export const ensureGitLfs = () => {
  logger(`info`, `Git LFS 강제 설정 시작`);

  try {
    execSync(`git lfs install --force`, { "stdio": `pipe` });
    logger(`success`, `Git LFS 설치/초기화 완료`);
  }
  catch (error) {
    logger(`warn`, `Git LFS 설정 실패: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  updateGitattributes();
  logLfsStatus();
};

const updateGitattributes = () => {
  const gitattributesPath = `.gitattributes`;
  const lfsPatterns = [
    `*.zip filter=lfs diff=lfs merge=lfs -text`,
    `*.tar.gz filter=lfs diff=lfs merge=lfs -text`,
    `*.7z filter=lfs diff=lfs merge=lfs -text`,
    `*.rar filter=lfs diff=lfs merge=lfs -text`,
    `*.png filter=lfs diff=lfs merge=lfs -text`,
    `*.jpg filter=lfs diff=lfs merge=lfs -text`,
    `*.jpeg filter=lfs diff=lfs merge=lfs -text`,
    `*.gif filter=lfs diff=lfs merge=lfs -text`,
    `*.mp4 filter=lfs diff=lfs merge=lfs -text`,
    `*.mp3 filter=lfs diff=lfs merge=lfs -text`,
    `*.pdf filter=lfs diff=lfs merge=lfs -text`,
    `*.psd filter=lfs diff=lfs merge=lfs -text`,
    `*.ai filter=lfs diff=lfs merge=lfs -text`,
    `*.vsix filter=lfs diff=lfs merge=lfs -text`,
  ];
  const existingContent = fileExists(gitattributesPath) ? fs.readFileSync(gitattributesPath, `utf8`) : ``;
  const existingLines = new Set(existingContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  const missingPatterns = lfsPatterns.filter((pattern) => !existingLines.has(pattern));

  if (missingPatterns.length === 0) {
    logger(`info`, `.gitattributes LFS 패턴 이미 설정됨`);
    return;
  }

  const separator = existingContent.trim() ? os.EOL : ``;
  const newContent = existingContent.trim() + separator + missingPatterns.join(os.EOL) + os.EOL;

  fs.writeFileSync(gitattributesPath, newContent, `utf8`);
  logger(`success`, `.gitattributes LFS 패턴 추가 완료: ${missingPatterns.length}개`);
};

const logLfsStatus = () => {
  const trackedFiles = execOutput(`git lfs ls-files`);
  const count = trackedFiles ? trackedFiles.split(/\r?\n/).length : 0;

  logger(`info`, trackedFiles ? `LFS 추적 파일 존재: ${count}개` : `LFS 추적 파일 없음`);
};

export const envManager = {
  "upsertLine": function(content = ``, key = ``, value = ``) {
    const lines = content.split(/\r?\n/);
    const rx = new RegExp(`^\\s*${key}\\s*=`, `i`);
    const idx = lines.findIndex((line) => rx.test(line));
    const nextLine = `${key}=${value}`;
    const result = idx >= 0
      ? (() => {
        lines[idx] = nextLine;
        return lines.join(os.EOL);
      })()
      : (() => {
        lines.push(nextLine);
        return lines.join(os.EOL);
      })();

    return result;
  },

  "findLine": function(content = ``, key = ``) {
    const lines = content.split(/\r?\n/);
    const rx = new RegExp(`^\\s*${key}\\s*=`, `i`);
    const idx = lines.findIndex((line) => rx.test(line));
    const result = {
      "idx": idx,
      "line": idx >= 0 ? lines[idx] : null,
    };

    return result;
  },

  "readBackup": function() {
    let result = null;

    try {
      const parsed = JSON.parse(fs.readFileSync(BACKUP_PATH, `utf8`));
      result = parsed && typeof parsed === `object` ? parsed : null;
    }
    catch {
      result = null;
    }

    return result;
  },

  "writeBackup": function(payload) {
    let result = false;

    try {
      fs.mkdirSync(BACKUP_DIR, { "recursive": true });
      fs.writeFileSync(BACKUP_PATH, `${JSON.stringify(payload, null, 2)}\n`, `utf8`);
      result = true;
    }
    catch {
      result = false;
    }

    return result;
  },

  "cleanupBackup": function() {
    try {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.unlinkSync(BACKUP_PATH);
      }

      if (fs.existsSync(BACKUP_DIR) && fs.readdirSync(BACKUP_DIR).length === 0) {
        fs.rmdirSync(BACKUP_DIR);
      }

      logger(`info`, `백업 정리 완료: ${BACKUP_PATH}`);
    }
    catch {
      logger(`warn`, `백업 정리 실패: ${BACKUP_PATH}`);
    }
  },

  "syncFiles": function() {
    syncEnvFile(`.env.development`, `DEVELOPMENT`);
    syncEnvFile(`.env.production`, `PRODUCTION`);
    logger(`info`, `.env.development/.env.production 동기화 완료`);
  },

  "modify": function() {
    if (!fileExists(`.env`)) {
      logger(`info`, `.env 파일 없음 - GLOBAL_ENV 수정 건너뜀`);
      return;
    }

    logger(`info`, `.env 파일 수정 시작 (GLOBAL_ENV=PRODUCTION)`);
    const envContent = fs.readFileSync(`.env`, `utf8`);
    const backup = envManager.readBackup() ?? {};
    const nextBackup = {
      ...backup,
      "updatedAt": new Date().toISOString(),
      "env": backup.env ?? {},
    };
    const found = envManager.findLine(envContent, `GLOBAL_ENV`);

    if (found.line) {
      nextBackup.env.GLOBAL_ENV = found.line;
    }

    envManager.writeBackup(nextBackup);
    fs.writeFileSync(`.env`, envManager.upsertLine(envContent, `GLOBAL_ENV`, `PRODUCTION`), `utf8`);
    logger(`info`, `.env 파일 수정 완료`);
  },

  "restore": function() {
    if (!fileExists(`.env`)) {
      logger(`info`, `.env 파일 없음 - GLOBAL_ENV 복원 건너뜀`);
      return;
    }

    logger(`info`, `.env 파일 복원 시작`);
    const envContent = fs.readFileSync(`.env`, `utf8`);
    const backup = envManager.readBackup();
    const hasBackup = Boolean(backup?.env?.GLOBAL_ENV);
    const restored = hasBackup
      ? (() => {
        const lines = envContent.split(/\r?\n/);
        const { idx } = envManager.findLine(envContent, `GLOBAL_ENV`);

        if (idx >= 0) {
          lines[idx] = backup.env.GLOBAL_ENV;
        }

        return lines.join(os.EOL);
      })()
      : envManager.upsertLine(envContent, `GLOBAL_ENV`, `DEVELOPMENT`);

    fs.writeFileSync(`.env`, restored, `utf8`);
    logger(`info`, `.env 파일 복원 완료`);
  },
};

const syncEnvFile = (filePath = ``, mode = ``) => {
  const abs = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(abs)) {
    logger(`info`, `env 파일 없음 - 건너뜀: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(abs, `utf8`);
  const isProd = mode === `PRODUCTION`;
  const clientUrl = isProd
    ? `https://www.${env.domain}/${env.projectName}`
    : `http://localhost:${env.localPort.client}/${env.projectName}`;
  const callbackUrl = isProd
    ? `https://www.${env.domain}/${env.projectName}/${env.gcp.callback}`
    : `http://localhost:${env.localPort.server}/${env.projectName}/${env.gcp.callback}`;

  let next = content;
  next = envManager.upsertLine(next, `ENV_MODE`, isProd ? `PRODUCTION` : `DEVELOPMENT`);
  next = envManager.upsertLine(next, `CLIENT_URL`, clientUrl);
  next = envManager.upsertLine(next, `GOOGLE_CALLBACK_URL`, callbackUrl);
  fs.writeFileSync(abs, next, `utf8`);
};

export const updateVersionAndChangelog = (msg = ``) => {
  if (!fileExists(`changelog.md`)) {
    return;
  }

  logger(`info`, `changelog.md 업데이트 시작`);
  const changelog = fs.readFileSync(`changelog.md`, `utf8`);
  const newVersion = calculateNextVersion(changelog);
  const entryContent = msg || generateChangelogEntry();
  const updatedChangelog = `${changelog}\n## \\[ ${newVersion} \\]\n\n${msg ? `- ${msg}` : entryContent}\n`;

  fs.writeFileSync(`changelog.md`, updatedChangelog, `utf8`);
  logger(`success`, `changelog.md 업데이트 완료: ${newVersion}`);
  updatePackageVersion(newVersion);
};

const calculateNextVersion = (changelog = ``) => {
  const matches = [...changelog.matchAll(/(\s*)(\d+\.\d+\.\d+)(\s*)/g)];
  const lastVersion = matches.at(-1)?.[2] ?? `0.0.0`;
  const ver = lastVersion.split(`.`).map(Number);

  ver[2]++;
  if (ver[2] >= 10) {
    ver[2] = 0;
    ver[1]++;
  }

  if (ver[1] >= 10) {
    ver[1] = 0;
    ver[0]++;
  }

  return ver.join(`.`);
};

const generateChangelogEntry = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString(`ko-KR`, {
    "year": `numeric`,
    "month": `2-digit`,
    "day": `2-digit`,
  });
  const timeStr = now.toLocaleTimeString(`ko-KR`, {
    "hour": `2-digit`,
    "minute": `2-digit`,
    "second": `2-digit`,
    "hour12": false,
  });
  const result = `- ${dateStr} (${timeStr})`
    .replaceAll(/(\.\s*\()/g, ` (`)
    .replaceAll(/(\.\s*)/g, `-`)
    .replaceAll(/\((\W*)(\s*)/g, `(`);

  return result;
};

const updatePackageVersion = (newVersion = ``) => {
  if (!newVersion || !fileExists(`package.json`)) {
    return;
  }

  logger(`info`, `package.json 버전 업데이트 시작: ${newVersion}`);
  const pkg = JSON.parse(fs.readFileSync(`package.json`, `utf8`));

  pkg.version = newVersion;
  fs.writeFileSync(`package.json`, `${JSON.stringify(pkg, null, 2)}\n`, `utf8`);
  logger(`success`, `package.json 버전 업데이트 완료: ${newVersion}`);
};

export const overwritePackageDefaultScripts = () => {
  if (!fileExists(`package.json`)) {
    logger(`info`, `package.json 없음 - 기본 scripts 덮어쓰기 건너뜀`);
    return;
  }

  const defaultScripts = settings?.packageJsonScripts;
  const canSync = defaultScripts
    && typeof defaultScripts === `object`
    && Object.keys(defaultScripts).length > 0;

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

    if (!hasChanged) {
      Object.entries(nextScripts).forEach(([
        key,
        value,
      ]) => {
        if (currentScripts[key] !== value) {
          hasChanged = true;
        }
      });
    }

    if (!hasChanged) {
      logger(`info`, `package.json 기본 scripts 이미 최신 상태`);
      return;
    }

    pkg.scripts = nextScripts;
    fs.writeFileSync(`package.json`, `${JSON.stringify(pkg, null, 2)}\n`, `utf8`);
    logger(`success`, `package.json 기본 scripts 초기화 후 덮어쓰기 완료`);
  }
  catch (error) {
    logger(`error`, `package.json 기본 scripts 덮어쓰기 실패: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

const main = async () => {
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
    if (args2 === `fetch`) {
      const { runFetchAction } = await import(`./fetch.mjs`);
      await runFetchAction();
    }

    if (args2 === `push`) {
      const { runPushAction } = await import(`./push.mjs`);
      await runPushAction({ "skipPrompt": args3 === `n` });
    }

    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
    process.exit(1);
  }
};

if (isDirectRun(import.meta.url)) {
  await main();
}
