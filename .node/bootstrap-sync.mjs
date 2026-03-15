/**
 * @file bootstrap-sync.mjs
 * @description .node 최소 부트스트랩: 원격 JNODE sync 엔진 로드 후 실행
 * @author Jungho
 * @since 2026-03-15
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {execFileSync, execSync, spawn} from "node:child_process";
import {env} from "./bootstrap-env.mjs";

// 1. 유틸 함수 ------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
const getErrorMessage = (error=null) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const result = errorMessage;

  return result;
};

// -------------------------------------------------------------------------------------------------
const getRunArgs = (config=env) => {
  const runArgs = Array.isArray(config?.runtime?.runArgs) ? config.runtime.runArgs.map((arg) => String(arg || ``)) : [];
  const result = runArgs.length > 0 ? runArgs : [String(config?.runtime?.defaultActionArg || `--sync`)];

  return result;
};

// -------------------------------------------------------------------------------------------------
const readJsonFileSafely = (filePath=``) => {
  const hasFilePath = String(filePath || ``).trim() !== ``;
  const existsFile = hasFilePath && fs.existsSync(filePath);

  if (!existsFile) {
    return {};
  }
  try {
    const rawText = fs.readFileSync(filePath, `utf8`);
    const parsed = JSON.parse(rawText);
    const result = parsed && typeof parsed === `object` ? parsed : {};

    return result;
  }
  catch {
    return {};
  }
};

// -------------------------------------------------------------------------------------------------
const readWindowsMachineEnv = (envKey=``) => {
  const isWindowsPlatform = process.platform === `win32`;
  const hasEnvKey = typeof envKey === `string` && envKey.trim() !== ``;
  let machineEnvValue = ``;

  if (isWindowsPlatform && hasEnvKey) {
    const escapedEnvKey = envKey.replaceAll(`'`, `''`);
    const command = `[System.Environment]::GetEnvironmentVariable('${escapedEnvKey}', 'Machine')`;

    try {
      const machineEnvRaw = execFileSync(`pwsh`, [
        `-NoProfile`,
        `-NonInteractive`,
        `-Command`,
        command,
      ], {
        encoding: `utf8`,
        stdio: [`ignore`, `pipe`, `ignore`],
      });
      machineEnvValue = String(machineEnvRaw || ``).trim();
    }
    catch {
      machineEnvValue = ``;
    }
  }

  return machineEnvValue;
};

// -------------------------------------------------------------------------------------------------
const readGitCredentialToken = () => {
  const credentialInput = [
    `protocol=https`,
    `host=github.com`,
    ``,
    ``,
  ].join(`\n`);
  let token = ``;

  try {
    const rawCredential = execSync(`git credential fill`, {
      encoding: `utf8`,
      input: credentialInput,
      stdio: [`pipe`, `pipe`, `ignore`],
    });
    const credentialLines = String(rawCredential || ``).split(/\r?\n/u);
    const passwordLine = credentialLines.find((line) => line.startsWith(`password=`)) || ``;
    token = passwordLine.replace(/^password=/u, ``).trim();
  }
  catch {
    token = ``;
  }

  return token;
};

// -------------------------------------------------------------------------------------------------
const resolveAuthToken = (config=env) => {
  const configuredToken = String(config?.auth?.token || ``).trim();
  const tokenEnvKey = String(config?.auth?.tokenEnvKey || `GITHUB_TOKEN`).trim();

  if (configuredToken !== ``) {
    return configuredToken;
  }

  const credentialToken = readGitCredentialToken();
  if (credentialToken !== ``) {
    return credentialToken;
  }

  const machineToken = readWindowsMachineEnv(tokenEnvKey);
  const processToken = String(process.env[tokenEnvKey] || ``).trim();
  const resolvedToken = machineToken || processToken;

  return resolvedToken;
};

// 2. 메타 데이터 -----------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
const normalizeMeta = (meta={}, config=env) => {
  const template = config?.meta?.template || {};
  const normalizedMeta = {
    version: Number.isInteger(meta.version) ? meta.version : Number(template.version) || 1,
    status: String(meta.status || template.status || `idle`),
    updatedAt: String(meta.updatedAt || template.updatedAt || ``),
    startedAt: String(meta.startedAt || template.startedAt || ``),
    endedAt: String(meta.endedAt || template.endedAt || ``),
    selectedCandidate: String(meta.selectedCandidate || template.selectedCandidate || ``),
    exitCode: Number.isInteger(meta.exitCode) ? meta.exitCode : Number(template.exitCode) || 0,
    lastRunArgs: Array.isArray(meta.lastRunArgs) ? meta.lastRunArgs.map((arg) => String(arg || ``)) : [],
    errorSummary: String(meta.errorSummary || template.errorSummary || ``),
  };
  const result = normalizedMeta;

  return result;
};

// -------------------------------------------------------------------------------------------------
const readMeta = (config=env) => {
  const metaPath = String(config?.runtime?.metaPath || ``);
  const rawMeta = readJsonFileSafely(metaPath);
  const normalized = normalizeMeta(rawMeta, config);
  const result = normalized;

  return result;
};

// -------------------------------------------------------------------------------------------------
const writeMeta = (patch={}, config=env) => {
  const metaPath = String(config?.runtime?.metaPath || ``).trim();

  if (metaPath === ``) {
  	return;
  }
  const previousMeta = readMeta(config);
  const mergedMeta = {
    ...previousMeta,
    ...patch,
    updatedAt: new Date().toISOString(),
    lastRunArgs: getRunArgs(config),
  };
  const nextMeta = normalizeMeta(mergedMeta, config);
  const metaJson = `${JSON.stringify(nextMeta, null, 2)}\n`;

  fs.writeFileSync(metaPath, metaJson, `utf8`);
};

// 3. 원격 조회 ------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
const buildHeaders = (config=env) => {
  const headers = {
    "User-Agent": String(config?.remote?.userAgent || `JNODE-Sync-Bootstrap`),
    Accept: String(config?.remote?.apiAccept || `application/vnd.github+json`),
    "X-GitHub-Api-Version": String(config?.remote?.apiVersion || `2022-11-28`),
  };
  const token = resolveAuthToken(config);
  const tokenType = String(config?.auth?.tokenType || `Bearer`).trim();

  if (token !== ``) {
    headers.Authorization = `${tokenType} ${token}`;
  }
  const result = headers;

  return result;
};

// -------------------------------------------------------------------------------------------------
const buildEncodedPath = (candidatePath=``) => {
  const encodedPath = String(candidatePath || ``)
    .split(`/`)
    .filter((segment) => segment !== ``)
    .map((segment) => encodeURIComponent(segment))
    .join(`/`);
  const result = encodedPath;

  return result;
};

// -------------------------------------------------------------------------------------------------
const buildRemoteUrl = (candidatePath=``, config=env) => {
  const apiBase = String(config?.remote?.apiBase || `https://api.github.com`);
  const owner = encodeURIComponent(String(config?.remote?.owner || ``));
  const repo = encodeURIComponent(String(config?.remote?.repo || ``));
  const branch = encodeURIComponent(String(config?.remote?.branch || ``));
  const encodedPath = buildEncodedPath(candidatePath);
  const remoteUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`;
  const result = remoteUrl;

  return result;
};

// -------------------------------------------------------------------------------------------------
const decodeGithubContent = (payload={}) => {
  const encodedContent = typeof payload?.content === `string` ? payload.content : ``;

  if (encodedContent === ``) {
  	return ``;
  }
  const normalizedBase64 = encodedContent.replaceAll(`\n`, ``);
  const decodedContent = Buffer.from(normalizedBase64, `base64`).toString(`utf8`);
  const result = decodedContent;

  return result;
};

const fetchRemoteFileSource = async (remotePath=``, config=env) => {
  const url = buildRemoteUrl(remotePath, config);
  const response = await fetch(url, {headers: buildHeaders(config)});

  if (!response.ok) {
    return {ok: false, status: response.status, sourceCode: ``};
  }
  const payload = await response.json();
  const sourceCode = decodeGithubContent(payload);

  return {ok: sourceCode !== ``, status: response.status, sourceCode: sourceCode};
};

const fetchRemoteSharedSource = async (config=env) => {
  const remoteCandidates = Array.isArray(config?.remote?.candidates) ? config.remote.candidates : [];
  const companionFiles = Array.isArray(config?.remote?.companionFiles) ? config.remote.companionFiles : [];

  for (const candidate of remoteCandidates) {
    const result = await fetchRemoteFileSource(candidate, config);

    if (result.status === 404) {
    	continue;
    }
    if (!result.ok) {
      const fetchFailedPrefix = String(config?.messages?.remoteFetchFailedPrefix || `원격 조회 실패(HTTP `);
      throw new Error(`${fetchFailedPrefix}${result.status})`);
    }
    const candidateDir = candidate.substring(0, candidate.lastIndexOf(`/`));
    const companionSources = {};

    for (const companionFileName of companionFiles) {
      const companionPath = `${candidateDir}/${companionFileName}`;
      const companionResult = await fetchRemoteFileSource(companionPath, config);

      if (!companionResult.ok) {
        const fetchFailedPrefix = String(config?.messages?.remoteFetchFailedPrefix || `원격 조회 실패(HTTP `);
        throw new Error(`${fetchFailedPrefix}${companionResult.status}): ${companionFileName}`);
      }
      companionSources[companionFileName] = companionResult.sourceCode;
    }
    return {
      selectedCandidate: String(candidate || ``),
      sourceCode: result.sourceCode,
      companionSources: companionSources,
    };
  }
  const notFoundMessage = String(config?.messages?.remoteNotFound || `원격 shared.mjs를 찾지 못했습니다.`);
  throw new Error(notFoundMessage);
};

// 4. 실행 -----------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
const buildErrorSummary = (error=null, config=env) => {
  const rawMessage = getErrorMessage(error);
  const tokenMaskPattern = String(config?.auth?.tokenMaskPattern || `Bearer\\s+[A-Za-z0-9._-]+`);
  const tokenMaskFlags = String(config?.auth?.tokenMaskFlags || `gu`);
  const tokenMaskReplacement = String(config?.auth?.tokenMaskReplacement || `Bearer ***`);
  const tokenMaskRegex = new RegExp(tokenMaskPattern, tokenMaskFlags);
  const maskedMessage = rawMessage.replace(tokenMaskRegex, tokenMaskReplacement);
  const maxLength = Number(config?.runtime?.errorSummaryMaxLength) || 200;
  const errorSummary = maskedMessage.slice(0, maxLength);
  const result = errorSummary;

  return result;
};

const executeRemoteEntry = (sourceCode=``, companionSources={}, config=env) =>
  new Promise((resolve, reject) => {
    const tempDirPrefix = String(config?.runtime?.tempDirPrefix || `jnode-sync-`);
    const tempDirPath = fs.mkdtempSync(path.join(os.tmpdir(), tempDirPrefix));
    const remoteEntryFileName = String(config?.runtime?.remoteEntryFileName || `shared.mjs`);
    const tempEntryPath = path.join(tempDirPath, remoteEntryFileName);

    fs.writeFileSync(tempEntryPath, sourceCode, `utf8`);

    for (const [fileName, fileContent] of Object.entries(companionSources)) {
      const companionPath = path.join(tempDirPath, fileName);
      fs.writeFileSync(companionPath, fileContent, `utf8`);
    }
    const runArgs = getRunArgs(config);
    const child = spawn(process.execPath, [tempEntryPath, ...runArgs], {
      cwd: String(config?.runtime?.projectRootPath || process.cwd()),
      stdio: `inherit`,
    });

    child.once(`error`, (error) => {
      reject(error);
    });

    child.once(`close`, (code) => {
      const successCode = Number(config?.meta?.exitCode?.success) || 0;
      const failedCode = Number(config?.meta?.exitCode?.failed) || 1;
      const exitCode = typeof code === `number` ? code : failedCode;

      if (exitCode === successCode) {
      	resolve();
        return;
      }
      const runFailedPrefix = String(config?.messages?.remoteRunFailedPrefix || `원격 sync 실행 실패 (exit code: `);
      reject(new Error(`${runFailedPrefix}${exitCode})`));
    });
  });

const runRemoteSync = async (config=env) => {
  const runningStatus = String(config?.meta?.status?.running || `running`);
  const successStatus = String(config?.meta?.status?.success || `success`);
  const successCode = Number(config?.meta?.exitCode?.success) || 0;

  writeMeta(
    {
      status: runningStatus,
      startedAt: new Date().toISOString(),
      endedAt: ``,
      selectedCandidate: ``,
      exitCode: successCode,
      errorSummary: ``,
    },
    config,
  );

  const {selectedCandidate, sourceCode, companionSources} = await fetchRemoteSharedSource(config);

  await executeRemoteEntry(sourceCode, companionSources, config);

  writeMeta(
    {
      status: successStatus,
      endedAt: new Date().toISOString(),
      selectedCandidate: selectedCandidate,
      exitCode: successCode,
      errorSummary: ``,
    },
    config,
  );
};

// 99. run -----------------------------------------------------------------------------------
const run = async () => {
  let exitCode = Number(env?.meta?.exitCode?.success) || 0;

  try {
    await runRemoteSync(env);
  }
  catch (error) {
    const failedStatus = String(env?.meta?.status?.failed || `failed`);
    const failedCode = Number(env?.meta?.exitCode?.failed) || 1;
    const logPrefix = String(env?.messages?.logPrefix || `[jnode-sync]`);

    writeMeta(
      {
        status: failedStatus,
        endedAt: new Date().toISOString(),
        exitCode: failedCode,
        errorSummary: buildErrorSummary(error, env),
      },
      env,
    );
    console.error(`${logPrefix} ${getErrorMessage(error)}`);
    exitCode = failedCode;
  }
  process.exit(exitCode);
};

void run();
