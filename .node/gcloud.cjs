// gcloud.cjs

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

// 인자 파싱 ------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--git`, `--deploy`].includes(arg))?.replace(`--`, ``) || ``;
const winOrLinux = os.platform() === 'win32' ? `win` : `linux`;

// 로깅 함수 -----------------------------------------------------------------------------------
const logger = (type=``, message=``) => {
	const format = (text=``) => text.trim().replace(/^\s+/gm, ``);
	const line = `----------------------------------------`;
	const colors = {
		line: `\x1b[38;5;214m`,
		info: `\x1b[36m`,
		success: `\x1b[32m`,
		warn: `\x1b[33m`,
		error: `\x1b[31m`,
		reset: `\x1b[0m`
	};
	const separator = `${colors.line}${line}${colors.reset}`;

	type === `info` && console.log(format(`
		${separator}
		${colors.info}[INFO]${colors.reset} - ${message}
	`));
	type === `success` && console.log(format(`
		${separator}
		${colors.success}[SUCCESS]${colors.reset} - ${message}
	`));
	type === `warn` && console.log(format(`
		${separator}
		${colors.warn}[WARN]${colors.reset} - ${message}
	`));
	type === `error` && console.log(format(`
		${separator}
		${colors.error}[ERROR]${colors.reset} - ${message}
	`));
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
	(versionArray[2] >= 10) ? (
		versionArray[2] = 0,
		versionArray[1] = versionArray[1] + 1
	) : (
		versionArray[2] = versionArray[2]
	);
	(versionArray[1] >= 10) ? (
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
const incrementVersion = (newVersion=``) => {
	logger(`info`, `package.json 버전 업데이트 시작: ${newVersion}`);

	const packageJsonPath = `package.json`;
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

	packageJson.version = newVersion;

	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
	logger(`success`, `package.json 버전 업데이트 완료: ${newVersion}`);
};

// 리모트 존재 확인 -----------------------------------------------------------------------------
const checkRemoteExists = (remoteName=``) => {
	try {
		const remotes = execSync(`git remote`, { encoding: 'utf8' }).trim().split('\n');
		return remotes.includes(remoteName);
	}
	catch (e) {
		return false;
	}
};

// git push 공통 함수 ---------------------------------------------------------------------------
const gitPush = (remoteName=``, ignoreFilePath=``, winOrLinux=``) => {
	logger(`info`, `Git Push 시작: ${remoteName}`);

	const ignoreFile = `.gitignore`;
	const ignorePublicFile = fs.readFileSync(`.gitignore.public`, 'utf8');
	const ignoreContent = fs.readFileSync(ignoreFilePath, 'utf8');
	const currentBranch = execSync(`git branch --show-current`, { encoding: 'utf8' }).trim();

	logger(`info`, `현재 브랜치: ${currentBranch}`);
	logger(`info`, `.gitignore 파일 교체: ${ignoreFilePath}`);

	fs.writeFileSync(ignoreFile, ignoreContent, 'utf8');

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

	logger(`info`, `Push 진행: ${remoteName} ${currentBranch}`);
	execSync(`git push --force ${remoteName} ${currentBranch}`, { stdio: 'inherit' });
	logger(`success`, `Push 완료: ${remoteName}`);

	fs.writeFileSync(ignoreFile, ignorePublicFile, 'utf8');
	logger(`info`, `.gitignore 파일 복원`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: gcloud.cjs`);

	try {
		args1 === `git` && (() => {
			const newVersion = modifyChangelog();
			incrementVersion(newVersion);
			checkRemoteExists(`origin`) ? (
				gitPush(`origin`, `.gitignore.public`, winOrLinux)
			) : (
				logger(`warn`, `리모트 'origin' 없음 - 건너뜀`)
			);
			checkRemoteExists(`private`) ? (
				gitPush(`private`, `.gitignore.private`, winOrLinux)
			) : (
				logger(`warn`, `리모트 'private' 없음 - 건너뜀`)
			);
			logger(`success`, `Git 푸시 완료`);
		})();
		args1 === `deploy` && (() => {
			const newVersion = modifyChangelog();
			incrementVersion(newVersion);
			checkRemoteExists(`origin`) ? (
				gitPush(`origin`, `.gitignore.public`, winOrLinux)
			) : (
				logger(`warn`, `리모트 'origin' 없음 - 건너뜀`)
			);
			checkRemoteExists(`private`) ? (
				gitPush(`private`, `.gitignore.private`, winOrLinux)
			) : (
				logger(`warn`, `리모트 'private' 없음 - 건너뜀`)
			);
			logger(`success`, `배포 완료`);
		})();
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `gcloud 작업 실패: ${msg}`);
		process.exit(1);
	}
})();