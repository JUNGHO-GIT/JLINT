/**
 * @file git.cjs
 * @since 2025-11-22
 */

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const { logger } = require(`./utils.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `git.cjs`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--push`, `--fetch`].includes(arg))?.replace(`--`, ``) || ``;
const winOrLinux = os.platform() === 'win32' ? `win` : `linux`;

// 원격 기본 브랜치 감지 (고정 규칙: public → public/public/main, private → private/private/main) --------
const getRemoteDefaultBranch = (remoteName = ``) => {
	const fixedBranch = remoteName === `public` ? `public/main` : remoteName === `private` ? `private/main` : ``;

	!fixedBranch ? (
		logger(`error`, `지원하지 않는 remote입니다: ${remoteName}`),
		``
	) : logger(`info`, `원격 저장소 ${remoteName} 기본 브랜치(고정): ${fixedBranch}`);

	return fixedBranch;
};

// changelog 수정 -------------------------------------------------------------------------------
const modifyChangelog = () => {
	logger(`info`, `changelog.md 업데이트 시작`);

	const currentDate = new Date().toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

	const currentTime = new Date().toLocaleTimeString('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});

	const changelog = fs.readFileSync(`changelog.md`, 'utf8');
	const versionPattern = /(\s*)(\d+[.]\d+[.]\d+)(\s*)/g;
	const matches = [...changelog.matchAll(versionPattern)];
	const lastMatch = matches[matches.length - 1];
	const lastVersion = lastMatch[2];
	const versionArray = lastVersion.split('.').map((v) => parseInt(v));

	versionArray[2] = versionArray[2] + 1;
	versionArray[2] >= 10 ? (
		versionArray[2] = 0,
		versionArray[1] = versionArray[1] + 1
	) : (
		versionArray[2] = versionArray[2]
	);
	versionArray[1] >= 10 ? (
		versionArray[1] = 0,
		versionArray[0] = versionArray[0] + 1
	) : (
		versionArray[1] = versionArray[1]
	);

	const newVersion = `\\[ ${versionArray.join('.')} \\]`;
	const formattedDateTime = `- ${currentDate} (${currentTime})`
		.replace(/([.]\s*[(])/g, ` (`)
		.replace(/([.]\s*)/g, `-`)
		.replace(/[(](\W*)(\s*)/g, `(`);

	const newEntry = `\n## ${newVersion}\n\n${formattedDateTime}\n`;
	const updatedChangelog = changelog + newEntry;

	fs.writeFileSync(`changelog.md`, updatedChangelog, 'utf8');
	logger(`success`, `changelog.md 업데이트 완료: ${versionArray.join('.')}`);

	return versionArray.join('.');
};

// package.json 버전 수정 -----------------------------------------------------------------------
const incrementVersion = (newVersion = ``) => {
	logger(`info`, `package.json 버전 업데이트 시작: ${newVersion}`);

	const packageJsonPath = `package.json`;
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	packageJson.version = newVersion;

	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
	logger(`success`, `package.json 버전 업데이트 완료: ${newVersion}`);
};

// git remote 존재 확인 -------------------------------------------------------------------------
const checkRemoteExists = (remoteName = ``) => {
	try {
		execSync(`git remote get-url ${remoteName}`, { encoding: 'utf8', stdio: 'pipe' });
		return true;
	}
	catch (e) {
		return false;
	}
};

// git fetch ------------------------------------------------------------------
const gitFetch = () => {
	try {
		const privateExists = checkRemoteExists(`private`);
		const publicExists = checkRemoteExists(`public`);
		const targetRemote = privateExists ? `private` : `public`;
		const targetBranch = getRemoteDefaultBranch(targetRemote);

		privateExists ? (
			logger(`info`, `Private remote 감지 - private만 fetch 진행`)
		) : (
			logger(`info`, `Private remote 없음 - public fetch 진행`)
		);

		!privateExists && !publicExists ? (
			logger(`error`, `사용 가능한 remote가 없습니다`)
		) : !targetBranch ? (
			logger(`error`, `원격 기본 브랜치를 찾을 수 없습니다`)
		) : (() => {
			logger(`info`, `Git Fetch 시작: ${targetRemote}`);
			execSync(`git fetch ${targetRemote}`, { stdio: 'inherit' });
			logger(`success`, `Git Fetch 완료: ${targetRemote}`);

			logger(`info`, `Git Reset Hard 시작: ${targetRemote}/${targetBranch}`);
			execSync(`git reset --hard ${targetRemote}/${targetBranch}`, { stdio: 'inherit' });
			logger(`success`, `Git Reset Hard 완료: ${targetRemote}/${targetBranch}`);
		})();
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `Git Fetch/Reset 실패: ${msg}`);
		throw e;
	}
};

// git push 공통 함수 ---------------------------------------------------------------------------
const gitPush = (remoteName = ``, ignoreFilePath = ``, winOrLinux = ``) => {
	const remoteExists = checkRemoteExists(remoteName);

	!remoteExists ? (
		logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 건너뜀`)
	) : (() => {
		const targetBranch = getRemoteDefaultBranch(remoteName);

		!targetBranch ? (
			logger(`error`, `원격 기본 브랜치를 찾을 수 없습니다: ${remoteName}`)
		) : (() => {
			logger(`info`, `Git Push 시작: ${remoteName}`);

			const ignorePublicFile = fs.readFileSync(`.gitignore.public`, 'utf8');
			const ignoreContent = fs.readFileSync(ignoreFilePath, 'utf8');

			logger(`info`, `.gitignore 파일 수정 적용: ${ignoreFilePath}`);

			fs.writeFileSync(`.gitignore`, ignoreContent, 'utf8');
			execSync(`git rm -r -f --cached .`, { stdio: 'inherit' });
			execSync(`git add .`, { stdio: 'inherit' });

			const statusOutput = execSync(`git status --porcelain`, { encoding: 'utf8' }).trim();
			statusOutput ? (() => {
				logger(`info`, `변경사항 감지 - 커밋 진행`);
				const commitMessage = winOrLinux === `win` ? (
					`git commit -m "%date% %time:~0,8%"`
				) : (
					`git commit -m "$(date +%Y-%m-%d) $(date +%H:%M:%S)"`
				);
				execSync(commitMessage, { stdio: 'inherit' });
				logger(`success`, `커밋 완료`);
			})() : logger(`info`, `변경사항 없음 - 커밋 건너뜀`);

			logger(`info`, `Push 진행: ${remoteName} ${targetBranch}`);
			execSync(`git push --force ${remoteName} HEAD:${targetBranch}`, { stdio: 'inherit' });
			logger(`success`, `Push 완료: ${remoteName} ${targetBranch}`);

			fs.writeFileSync(`.gitignore`, ignorePublicFile, 'utf8');
			logger(`info`, `.gitignore 파일 복원`);
		})();
	})();
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `운영체제: ${winOrLinux}`);
	logger(`info`, `전달된 인자 1 : ${args1 || 'none'}`);
	logger(`info`, `전달된 인자 2 : ${args2 || 'none'}`);

	try {
		args2.includes(`fetch`) && (() => {
			gitFetch();
			logger(`success`, `Git Fetch & Reset 완료`);
		})();

		args2.includes(`push`) && (() => {
			incrementVersion(modifyChangelog());
			gitPush(`public`, `.gitignore.public`, winOrLinux);
			gitPush(`private`, `.gitignore.private`, winOrLinux);
			logger(`success`, `Git Push 완료`);
		})();
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}

	logger(`info`, `스크립트 종료: ${TITLE}`);
})();
