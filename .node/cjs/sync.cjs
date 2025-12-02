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

// 인자 파싱 ---------------------------------------------------------------------------------
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
			res.on(`data`, chunk => data += chunk);
			res.on(`end`, () => resolve(data));
		})();
	});
	req.on(`error`, reject);
	req.setTimeout(10000, () => {
		req.destroy();
		reject(new Error(`Timeout: ${url}`));
	});
});

// 모든 파일 동기화 --------------------------------------------------------------------------
const syncAll = async () => {
	logger(`info`, `GitHub CDN 동기화 시작`);

	const {cdn, git} = settings;
	const isPrivate = cdn.defaultRemote === `private`;
	const owner = cdn.owner;
	const repo = isPrivate ? cdn.repoPrivate : cdn.repo;
	const branch = isPrivate ? git.remotes.private.branch : git.remotes.public.branch;
	const cdnType = cdn.defaultCdn;
	const token = isPrivate ? process.env.GITHUB_TOKEN ?? `` : ``;

	// args3에 따라 루트 경로 설정
	const baseCwd = process.cwd();
	const cwd = args3 === `client` ? path.join(baseCwd, `client`) : baseCwd;

	logger(`info`, `원격: ${cdn.defaultRemote}`);
	logger(`info`, `저장소: ${owner}/${repo}`);
	logger(`info`, `브랜치: ${branch}`);
	logger(`info`, `대상 타입: ${args3 || `default`}`);
	logger(`info`, `루트 경로: ${cwd}`);

	// 폴더별 동기화
	for (const folder of cdn.folders) {
		const {sourcePath, targetPath: relTargetPath, files} = folder;
		const targetDir = relTargetPath ? path.join(cwd, relTargetPath) : cwd;
		const isRoot = !relTargetPath;
		const displayPath = relTargetPath || `루트`;

		logger(`info`, `대상 폴더: ${displayPath}`);

		// 폴더가 없으면 생성 (기존 폴더는 유지하여 로컬 파일 보존)
		if (!isRoot && !fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, {recursive: true});
			logger(`info`, `폴더 생성: ${displayPath}`);
		}

		// 파일별 다운로드
		for (const fileName of files) {
			const targetFilePath = path.join(targetDir, fileName);
			const remoteFilePath = `${sourcePath}/${fileName}`;
			const url = getCdnUrls[cdnType](owner, repo, branch, remoteFilePath);

			logger(`info`, `다운로드: ${fileName}`);

			try {
				const content = await httpGet(url, token);

				// 파일이 존재하면 무조건 삭제 후 다시 작성
				if (fs.existsSync(targetFilePath)) {
					fs.unlinkSync(targetFilePath);
				}

				fs.writeFileSync(targetFilePath, content, `utf8`);
				logger(`info`, `생성: ${fileName}`);
			}
			catch (e) {
				logger(`error`, `파일 가져오기 실패: ${fileName} - ${e instanceof Error ? e.message : String(e)}`);
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
		[`npm`, `pnpm`, `yarn`, `bun`].includes(args1) && args2 === `sync` && (
			await syncAll(),
			logger(`info`, `CDN 동기화 완료`)
		);
	}
	catch (e) {
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${e instanceof Error ? e.message : String(e)}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();