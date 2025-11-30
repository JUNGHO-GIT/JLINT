/**
 * @file git.cjs
 * @since 2025-11-22
 */

const os = require(`os`);
const fs = require(`fs`);
const { execSync } = require(`child_process`);
const { logger } = require(`./utils.cjs`);
const { CONFIG } = require(`./env.cjs`);

// 인자 파싱 ---------------------------------------------------------------------------------
const TITLE = `git.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) ?? ``;
const args2 = argv.find(arg => [`--push`, `--fetch`].includes(arg))?.replace(`--`, ``) ?? ``;
const osType = os.platform() === `win32` ? `win` : `linux`;

// 원격 기본 브랜치 감지 ----------------------------------------------------------------------
const getRemoteDefaultBranch = (remoteName=``) => {
	const branch = remoteName === CONFIG.git.remotes.public.name
		? CONFIG.git.remotes.public.branch
		: remoteName === CONFIG.git.remotes.private.name
		? CONFIG.git.remotes.private.branch
		: ``;

	branch
		? logger(`info`, `원격 저장소 ${remoteName} 기본 브랜치(고정): ${branch}`)
		: logger(`error`, `지원하지 않는 remote입니다: ${remoteName}`);

	return branch;
};

// git remote 존재 확인 ----------------------------------------------------------------------
const checkRemoteExists = (remoteName=``) => {
	try {
		execSync(`git remote get-url ${remoteName}`, { encoding: `utf8`, stdio: `pipe` });
		return true;
	}
	catch {
		return false;
	}
};

// git cache 초기화 --------------------------------------------------------------------------
const clearGitCache = () => {
	logger(`info`, `Git 캐시 초기화 시작`);
	try {
		execSync(`git rm -r -f --cached .`, { stdio: `inherit` });
		logger(`success`, `Git 캐시 초기화 완료`);
	}
	catch (e) {
		logger(`error`, `Git 캐시 초기화 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}
};

// 파일 라인 변환 헬퍼 ------------------------------------------------------------------------
const transformLines = (content=``, rules=[]) => {
	const lines = content.split(/\r?\n/);
	const transformed = lines.map(line => {
		const matched = rules.find(r => r.match(line));
		return matched ? matched.replace(line) : line;
	});
	return transformed.join(os.EOL);
};

// env 파일 및 index 파일 수정 ----------------------------------------------------------------
const modifyEnvAndIndex = () => {
	const envExists = fs.existsSync(`.env`);
	const indexExists = fs.existsSync(`index.ts`);

	!envExists && !indexExists && (
		logger(`info`, `.env 및 index.ts 파일 없음 - 건너뜀`),
		true
	);

	envExists && (() => {
		logger(`info`, `.env 파일 수정 시작`);
		const envContent = fs.readFileSync(`.env`, `utf8`);
		const envRules = [
			{
				match: (line) => line.startsWith(`CLIENT_URL=`),
				replace: () => `CLIENT_URL=https://www.${CONFIG.domain}/${CONFIG.projectName}`
			},
			{
				match: (line) => line.startsWith(`GOOGLE_CALLBACK_URL=`),
				replace: () => `GOOGLE_CALLBACK_URL=https://www.${CONFIG.domain}/${CONFIG.projectName}/${CONFIG.gcp.callback}`
			}
		];
		fs.writeFileSync(`.env`, transformLines(envContent, envRules));
		logger(`info`, `.env 파일 수정 완료`);
	})();

	indexExists && (() => {
		logger(`info`, `index.ts 파일 수정 시작`);
		const indexContent = fs.readFileSync(`index.ts`, `utf8`);
		const indexRules = [
			{
				match: (line) => line.trim().startsWith(`// const db = process.env.DB_NAME`),
				replace: () => `const db = process.env.DB_NAME;`
			},
			{
				match: (line) => line.trim().startsWith(`const db = process.env.DB_TEST`),
				replace: () => `// const db = process.env.DB_TEST;`
			}
		];
		fs.writeFileSync(`index.ts`, transformLines(indexContent, indexRules));
		logger(`info`, `index.ts 파일 수정 완료`);
	})();
};

