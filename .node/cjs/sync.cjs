/**
 * @file sync.cjs
 * @since 2025-12-02
 * @description GitHub CDN에서 실시간으로 .node 폴더의 코드를 동기화
 */

const fs = require(`fs`);
const path = require(`path`);
const https = require(`https`);
const {settings} = require(`../lib/settings.cjs`);
const {logger} = require(`../lib/utils.cjs`);

// 인자 파싱 ---------------------------------------------------------------------------
const TITLE = `sync.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) ?? ``;
const args2 = argv.find(arg => [`--sync`].includes(arg))?.replace(`--`, ``) ?? ``;
const args3 = argv.find(arg => [`--server`, `--client`].includes(arg))?.replace(`--`, ``) ?? ``;
const mode = args3 === `client` ? `client` : `server`;

const SCRIPT_DIR = __dirname;

// CDN URL 생성 함수 -------------------------------------------------------------------
const getCdnUrls = {
	rawGithub: (owner, repo, branch, filePath) =>
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
};

// HTTP GET 요청 (Promise) -------------------------------------------------------------
const httpGet = (url = ``, token = ``) => new Promise((resolve, reject) => {
	const headers = {"User-Agent": `JNODE-Sync`};
	token && (headers[`Authorization`] = `token ${token}`);

	const req = https.get(url, {headers}, (res) => {
		res.statusCode >= 300 && res.statusCode < 400 && res.headers.location ? (
			httpGet(res.headers.location, token).then(resolve).catch(reject)
		) : res.statusCode !== 200 ? (
			reject(new Error(`HTTP ${res.statusCode}: ${url}`))
		) : (() => {
			let data = ``;
			res.on(`data`, chunk => {
				data += chunk;
			});
			res.on(`end`, () => {
				resolve(data);
			});
		})();
	});
	req.on(`error`, reject);
	req.setTimeout(10000, () => {
		req.destroy();
		reject(new Error(`Timeout: ${url}`));
	});
});

// 프로젝트 루트 후보 탐색 (.node/lib/settings.cjs 기준) --------------------------------
const findProjectRootCandidate = (startDir = ``) => {
	let dir = startDir || process.cwd();
	let projectRoot = ``;
	let isDone = false;

	while (!isDone) {
		const nodeDir = path.join(dir, `.node`);
		const settingsPath = path.join(nodeDir, `lib`, `settings.cjs`);
		const hasNodeDir = fs.existsSync(nodeDir);
		const hasSettings = fs.existsSync(settingsPath);

		hasNodeDir && hasSettings && (
			projectRoot = dir,
			isDone = true
		);

		!isDone && (() => {
			const parent = path.dirname(dir);
			parent === dir ? (
				isDone = true
			) : (
				dir = parent
			);
		})();
	}

	!projectRoot && (projectRoot = startDir || process.cwd());
	return projectRoot;
};

// 최종 프로젝트 루트 결정 --------------------------------------------------------------
const resolveProjectRoot = () => {
	const scriptBase = path.resolve(SCRIPT_DIR, `..`, `..`);
	let projectRoot = findProjectRootCandidate(process.cwd());

	(!projectRoot || projectRoot === process.cwd()) && (
		projectRoot = findProjectRootCandidate(scriptBase)
	);

	return projectRoot;
};

// server / client 동기화 루트 결정 -----------------------------------------------------
const resolveSyncRoot = (rootMode = `server`, projectRoot = ``) => {
	const baseRoot = projectRoot || resolveProjectRoot();
	let syncRoot = baseRoot;

	rootMode === `client` && fs.existsSync(path.join(baseRoot, `client`)) && (
		syncRoot = path.join(baseRoot, `client`)
	);

	return syncRoot;
};

// 폴더/파일 스킵 규칙 -----------------------------------------------------------------
const shouldSkipFolder = (rootMode = `server`, relTargetPath = ``) => {
	let skip = false;

	if (relTargetPath) {
		const segments = relTargetPath.split(/[\\/]/);
		const isClientFolder = segments.includes(`client`);
		const isServerFolder = segments.includes(`server`);

		skip =
			rootMode === `server` ? (
				isClientFolder
			) : rootMode === `client` ? (
				isServerFolder
			) : (
				false
			);
	}

	return skip;
};

const shouldSkipFile = (rootMode = `server`, fileName = ``) => {
	const isClientFile = fileName.includes(`client`);
	const isServerFile = fileName.includes(`server`);

	const skip =
		rootMode === `server` ? (
			isClientFile && !isServerFile
		) : rootMode === `client` ? (
			isServerFile && !isClientFile
		) : (
			false
		);

	return skip;
};

// 모든 파일 동기화 (settings.cdn.folders 순서 그대로, 동기 실행) ----------------------
const syncAll = async () => {
	logger(`info`, `GitHub CDN 동기화 시작`);

	const {cdn, git} = settings;

	const isPrivate = cdn.defaultRemote === `private`;
	const owner = cdn.owner;
	const repo = isPrivate ? cdn.repoPrivate : cdn.repo;
	const branch = isPrivate ? git.remotes.private.branch : git.remotes.public.branch;
	const cdnType = cdn.defaultCdn;
	const token = isPrivate ? process.env.GITHUB_TOKEN ?? `` : ``;

	const buildUrl = getCdnUrls[cdnType];

	const projectRoot = resolveProjectRoot();
	const syncRoot = resolveSyncRoot(mode, projectRoot);

	let canRun = true;

	!buildUrl && (
		logger(`error`, `지원하지 않는 CDN 타입: ${cdnType}`),
		canRun = false
	);

	(!Array.isArray(cdn.folders) || cdn.folders.length === 0) && (
		logger(`warn`, `동기화 대상 폴더가 설정되지 않았습니다 (settings.cdn.folders 비어 있음)`),
		canRun = false
	);

	!fs.existsSync(syncRoot) && (
		logger(`error`, `동기화 루트 경로가 존재하지 않습니다: ${syncRoot}`),
		canRun = false
	);

	logger(`info`, `원격: ${cdn.defaultRemote}`);
	logger(`info`, `저장소: ${owner}/${repo}`);
	logger(`info`, `브랜치: ${branch}`);
	logger(`info`, `대상 타입: ${mode}`);
	logger(`info`, `SCRIPT_DIR: ${SCRIPT_DIR}`);
	logger(`info`, `프로젝트 루트: ${projectRoot}`);
	logger(`info`, `동기화 루트 경로: ${syncRoot}`);

	if (canRun) {
		const folders = cdn.folders;

		for (let folderIndex = 0; folderIndex < folders.length; folderIndex += 1) {
			const folder = folders[folderIndex];

			if (!folder || !Array.isArray(folder.files)) {
				logger(`warn`, `잘못된 폴더 설정 감지, 건너뜀: ${JSON.stringify(folder)}`);
				continue;
			}

			const {sourcePath, targetPath: relTargetPath, files} = folder;

			if (shouldSkipFolder(mode, relTargetPath || ``)) {
				logger(`info`, `모드(${mode})에서 제외된 폴더: ${relTargetPath || `루트`} (index: ${folderIndex})`);
				continue;
			}

			const targetDir = relTargetPath ? path.join(syncRoot, relTargetPath) : syncRoot;
			const isRoot = !relTargetPath;
			const displayPath = relTargetPath || `루트`;

			logger(`info`, `대상 폴더: ${displayPath} (index: ${folderIndex})`);

			!isRoot && !fs.existsSync(targetDir) && (
				fs.mkdirSync(targetDir, {recursive: true}),
				logger(`info`, `폴더 생성: ${displayPath} (${targetDir})`)
			);

			for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
				const fileName = files[fileIndex];

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
					logger(
						`error`,
						`파일 가져오기 실패: ${fileName} - ${e instanceof Error ? e.message : String(e)}`,
					);
				}
			}
		}
	}

	logger(`info`, `동기화 완료`);
};

// 실행 --------------------------------------------------------------------------------
(async () => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	logger(`info`, `전달된 인자 3: ${args3 || `none`} (mode: ${mode})`);

	try {
		const canSync =
			[`npm`, `pnpm`, `yarn`, `bun`].includes(args1) &&
			args2 === `sync`;

		canSync ? (
			await syncAll(),
			logger(`info`, `CDN 동기화 완료`)
		) : logger(`info`, `동기화 조건 불일치로 실행하지 않음`);
	}
	catch (e) {
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${e instanceof Error ? e.message : String(e)}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();
