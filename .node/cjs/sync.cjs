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

// 인자 파싱 -------------------------------------------------------------------------------
const TITLE = `sync.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) ?? ``;
const args2 = argv.find(arg => [`--sync`].includes(arg))?.replace(`--`, ``) ?? ``;
const args3 = argv.find(arg => [`--server`, `--client`].includes(arg))?.replace(`--`, ``) ?? ``;

// CDN URL 생성 함수 -------------------------------------------------------------------------
const getCdnUrls = {
	rawGithub: (owner, repo, branch, filePath) =>
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
};

// HTTP GET 요청 (Promise) -------------------------------------------------------------------
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

// 프로젝트 루트 탐색 (package.json + .node 기준) --------------------------------------------
const resolveProjectRoot = (startDir = ``) => {
	let dir = startDir;
	let found = ``;
	let isDone = false;

	while (!isDone) {
		const hasPkg = fs.existsSync(path.join(dir, `package.json`));
		const hasNodeDir = fs.existsSync(path.join(dir, `.node`));

		hasPkg && hasNodeDir && (
			found = dir,
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

	const result = found || startDir;
	return result;
};

// 모든 파일 동기화 (settings.cdn.folders 순서 그대로, 완전 동기) ----------------------------
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

	const baseCwd = process.cwd();
	const projectRoot = resolveProjectRoot(baseCwd);

	// --server: 프로젝트 루트, --client: 프로젝트 루트의 client 폴더
	const cwd = args3 === `client`
		? path.join(projectRoot, `client`)
		: projectRoot;

	let canRun = true;

	!buildUrl && (
		logger(`error`, `지원하지 않는 CDN 타입: ${cdnType}`),
		canRun = false
	);

	(!Array.isArray(cdn.folders) || cdn.folders.length === 0) && (
		logger(`warn`, `동기화 대상 폴더가 설정되지 않았습니다 (settings.cdn.folders 비어 있음)`),
		canRun = false
	);

	logger(`info`, `원격: ${cdn.defaultRemote}`);
	logger(`info`, `저장소: ${owner}/${repo}`);
	logger(`info`, `브랜치: ${branch}`);
	logger(`info`, `대상 타입: ${args3 || `server(default)`}`);
	logger(`info`, `프로젝트 루트: ${projectRoot}`);
	logger(`info`, `동기화 루트 경로: ${cwd}`);

	if (canRun) {
		const folders = cdn.folders;
		let folderIndex = 0;

		// folders 배열 순서 그대로 처리
		while (folderIndex < folders.length) {
			const folder = folders[folderIndex];

			if (!folder || !Array.isArray(folder.files)) {
				logger(`warn`, `잘못된 폴더 설정 감지, 건너뜀: ${JSON.stringify(folder)}`);
				folderIndex += 1;
			}
			else {
				const {sourcePath, targetPath: relTargetPath, files} = folder;
				const targetDir = relTargetPath ? path.join(cwd, relTargetPath) : cwd;
				const isRoot = !relTargetPath;
				const displayPath = relTargetPath || `루트`;

				logger(`info`, `대상 폴더: ${displayPath} (index: ${folderIndex})`);

				!isRoot && !fs.existsSync(targetDir) && (
					fs.mkdirSync(targetDir, {recursive: true}),
					logger(`info`, `폴더 생성: ${displayPath} (${targetDir})`)
				);

				let fileIndex = 0;

				// 폴더 내 files 배열 순서대로 동기
				while (fileIndex < files.length) {
					const fileName = files[fileIndex];

					if (!fileName) {
						logger(`warn`, `파일명이 비어 있어 건너뜀 (폴더: ${displayPath})`);
						fileIndex += 1;
					}
					else {
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

						fileIndex += 1;
					}
				}

				folderIndex += 1;
			}
		}
	}

	logger(`info`, `동기화 완료`);
};

// 실행 --------------------------------------------------------------------------------------
(async () => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	logger(`info`, `전달된 인자 3: ${args3 || `none`}`);

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
