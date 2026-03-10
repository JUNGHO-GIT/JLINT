/**
 * @file fetch.mjs
 * @description Git fetch/reset 액션
 * @author Jungho
 * @since 2025-12-03
 */

// @ts-check
import { execSync } from "node:child_process";
import { logger, runPrompt } from "../../lib/utils.mjs";
import {
  gitRemotes,
  remoteUtils,
  safeFetch,
  ensureGitLfs,
  manageBranches,
  overwritePackageDefaultScripts,
} from "./action.mjs";

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

  logger(`info`, `Git Fetch 시작: ${targetRemote}`);
  const fetchOk = safeFetch(targetRemote, `--prune`, `inherit`);
  if (!fetchOk) {
    throw new Error(`Git Fetch 실패: ${targetRemote} (ref 복구 후에도 실패)`);
  }

  logger(`success`, `Git Fetch 완료: ${targetRemote}`);

  try {
    logger(`info`, `Git Reset Hard 시작: ${targetRemote}/${targetBranch}`);
    execSync(`git fetch ${targetRemote} ${targetBranch}`, { "stdio": `pipe` });
    execSync(`git reset --hard FETCH_HEAD`, { "stdio": `inherit` });
    logger(`success`, `Git Reset Hard 완료: ${targetRemote}/${targetBranch}`);
    overwritePackageDefaultScripts();
  }
  catch (error) {
    logger(`error`, `Git Reset 실패: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

const runFetchAction = async () => {
  const answer = await runPrompt(`fetch/reset 을 실행합니다. 계속하시겠습니까? (y/n): `);
  if (answer.toLowerCase() !== `y`) {
    logger(`info`, `사용자가 fetch 를 취소했습니다`);
    return;
  }

  ensureGitLfs();
  manageBranches(`setDefault`);
  manageBranches(`cleanup`);
  gitFetch();
};

export {
  gitFetch,
  runFetchAction,
};
