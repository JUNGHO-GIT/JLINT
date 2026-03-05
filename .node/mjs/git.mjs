/**
 * @file git.mjs
 * @description Git 관련 자동화 스크립트 (ESM)
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
import { logger, runPrompt, fileExists } from "../lib/utils.mjs";
import { env } from "../lib/env.mjs";
import { settings } from "../lib/settings.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
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
const gitRemotes = settings.gitRemotes;

// 2. 유틸리티 함수 --------------------------------------------------------------------------
const getTimestamp = () => {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
};
const execSilent = (cmd) => {
  try {
    execSync(cmd, { stdio: `pipe` });
    return true;
  }
  catch {
    return false;
  }
};
const execOutput = (cmd) => {
  try {
    return execSync(cmd, {
      encoding: `utf8`,
      stdio: `pipe`,
    }).trim();
  }
  catch {
    return ``;
  }
};

// 3. 원격 저장소 유틸 -----------------------------------------------------------------------
const remoteUtils = {
  getSettings: (remoteName = ``) => (remoteName === gitRemotes.public.name ? gitRemotes.public
      : remoteName === gitRemotes.private.name ? gitRemotes.private
        : null),

  getBranch: (remoteName = ``) => remoteUtils.getSettings(remoteName)?.branch || null,

  exists: (remoteName = ``) => execSilent(`git remote get-url ${remoteName}`),

  branchExists: (remoteName = ``, branchName = ``) => execSilent(`git ls-remote --exit-code --heads ${remoteName} ${branchName}`),

  hasLocalBranch: (branch = ``) => (branch ? execSilent(`git show-ref --verify --quiet refs/heads/${branch}`) : false),

  ensureLocalFromRemote: function(branch = ``, remoteName = ``) {
    const canProceed = branch && remoteName && remoteUtils.exists(remoteName);
    if (!canProceed) {
      return false;
    }

    const fetchOk = execSilent(`git fetch ${remoteName} --prune`);
    const checkoutOk = fetchOk && execSilent(`git checkout -B ${branch} ${remoteName}/${branch}`);
    return checkoutOk;
  },
};

// 4. 브랜치 관리 ----------------------------------------------------------------------------
// 4-1. 기본브랜치 설정
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
      execSync(`gh api repos/${owner}/${repo} -X PATCH -f default_branch=${targetBranch}`, { stdio: `pipe` });
      logger(`success`, `GitHub default branch 변경 완료: ${targetBranch}`);

      const shouldDeleteLegacyMain = remoteName === gitRemotes.public.name &&
        targetBranch !== `main`;
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

// 4-2. 브랜치 정리
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
  cleanupRemoteBranches(uniqueDefaults);
  logger(`success`, `브랜치 정리 완료`);
};

const cleanupLocalBranches = (uniqueDefaults = []) => {
  const localBranches = execOutput(`git branch --list`)
  .split(/\r?\n/)
  .map((b) => b.replace(/^\*?\s*/, ``).trim())
  .filter(Boolean);

  const localToDelete = localBranches.filter((b) => !uniqueDefaults.includes(b));
  if (localToDelete.length === 0) {
    return;
  }

  const currentBranch = execOutput(`git branch --show-current`);
  if (!uniqueDefaults.includes(currentBranch)) {
    const switchTo = String(uniqueDefaults[0] || ``);
    switchTo && switchToDefaultBranch(switchTo);
  }

  const afterBranch = execOutput(`git branch --show-current`);
  localToDelete
  .filter((b) => b !== afterBranch)
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

const cleanupRemoteBranches = (uniqueDefaults = []) => {
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

    execSilent(`git fetch ${remoteName} --prune`) || logger(`warn`, `${remoteName} fetch 실패`);

    const remoteBranches = execOutput(`git branch -r --list "${remoteName}/*"`)
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b && !b.includes(`HEAD`))
    .map((b) => b.replace(`${remoteName}/`, ``));

    remoteBranches
    .filter((b) => b !== targetBranch)
    .forEach((branch) => {
        execSilent(`git push ${remoteName} --delete ${branch}`)
          ? logger(`success`, `원격 브랜치 삭제 완료: ${remoteName}/${branch}`)
          : logger(`warn`, `원격 브랜치 삭제 실패: ${remoteName}/${branch}`);
    });
  });
};