// env 파일 및 index 파일 복원 ----------------------------------------------------------------
const restoreEnvAndIndex = () => {
	const envExists = fs.existsSync(`.env`);
	const indexExists = fs.existsSync(`index.ts`);

	!envExists && !indexExists && (
		logger(`info`, `.env 및 index.ts 파일 없음 - 복원 건너뜀`),
		true
	);

	envExists && (() => {
		logger(`info`, `.env 파일 복원 시작`);
		const envContent = fs.readFileSync(`.env`, `utf8`);
		const envRules = [
			{
				match: (line) => line.startsWith(`CLIENT_URL=`),
				replace: () => `CLIENT_URL=http://localhost:${CONFIG.localPort.client}/${CONFIG.projectName}`
			},
			{
				match: (line) => line.startsWith(`GOOGLE_CALLBACK_URL=`),
				replace: () => `GOOGLE_CALLBACK_URL=http://localhost:${CONFIG.localPort.server}/${CONFIG.projectName}/${CONFIG.gcp.callback}`
			}
		];
		fs.writeFileSync(`.env`, transformLines(envContent, envRules));
		logger(`info`, `.env 파일 복원 완료`);
	})();

	indexExists && (() => {
		logger(`info`, `index.ts 파일 복원 시작`);
		const indexContent = fs.readFileSync(`index.ts`, `utf8`);
		const indexRules = [
			{
				match: (line) => line.trim().startsWith(`const db = process.env.DB_NAME`),
				replace: () => `// const db = process.env.DB_NAME;`
			},
			{
				match: (line) => line.trim().startsWith(`// const db = process.env.DB_TEST`),
				replace: () => `const db = process.env.DB_TEST;`
			}
		];
		fs.writeFileSync(`index.ts`, transformLines(indexContent, indexRules));
		logger(`info`, `index.ts 파일 복원 완료`);
	})();
};

