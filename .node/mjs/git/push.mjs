/**
 * @file push.mjs
 * @description Git push 액션
 * @author Jungho
 * @since 2025-12-03
 */

// @ts-check
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";
import { logger, runPrompt } from "../../lib/utils.mjs";
import {
  gitRemotes,
  getTimestamp,
  execOutput,
  remoteUtils,
  ensureGitLfs,
  envManager,
  updateVersionAndChangelog,
  manageBranches,
} from "./action.mjs";

// Changed
const resolveIgnoreTemplatePath = (ignoreFilePath = ``) => {
  const normalizedIgnoreFilePath = String(ignoreFilePath || ``).trim();
  const ignoreFileName = path.basename(normalizedIgnoreFilePath);
  const candidatePathList = [
    path.resolve(process.cwd(), normalizedIgnoreFilePath),
    path.resolve(process.cwd(), `src`, `public`, `git`, ignoreFileName),
    path.resolve(process.cwd(), `src`, `public`, `config`, ignoreFileName),
  ];
  const resolvedIgnoreTemplatePath = candidatePathList.find((candidatePath) => fs.existsSync(candidatePath)) || ``;

  if (resolvedIgnoreTemplatePath === ``) {
    throw new Error(`gitignore 템플릿을 찾을 수 없습니다: ${normalizedIgnoreFilePath}`);
  }

  const result = resolvedIgnoreTemplatePath;

  return result;
};

// Changed
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

  if (baseCommit) {
    logger(`info`, `베이스 커밋으로 리셋: ${baseCommit}`);
    execSync(`git reset --hard ${baseCommit}`, { "stdio": `pipe` });
  }

  const projectIgnorePath = path.resolve(process.cwd(), `.gitignore`);
  const hasProjectIgnoreFile = fs.existsSync(projectIgnorePath);
  const originalIgnoreFile = hasProjectIgnoreFile
    ? fs.readFileSync(projectIgnorePath, `utf8`)
    : ``;
  const ignoreTemplatePath = resolveIgnoreTemplatePath(ignoreFilePath);
  const ignoreContent = fs.readFileSync(ignoreTemplatePath, `utf8`);

  logger(`info`, `.gitignore 파일 수정 적용: ${ignoreTemplatePath}`);
  fs.writeFileSync(projectIgnorePath, ignoreContent, `utf8`);

  try {
    execSync(`git rm -r -f --cached .`, { "stdio": `inherit` });
    execSync(`git add .`, { "stdio": `inherit` });

    const statusOutput = execOutput(`git status --porcelain`);
    if (statusOutput) {
      logger(`info`, `변경사항 감지 - 커밋 진행`);
      const tempFile = `.git-commit-msg.tmp`;
      const commitContent = msg || getTimestamp();

      fs.writeFileSync(tempFile, commitContent, `utf8`);
      execSync(`git commit -F "${tempFile}"`, { "stdio": `inherit` });
      fs.unlinkSync(tempFile);
      logger(`success`, `커밋 완료`);
    }
    else {
      logger(`info`, `변경사항 없음 - 커밋 건너뜀`);
    }

    logger(`info`, `Push 진행: ${fullRef}`);
    execSync(`git push --force ${remoteName} HEAD:${targetBranch}`, { "stdio": `inherit` });
    logger(`success`, `Push 완료: ${fullRef}`);
  }
  finally {
    if (hasProjectIgnoreFile) {
      fs.writeFileSync(projectIgnorePath, originalIgnoreFile, `utf8`);
      logger(`info`, `.gitignore 파일 복원`);
    }
    else {
      fs.unlinkSync(projectIgnorePath);
      logger(`info`, `.gitignore 파일 제거`);
    }
  }
};

/**
 * @param {{ "skipPrompt"?: boolean }} options
 */
// Changed
const runPushAction = async (options = {}) => {
  const shouldSkipPrompt = options.skipPrompt === true;
  const commitMsg = shouldSkipPrompt
    ? ``
    : await runPrompt(`커밋 메시지 입력 (빈값 = 날짜/시간): `);

  logger(`info`, `커밋 메시지: ${commitMsg || `auto (date/time)`}`);

  ensureGitLfs();
  envManager.syncFiles();
  updateVersionAndChangelog(commitMsg);

  execSync(`git add .`, { "stdio": `pipe` });
  const hasChanges = execOutput(`git status --porcelain`);
  if (hasChanges) {
    const prePushMsg = `${getTimestamp()} pre-push`;
    execSync(`git commit -m "${prePushMsg}"`, { "stdio": `pipe` });
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

  manageBranches(`setDefault`);
  manageBranches(`cleanup`);
};

export {
  gitPush,
  runPushAction,
};