const manageBranches = (mode = ``) => {
  mode === `setDefault` && setDefaultBranches();
  mode === `cleanup` && cleanupBranches();
};

// 5. Git LFS 설정 ---------------------------------------------------------------------------
const ensureGitLfs = () => {
  logger(`info`, `Git LFS 강제 설정 시작`);

  try {
    execSync(`git lfs install --force`, { stdio: `pipe` });
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
  const existingLines = new Set(existingContent.split(/\r?\n/).map((l) => l.trim())
  .filter(Boolean));
  const missingPatterns = lfsPatterns.filter((p) => !existingLines.has(p));

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

// 6. 환경변수 파일 관리 ---------------------------------------------------------------------
const envManager = {
  upsertLine: function(content = ``, key = ``, value = ``) {
    const lines = content.split(/\r?\n/);
    const rx = new RegExp(`^\\s*${key}\\s*=`, `i`);
    const idx = lines.findIndex((line) => rx.test(line));
    const nextLine = `${key}=${value}`;

    idx >= 0 ? lines[idx] = nextLine : lines.push(nextLine);
    return lines.join(os.EOL);
  },

  findLine: function(content = ``, key = ``) {
    const lines = content.split(/\r?\n/);
    const rx = new RegExp(`^\\s*${key}\\s*=`, `i`);
    const idx = lines.findIndex((line) => rx.test(line));
    return {
      idx: idx,
      line: idx >= 0 ? lines[idx] : null,
    };
  },

  readBackup: function() {
    try {
      const parsed = JSON.parse(fs.readFileSync(BACKUP_PATH, `utf8`));
      return parsed && typeof parsed === `object` ? parsed : null;
    }
    catch {
      return null;
    }
  },

  writeBackup: function(payload) {
    try {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      fs.writeFileSync(BACKUP_PATH, `${JSON.stringify(payload, null, 2)}\n`, `utf8`);
      return true;
    }
    catch {
      return false;
    }
  },

  cleanupBackup: function() {
    try {
      fs.existsSync(BACKUP_PATH) && fs.unlinkSync(BACKUP_PATH);
      fs.existsSync(BACKUP_DIR) && fs.readdirSync(BACKUP_DIR).length === 0 && fs.rmdirSync(BACKUP_DIR);
      logger(`info`, `백업 정리 완료: ${BACKUP_PATH}`);
    }
    catch {
      logger(`warn`, `백업 정리 실패: ${BACKUP_PATH}`);
    }
  },

  syncFiles: function() {
    syncEnvFile(`.env.development`, `DEVELOPMENT`);
    syncEnvFile(`.env.production`, `PRODUCTION`);
    logger(`info`, `.env.development/.env.production 동기화 완료`);
  },

  modify: function() {
    if (!fileExists(`.env`)) {
      logger(`info`, `.env 파일 없음 - GLOBAL_ENV 수정 건너뜀`);
      return;
    }

    logger(`info`, `.env 파일 수정 시작 (GLOBAL_ENV=PRODUCTION)`);
    const envContent = fs.readFileSync(`.env`, `utf8`);
    const backup = envManager.readBackup() ?? {};
    const nextBackup = {
      ...backup,
      updatedAt: new Date().toISOString(),
      env: backup.env ?? {},
    };

    const found = envManager.findLine(envContent, `GLOBAL_ENV`);
    found.line && (nextBackup.env.GLOBAL_ENV = found.line);
    envManager.writeBackup(nextBackup);

    fs.writeFileSync(`.env`, envManager.upsertLine(envContent, `GLOBAL_ENV`, `PRODUCTION`), `utf8`);
    logger(`info`, `.env 파일 수정 완료`);
  },

  restore: function() {
    if (!fileExists(`.env`)) {
      logger(`info`, `.env 파일 없음 - GLOBAL_ENV 복원 건너뜀`);
      return;
    }

    logger(`info`, `.env 파일 복원 시작`);
    const envContent = fs.readFileSync(`.env`, `utf8`);
    const backup = envManager.readBackup();
    const hasBackup = Boolean(backup?.env?.GLOBAL_ENV);

    const restored = hasBackup ? (() => {
      const lines = envContent.split(/\r?\n/);
      const { idx } = envManager.findLine(envContent, `GLOBAL_ENV`);
      idx >= 0 && (lines[idx] = backup.env.GLOBAL_ENV);
      return lines.join(os.EOL);
    })() : envManager.upsertLine(envContent, `GLOBAL_ENV`, `DEVELOPMENT`);

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

// 7. 버전 및 Changelog 업데이트 -------------------------------------------------------------
const updateVersionAndChangelog = (msg = ``) => {
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
  ver[2] >= 10 && (ver[2] = 0, ver[1]++);
  ver[1] >= 10 && (ver[1] = 0, ver[0]++);

  return ver.join(`.`);
};

const generateChangelogEntry = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString(`ko-KR`, {
    year: `numeric`,
    month: `2-digit`,
    day: `2-digit`,
  });
  const timeStr = now.toLocaleTimeString(`ko-KR`, {
    hour: `2-digit`,
    minute: `2-digit`,
    second: `2-digit`,
    hour12: false,
  });

  return `- ${dateStr} (${timeStr})`
  .replaceAll(/(\.\s*\()/g, ` (`)
  .replaceAll(/(\.\s*)/g, `-`)
  .replaceAll(/\((\W*)(\s*)/g, `(`);
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

// 7-1. package.json 기본 scripts 동기화 ------------------------------------------------------
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
    logger(`success`, `package.json 기본 scripts 초기화 후 덮어쓰기 완료`);
  }
  catch (error) {
    logger(`error`, `package.json 기본 scripts 덮어쓰기 실패: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

// 8. Git Fetch ------------------------------------------------------------------------------
const gitFetch = () => {
  const privateExists = remoteUtils.exists(gitRemotes.private.name);
  const publicExists = remoteUtils.exists(gitRemotes.public.name);

  if (!privateExists && !publicExists) {
    logger(`warn`, `사용 가능한 remote가 없습니다 - fetch/reset 스킵`);
    return;
  }

  const targetRemote = privateExists ? gitRemotes.private.name : gitRemotes.public.name;
  const targetBranch = remoteUtils.getBranch(targetRemote);

  if (!targetBranch) {
    logger(`warn`, `원격 기본브랜치를 찾을 수 없습니다 - fetch/reset 스킵`);
    return;
  }

  try {
    const fullRef = `${targetRemote}/${targetBranch}`;

    logger(`info`, `Git Fetch 시작: ${targetRemote}`);
    execSync(`git fetch ${targetRemote}`, { stdio: `inherit` });
    logger(`success`, `Git Fetch 완료: ${targetRemote}`);

    logger(`info`, `Git Reset Hard 시작: ${fullRef}`);
    execSync(`git reset --hard ${fullRef}`, { stdio: `inherit` });
    logger(`success`, `Git Reset Hard 완료: ${fullRef}`);
    overwritePackageDefaultScripts();
  }
  catch (error) {
    logger(`error`, `Git Fetch/Reset 실패: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

// 9. Git Push -------------------------------------------------------------------------------
const gitPush = (remoteName = ``, ignoreFilePath = ``, msg = ``, baseCommit = ``) => {
  if (!remoteUtils.exists(remoteName)) {
    logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 건너뜀`);
    return;
  }

  const targetBranch = remoteUtils.getBranch(remoteName);
  if (!targetBranch) {
    logger(`warn`, `원격 기본브랜치를 찾을 수 없습니다: ${remoteName} - push 스킵`);
    return;
  }

  const fullRef = `${remoteName}/${targetBranch}`;
  logger(`info`, `Git Push 시작: ${remoteName} (${fullRef})`);

  // 베이스 커밋으로 리셋 (각 push마다 독립적인 커밋 생성)
  if (baseCommit) {
    logger(`info`, `베이스 커밋으로 리셋: ${baseCommit}`);
    execSync(`git reset --hard ${baseCommit}`, { stdio: `pipe` });
  }

  const ignorePublicFile = fs.readFileSync(`.gitignore.public`, `utf8`);
  const ignoreContent = fs.readFileSync(ignoreFilePath, `utf8`);

  logger(`info`, `.gitignore 파일 수정 적용: ${ignoreFilePath}`);
  fs.writeFileSync(`.gitignore`, ignoreContent, `utf8`);

  // git cache 초기화
  execSync(`git rm -r -f --cached .`, { stdio: `inherit` });
  execSync(`git add .`, { stdio: `inherit` });

  const statusOutput = execOutput(`git status --porcelain`);
  if (statusOutput) {
    logger(`info`, `변경사항 감지 - 커밋 진행`);
    const tempFile = `.git-commit-msg.tmp`;
    const commitContent = msg || getTimestamp();
    fs.writeFileSync(tempFile, commitContent, `utf8`);
    execSync(`git commit -F "${tempFile}"`, { stdio: `inherit` });
    fs.unlinkSync(tempFile);
    logger(`success`, `커밋 완료`);
  }
  else {
    logger(`info`, `변경사항 없음 - 커밋 건너뜀`);
  }

  logger(`info`, `Push 진행: ${fullRef}`);
  execSync(`git push --force ${remoteName} HEAD:${targetBranch}`, { stdio: `inherit` });
  logger(`success`, `Push 완료: ${fullRef}`);

  fs.writeFileSync(`.gitignore`, ignorePublicFile, `utf8`);
  logger(`info`, `.gitignore 파일 복원`);
};

// 10. Push 프로세스 실행 --------------------------------------------------------------------
const runPushProcess = async () => {
  // --n 인 경우에만 입력을 스킵하고 자동 커밋
  // --y 옵션(입력 모드)이거나 옵션이 없는 경우(기본 모드)에는 프롬프트 띄움
  const skipPrompt = args3.includes(`n`);

  const commitMsg = skipPrompt
    ? ``
    : await runPrompt(`커밋 메시지 입력 (빈값 = 날짜/시간): `);

  logger(`info`, `커밋 메시지: ${commitMsg || `auto (date/time)`}`);

  ensureGitLfs();
  envManager.syncFiles();
  updateVersionAndChangelog(commitMsg);

  // 버전 업데이트 후 현재 상태를 임시 커밋으로 저장
  execSync(`git add .`, { stdio: `pipe` });
  const hasChanges = execOutput(`git status --porcelain`);
  if (hasChanges) {
    const prePushMsg = `${getTimestamp()} pre-push`;
    execSync(`git commit -m "${prePushMsg}"`, { stdio: `pipe` });
  }

  const baseCommit = execOutput(`git rev-parse HEAD`);
  logger(`info`, `베이스 커밋 저장: ${baseCommit.slice(0, 7)}`);

  envManager.modify();
  try {
    gitPush(gitRemotes.public.name, `.gitignore.public`, commitMsg, baseCommit);
    gitPush(gitRemotes.private.name, `.gitignore.private`, commitMsg, baseCommit);
    logger(`success`, `Git Push 완료`);
  }
  finally {
    envManager.restore();
    envManager.cleanupBackup();
  }
};

// 11. 메인 실행 -----------------------------------------------------------------------------
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
    if (args2 === `fetch`) {
      const answer = await runPrompt(`fetch/reset 을 실행합니다. 계속하시겠습니까? (y/n): `);
      if (answer.toLowerCase() !== `y`) {
        logger(`info`, `사용자가 fetch 를 취소했습니다`);
        process.exit(0);
      }
      ensureGitLfs();
      manageBranches(`setDefault`);
      manageBranches(`cleanup`);
      gitFetch();
    }

    if (args2 === `push`) {
      await runPushProcess();
      manageBranches(`setDefault`);
      manageBranches(`cleanup`);
    }

    logger(`info`, `스크립트 정상 종료: ${TITLE}`);
    process.exit(0);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
    process.exit(1);
  }
})();
