/**
 * @file sync.mjs
 * @description GitHub CDN에서 실시간으로 .node 폴더의 코드를 동기화 (ESM)
 * @author Jungho
 * @since 2025-12-02
 */

import fs from 'fs';
import path from 'path';
import process from 'process';
import https from 'https';
import { fileURLToPath } from 'url';
import { settings } from '../lib/settings.mjs';
import { logger, fileExists } from '../lib/utils.mjs';

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [
	`--sync`,
].includes(arg))?.replace(`--`, ``) || ``;
const args3 = argv.find(arg => [
	`--server`,
	`--client`,
].includes(arg))?.replace(`--`, ``) || ``;
const mode = args3 === `client` ? `client` : `server`;

// 2. 스크립트 위치 기준 프로젝트 루트 계산 --------------------------------------------------
const SCRIPT_DIR = __dirname;
const NODE_ROOT = path.resolve(SCRIPT_DIR, `..`);
const PROJECT_ROOT = path.resolve(NODE_ROOT, `..`);

// 3. CDN URL 생성 함수 ----------------------------------------------------------------------
const getCdnUrls = {
	"rawGithub": (owner, repo, branch, filePath) => (
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
	),
};

// 4. HTTP GET 요청 (Promise) ----------------------------------------------------------------
const httpGet = (url = ``, token = ``) => new Promise((resolve, reject) => {
	const headers = { "User-Agent": `JNODE-Sync` };
	token && (headers[`Authorization`] = `token ${token}`);

	const req = https.get(url, { headers }, res => {
		res.statusCode >= 300 && res.statusCode < 400 && res.headers.location ? (
			httpGet(res.headers.location, token).then(resolve).catch(reject)
		) : res.statusCode !== 200 ? (
			reject(new Error(`HTTP ${res.statusCode}: ${url}`))
		) : (() => {
			let data = ``;
			res.on(`data`, chunk => { data += chunk; });
			res.on(`end`, () => { resolve(data); });
		})();
	});

	req.on(`error`, reject);
	req.setTimeout(10000, () => {
		req.destroy();
		reject(new Error(`Timeout: ${url}`));
	});
});

// 5. server / client 동기화 루트 결정 -------------------------------------------------------
const resolveSyncRoot = (rootMode = `server`) => {
	const isClientRoot = path.basename(PROJECT_ROOT) === `client`;
	const hasClientSub = fileExists(path.join(PROJECT_ROOT, `client`));
	const baseRoot = PROJECT_ROOT;

	const syncRoot = rootMode === `client` ? (
		isClientRoot ? (
			baseRoot
		) : hasClientSub ? (
			path.join(baseRoot, `client`)
		) : (
			baseRoot
		)
	) : (
		baseRoot
	);

	return syncRoot;
};

// 6. 폴더 스킵 규칙 -------------------------------------------------------------------------
const shouldSkipFolder = (rootMode = `server`, relTargetPath = ``) => {
	const normalized = relTargetPath ? relTargetPath.replace(/\\/g, `/`) : ``;
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

// 7. 파일 스킵 규칙 -------------------------------------------------------------------------
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

// 8. 모든 파일 동기화 -----------------------------------------------------------------------
const syncAll = async () => {
	logger(`info`, `GitHub CDN 동기화 시작`);
	const { cdn, git } = settings;

	const isPrivate = cdn.defaultRemote === `private`;
	const owner = cdn.owner;
	const repo = isPrivate ? cdn.repoPrivate : cdn.repo;
	const branch = isPrivate ? git.remotes.private.branch : git.remotes.public.branch;
	const cdnType = cdn.defaultCdn;
	const token = isPrivate ? process.env.GITHUB_TOKEN || `` : ``;

	const buildUrl = getCdnUrls[cdnType];
	const syncRoot = resolveSyncRoot(mode);
	let canRun = true;

	!buildUrl && (
		logger(`error`, `지원하지 않는 CDN 타입: ${cdnType}`),
		canRun = false
	);
	(!Array.isArray(cdn.folders) || cdn.folders.length === 0) && (
		logger(`warn`, `동기화 대상 폴더가 설정되지 않았습니다 (settings.cdn.folders 비어 있음)`),
		canRun = false
	);
	!fileExists(syncRoot) && (
		logger(`error`, `동기화 루트 경로가 존재하지 않습니다: ${syncRoot}`),
		canRun = false
	);

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

	const folders = cdn.folders;
	for (let folderIndex = 0; folderIndex < folders.length; folderIndex += 1) {
		const folder = folders[folderIndex];
		if (!folder || !Array.isArray(folder.files)) {
			logger(`warn`, `잘못된 폴더 설정 감지, 건너뜀: ${JSON.stringify(folder)}`);
			continue;
		}

		const { sourcePath, targetPath: relTargetPath, files } = folder;
		const normalizedTarget = relTargetPath ? relTargetPath.replace(/\\/g, `/`) : ``;
		if (shouldSkipFolder(mode, relTargetPath || ``)) {
			logger(`info`, `모드(${mode})에서 제외된 폴더: ${relTargetPath || `루트`} (index: ${folderIndex})`);
			continue;
		}

		const targetDir = !relTargetPath ? (
			syncRoot
		) : normalizedTarget === `client` ? (
			syncRoot
		) : (
			path.join(syncRoot, relTargetPath)
		);

		const isRoot = !relTargetPath || targetDir === syncRoot;
		const displayPath = relTargetPath || `루트`;

		logger(`info`, `대상 폴더: ${displayPath} (index: ${folderIndex})`);
		!isRoot && !fileExists(targetDir) && (
			fs.mkdirSync(targetDir, { "recursive": true }),
			logger(`info`, `폴더 생성: ${displayPath} (${targetDir})`)
		);
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
			catch (e) {
				const errMsg = e instanceof Error ? e.message : String(e);
				logger(`error`, `파일 가져오기 실패: ${fileName} - ${errMsg}`);

				// 원격에 존재하지 않음(404)인 경우 로컬 파일 처리
				if (errMsg.includes(`HTTP 404`)) {
					// 1. 로컬에 파일이 존재하는지 명확히 확인
					if (fileExists(targetFilePath)) {
						try {
							// 2. 파일 삭제 시도
							fs.unlinkSync(targetFilePath);
							logger(`warn`, `[삭제 성공] 원격 미존재로 로컬 파일 삭제: ${targetFilePath}`);
						}
						catch (delErr) {
							// 3. 권한 문제(EBUSY, EPERM) 등으로 삭제 실패 시 에러 출력
							logger(`error`, `[삭제 실패] 파일 삭제 중 오류 발생: ${delErr.message}`);
						}
					}
					else {
						// 4. 로컬에도 파일이 없어서 삭제하지 않은 경우 (경로 문제 확인용)
						logger(`info`, `[삭제 건너뜀] 로컬에 파일이 존재하지 않음: ${targetFilePath}`);
					}
				}
			}
		}
	}

	logger(`info`, `동기화 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
void (async () => {
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
		args1 && await syncAll();
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