// changelog 수정 ----------------------------------------------------------------------------
const modifyChangelog = () => {
	const changelogExists = fs.existsSync(`changelog.md`);

	!changelogExists && logger(`info`, `changelog.md 파일 없음 - 건너뜀`);

	const result = changelogExists ? (() => {
		logger(`info`, `changelog.md 업데이트 시작`);

		const now = new Date();
		const dateStr = now.toLocaleDateString(`ko-KR`, { year: `numeric`, month: `2-digit`, day: `2-digit` });
		const timeStr = now.toLocaleTimeString(`ko-KR`, { hour: `2-digit`, minute: `2-digit`, second: `2-digit`, hour12: false });

		const changelog = fs.readFileSync(`changelog.md`, `utf8`);
		const matches = [...changelog.matchAll(/(\s*)(\d+[.]\d+[.]\d+)(\s*)/g)];
		const lastVersion = matches[matches.length - 1][2];
		const ver = lastVersion.split(`.`).map(Number);

		ver[2]++;
		ver[2] >= 10 && (ver[2] = 0, ver[1]++);
		ver[1] >= 10 && (ver[1] = 0, ver[0]++);

		const newVersion = ver.join(`.`);
		const formattedDateTime = `- ${dateStr} (${timeStr})`
			.replace(/([.]\s*[(])/g, ` (`)
			.replace(/([.]\s*)/g, `-`)
			.replace(/[(](\W*)(\s*)/g, `(`);

		const newEntry = `\n## \\[ ${newVersion} \\]\n\n${formattedDateTime}\n`;
		fs.writeFileSync(`changelog.md`, changelog + newEntry, `utf8`);
		logger(`success`, `changelog.md 업데이트 완료: ${newVersion}`);

		return newVersion;
	})() : ``;

	return result;
};

// package.json 버전 수정 --------------------------------------------------------------------
const incrementVersion = (newVersion=``) => {
	const pkgPath = `package.json`;
	const pkgExists = fs.existsSync(pkgPath);

	!newVersion && logger(`info`, `버전 정보 없음 - package.json 업데이트 건너뜀`);
	!pkgExists && newVersion && logger(`info`, `package.json 파일 없음 - 건너뜀`);

	pkgExists && newVersion && (() => {
		logger(`info`, `package.json 버전 업데이트 시작: ${newVersion}`);
		const pkg = JSON.parse(fs.readFileSync(pkgPath, `utf8`));
		pkg.version = newVersion;
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + `\n`, `utf8`);
		logger(`success`, `package.json 버전 업데이트 완료: ${newVersion}`);
	})();
};

// git fetch ---------------------------------------------------------------------------------
const gitFetch = () => {
	try {
		const privateExists = checkRemoteExists(CONFIG.git.remotes.private.name);
		const publicExists = checkRemoteExists(CONFIG.git.remotes.public.name);

		privateExists
			? logger(`info`, `Private remote 감지 - ${CONFIG.git.remotes.private.name}만 fetch 진행`)
			: logger(`info`, `Private remote 없음 - ${CONFIG.git.remotes.public.name} fetch 진행`);

		const targetRemote = privateExists ? CONFIG.git.remotes.private.name : CONFIG.git.remotes.public.name;
		const targetBranch = getRemoteDefaultBranch(targetRemote);

		!privateExists && !publicExists && (logger(`error`, `사용 가능한 remote가 없습니다`), process.exit(1));
		!targetBranch && (logger(`error`, `원격 기본 브랜치를 찾을 수 없습니다`), process.exit(1));

		logger(`info`, `Git Fetch 시작: ${targetRemote}`);
		execSync(`git fetch ${targetRemote}`, { stdio: `inherit` });
		logger(`success`, `Git Fetch 완료: ${targetRemote}`);

		logger(`info`, `Git Reset Hard 시작: ${targetRemote}/${targetBranch}`);
		execSync(`git reset --hard ${targetRemote}/${targetBranch}`, { stdio: `inherit` });
		logger(`success`, `Git Reset Hard 완료: ${targetRemote}/${targetBranch}`);
	}
	catch (e) {
		logger(`error`, `Git Fetch/Reset 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}
};

// git push 공통 함수 ------------------------------------------------------------------------
const gitPush = (remoteName=``, ignoreFilePath=``) => {
	const remoteExists = checkRemoteExists(remoteName);

	!remoteExists && logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 건너뜀`);
	remoteExists && (() => {
		const targetBranch = getRemoteDefaultBranch(remoteName);
		!targetBranch && (logger(`error`, `원격 기본 브랜치를 찾을 수 없습니다: ${remoteName}`), process.exit(1));

		logger(`info`, `Git Push 시작: ${remoteName}`);

		const ignorePublicFile = fs.readFileSync(`.gitignore.public`, `utf8`);
		const ignoreContent = fs.readFileSync(ignoreFilePath, `utf8`);

		logger(`info`, `.gitignore 파일 수정 적용: ${ignoreFilePath}`);
		fs.writeFileSync(`.gitignore`, ignoreContent, `utf8`);

		clearGitCache();
		execSync(`git add .`, { stdio: `inherit` });

		const statusOutput = execSync(`git status --porcelain`, { encoding: `utf8` }).trim();

		statusOutput && (() => {
			logger(`info`, `변경사항 감지 - 커밋 진행`);
			const commitCmd = osType === `win`
				? `git commit -m "%date% %time:~0,8%"`
				: `git commit -m "$(date +%Y-%m-%d) $(date +%H:%M:%S)"`;
			execSync(commitCmd, { stdio: `inherit` });
			logger(`success`, `커밋 완료`);
		})();
		!statusOutput && logger(`info`, `변경사항 없음 - 커밋 건너뜀`);

		logger(`info`, `Push 진행: ${remoteName} ${targetBranch}`);
		execSync(`git push --force ${remoteName} HEAD:${targetBranch}`, { stdio: `inherit` });
		logger(`success`, `Push 완료: ${remoteName} ${targetBranch}`);

		fs.writeFileSync(`.gitignore`, ignorePublicFile, `utf8`);
		logger(`info`, `.gitignore 파일 복원`);
	})();
};

// 실행 --------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `운영체제: ${osType}`);
	logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
	logger(`info`, `전달된 인자 2: ${args2 || `none`}`);

	try {
		args2 === `fetch` && (gitFetch(), logger(`success`, `Git Fetch & Reset 완료`));

		args2 === `push` && (() => {
			modifyEnvAndIndex();
			incrementVersion(modifyChangelog());
			gitPush(CONFIG.git.remotes.public.name, `.gitignore.public`);
			gitPush(CONFIG.git.remotes.private.name, `.gitignore.private`);
			restoreEnvAndIndex();
			logger(`success`, `Git Push 완료`);
		})();
	}
	catch (e) {
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${e instanceof Error ? e.message : String(e)}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();