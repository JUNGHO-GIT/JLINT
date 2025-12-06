/**
 * @file git.mjs
 * @description Git 관련 자동화 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-03
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { logger, runPrompt, fileExists } from '../lib/utils.mjs';
import { env } from '../lib/env.mjs';
import { settings } from '../lib/settings.mjs';

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [
	`--push`,
	`--fetch`,
].includes(arg))?.replace(`--`, ``) || ``;
const args3 = argv.find(arg => [
	`--y`,
	`--n`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 원격 기본브랜치 감지 -------------------------------------------------------------------
const getRemoteDefaultBranch = (remoteName = ``) => {
	try {
		logger(`info`, `원격 저장소 ${remoteName} 기본브랜치 감지 시작`);
		const branch = remoteName === settings.git.remotes.public.name ? (
			settings.git.remotes.public.branch
		) : remoteName === settings.git.remotes.private.name ? (
			settings.git.remotes.private.branch
		) : (
			null
		);

		branch ? (
			logger(`info`, `원격 저장소 ${remoteName} 기본브랜치 (고정): ${branch}`)
		) : (
			logger(`error`, `지원하지 않는 remote입니다: ${remoteName}`)
		);

		return branch;
	}
	catch (e) {
		logger(`error`, `원격 저장소 ${remoteName} 기본브랜치 감지 실패`);
		return null;
	}
};

// 3. git remote 존재 확인 -------------------------------------------------------------------
const checkRemoteExists = (remoteName = ``) => {
	try {
		logger(`info`, `원격 저장소 ${remoteName} 존재 여부 확인`);
		execSync(`git remote get-url ${remoteName}`, { "encoding": `utf8`, "stdio": `pipe` });
		return true;
	}
	catch {
		logger(`info`, `원격 저장소 ${remoteName} 존재하지 않음`);
		return false;
	}
};

// 4. 원격 기본브랜치 설정 -------------------------------------------------------------------
const setRemoteDefaultBranch = (remoteName = ``) => {
	const remoteExists = checkRemoteExists(remoteName);
	!remoteExists && logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 기본브랜치 설정 건너뜀`);
	remoteExists && (() => {
		const targetBranch = getRemoteDefaultBranch(remoteName);
		!targetBranch && (logger(`error`, `원격 기본브랜치를 찾을 수 없습니다: ${remoteName}`), process.exit(1));

		try {
			const remoteUrl = execSync(`git remote get-url ${remoteName}`, { "encoding": `utf8` }).trim();
			const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
			!match && logger(`warn`, `GitHub URL 파싱 실패: ${remoteUrl}`);

			match && (() => {
				const [
					, owner,
					repo,
				] = match;
				logger(`info`, `GitHub default branch 변경 시도: ${owner}/${repo} → ${targetBranch}`);

				execSync(`gh api repos/${owner}/${repo} -X PATCH -f default_branch=${targetBranch}`, { "stdio": `pipe` });
				logger(`success`, `GitHub default branch 변경 완료: ${targetBranch}`);

				targetBranch !== `main` && (() => {
					try {
						execSync(`git push ${remoteName} --delete main`, { "stdio": `pipe` });
						logger(`success`, `원격 'main' 브랜치 삭제 완료: ${remoteName}`);
					}
					catch {
						logger(`info`, `원격 'main' 브랜치 없음 또는 이미 삭제됨: ${remoteName}`);
					}
				})();
			})();
		}
		catch (e) {
			logger(`warn`, `GitHub default branch 설정 실패 (gh CLI 필요): ${e instanceof Error ? e.message : String(e)}`);
		}
	})();
};

// 5. 불필요한 브랜치 삭제 (로컬 + 원격) ------------------------------------------------------
const cleanupBranches = () => {
	logger(`info`, `불필요한 브랜치 정리 시작`);
	const localDefaultBranches = [
		settings.git.remotes.public.branch,
		settings.git.remotes.private.branch,
	].filter(Boolean);
	const uniqueDefaults = [
		...new Set(localDefaultBranches),
	];

	// 5-1. 로컬 브랜치 정리
	(() => {
		const localBranches = execSync(`git branch --list`, { "encoding": `utf8` })
			.split(/\r?\n/)
			.map(b => b.replace(/^\*?\s*/, ``).trim())
			.filter(Boolean);

		const localToDelete = localBranches.filter(b => !uniqueDefaults.includes(b));
		!localToDelete.length && logger(`info`, `삭제할 로컬 브랜치 없음`);

		localToDelete.length && (() => {
			logger(`info`, `삭제 대상 로컬 브랜치: ${localToDelete.join(`, `)}`);

			const currentBranch = execSync(`git branch --show-current`, { "encoding": `utf8` }).trim();
			!uniqueDefaults.includes(currentBranch) && (() => {
				const switchTo = uniqueDefaults[0];
				logger(`info`, `현재 브랜치 '${currentBranch}'가 삭제 대상 - '${switchTo}'로 전환`);
				execSync(`git checkout ${switchTo}`, { "stdio": `inherit` });
			})();

			localToDelete.forEach(branch => {
				try {
					execSync(`git branch -D ${branch}`, { "stdio": `pipe` });
					logger(`success`, `로컬 브랜치 삭제 완료: ${branch}`);
				}
				catch (e) {
					logger(`warn`, `로컬 브랜치 삭제 실패: ${branch} - ${e instanceof Error ? e.message : String(e)}`);
				}
			});
		})();
	})();

	// 5-2. 원격 브랜치 정리
	[
		settings.git.remotes.public.name,
		settings.git.remotes.private.name,
	].forEach(remoteName => {
		const remoteExists = checkRemoteExists(remoteName);
		!remoteExists && logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 원격 브랜치 정리 건너뜀`);

		remoteExists && (() => {
			const targetBranch = getRemoteDefaultBranch(remoteName);

			try {
				execSync(`git fetch ${remoteName} --prune`, { "stdio": `pipe` });
			}
			catch {
				logger(`warn`, `${remoteName} fetch 실패`);
			}

			const remoteBranches = execSync(`git branch -r --list "${remoteName}/*"`, { "encoding": `utf8` })
				.split(/\r?\n/)
				.map(b => b.trim())
				.filter(b => b && !b.includes(`HEAD`))
				.map(b => b.replace(`${remoteName}/`, ``));

			const remoteToDelete = remoteBranches.filter(b => b !== targetBranch);
			!remoteToDelete.length && logger(`info`, `삭제할 원격 브랜치 없음: ${remoteName}`);

			remoteToDelete.length && (() => {
				logger(`info`, `삭제 대상 원격 브랜치 (${remoteName}): ${remoteToDelete.join(`, `)}`);

				remoteToDelete.forEach(branch => {
					try {
						execSync(`git push ${remoteName} --delete ${branch}`, { "stdio": `pipe` });
						logger(`success`, `원격 브랜치 삭제 완료: ${remoteName}/${branch}`);
					}
					catch (e) {
						logger(`warn`, `원격 브랜치 삭제 실패: ${remoteName}/${branch} - ${e instanceof Error ? e.message : String(e)}`);
					}
				});
			})();
		})();
	});
	logger(`success`, `브랜치 정리 완료`);
};

// 6. git cache 초기화 -----------------------------------------------------------------------
const clearGitCache = () => {
	logger(`info`, `Git 캐시 초기화 시작`);
	try {
		execSync(`git rm -r -f --cached .`, { "stdio": `inherit` });
		logger(`success`, `Git 캐시 초기화 완료`);
	}
	catch (e) {
		logger(`error`, `Git 캐시 초기화 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}
};

// 7. 파일 라인 변환 헬퍼 --------------------------------------------------------------------
const transformLines = (content = ``, rules = []) => {
	const lines = content.split(/\r?\n/);
	const transformed = lines.map(line => {
		const matched = rules.find(r => r.match(line));
		const result = matched ? matched.replace(line) : line;
		return result;
	});
	return transformed.join(os.EOL);
};

// 8. env 파일 및 index 파일 수정 ------------------------------------------------------------
const modifyEnvAndIndex = () => {
	const envExists = fileExists(`.env`);
	const indexExists = fileExists(`index.ts`);

	!envExists && !indexExists && logger(`info`, `.env 및 index.ts 파일 없음 - 건너뜀`);
	envExists && (() => {
		logger(`info`, `.env 파일 수정 시작`);
		const envContent = fs.readFileSync(`.env`, `utf8`);
		const envRules = [
			{
				"match": (line = ``) => line.startsWith(`CLIENT_URL=`),
				"replace": () => `CLIENT_URL=https://www.${env.domain}/${env.projectName}`,
			},
			{
				"match": (line = ``) => line.startsWith(`GOOGLE_CALLBACK_URL=`),
				"replace": () => `GOOGLE_CALLBACK_URL=https://www.${env.domain}/${env.projectName}/${env.gcp.callback}`,
			},
		];
		fs.writeFileSync(`.env`, transformLines(envContent, envRules));
		logger(`info`, `.env 파일 수정 완료`);
	})();
	indexExists && (() => {
		logger(`info`, `index.ts 파일 수정 시작`);
		const indexContent = fs.readFileSync(`index.ts`, `utf8`);
		const indexRules = [
			{
				"match": (line = ``) => line.trim().startsWith(`// const db = process.env.DB_NAME`),
				"replace": () => `const db = process.env.DB_NAME;`,
			},
			{
				"match": (line = ``) => line.trim().startsWith(`const db = process.env.DB_TEST`),
				"replace": () => `// const db = process.env.DB_TEST;`,
			},
		];
		fs.writeFileSync(`index.ts`, transformLines(indexContent, indexRules));
		logger(`info`, `index.ts 파일 수정 완료`);
	})();
};

// 9. env 파일 및 index 파일 복원 ------------------------------------------------------------
const restoreEnvAndIndex = () => {
	const envExists = fileExists(`.env`);
	const indexExists = fileExists(`index.ts`);

	!envExists && !indexExists && logger(`info`, `.env 및 index.ts 파일 없음 - 복원 건너뜀`);
	envExists && (() => {
		logger(`info`, `.env 파일 복원 시작`);
		const envContent = fs.readFileSync(`.env`, `utf8`);
		const envRules = [
			{
				"match": (line = ``) => line.startsWith(`CLIENT_URL=`),
				"replace": () => `CLIENT_URL=http://localhost:${env.localPort.client}/${env.projectName}`,
			},
			{
				"match": (line = ``) => line.startsWith(`GOOGLE_CALLBACK_URL=`),
				"replace": () => `GOOGLE_CALLBACK_URL=http://localhost:${env.localPort.server}/${env.projectName}/${env.gcp.callback}`,
			},
		];
		fs.writeFileSync(`.env`, transformLines(envContent, envRules));
		logger(`info`, `.env 파일 복원 완료`);
	})();
	indexExists && (() => {
		logger(`info`, `index.ts 파일 복원 시작`);
		const indexContent = fs.readFileSync(`index.ts`, `utf8`);
		const indexRules = [
			{
				"match": (line = ``) => line.trim().startsWith(`const db = process.env.DB_NAME`),
				"replace": () => `// const db = process.env.DB_NAME;`,
			},
			{
				"match": (line = ``) => line.trim().startsWith(`// const db = process.env.DB_TEST`),
				"replace": () => `const db = process.env.DB_TEST;`,
			},
		];
		fs.writeFileSync(`index.ts`, transformLines(indexContent, indexRules));
		logger(`info`, `index.ts 파일 복원 완료`);
	})();
};

// 10. changelog 수정 ------------------------------------------------------------------------
const modifyChangelog = (msg = ``) => {
	const changelogExists = fileExists(`changelog.md`);
	!changelogExists && logger(`info`, `changelog.md 파일 없음 - 건너뜀`);

	const result = changelogExists ? (() => {
		logger(`info`, `changelog.md 업데이트 시작`);

		const changelog = fs.readFileSync(`changelog.md`, `utf8`);
		const matches = [
			...changelog.matchAll(/(\s*)(\d+[.]\d+[.]\d+)(\s*)/g),
		];
		const lastVersion = matches[matches.length - 1][2];
		const ver = lastVersion.split(`.`).map(Number);

		ver[2]++;
		ver[2] >= 10 && (ver[2] = 0, ver[1]++);
		ver[1] >= 10 && (ver[1] = 0, ver[0]++);

		const newVersion = ver.join(`.`);
		const entryContent = msg ? (
			`- ${msg}`
		) : (() => {
			const now = new Date();
			const dateStr = now.toLocaleDateString(`ko-KR`, { "year": `numeric`, "month": `2-digit`, "day": `2-digit` });
			const timeStr = now.toLocaleTimeString(`ko-KR`, { "hour": `2-digit`, "minute": `2-digit`, "second": `2-digit`, "hour12": false });
			const formatted = `- ${dateStr} (${timeStr})`
				.replace(/([.]\s*[(])/g, ` (`)
				.replace(/([.]\s*)/g, `-`)
				.replace(/[(](\W*)(\s*)/g, `(`);
			return formatted;
		})();

		const newEntry = `\n## \\[ ${newVersion} \\]\n\n${entryContent}\n`;
		fs.writeFileSync(`changelog.md`, changelog + newEntry, `utf8`);
		logger(`success`, `changelog.md 업데이트 완료: ${newVersion}`);

		return newVersion;
	})() : ``;

	return result;
};

// 11. package.json 버전 수정 ----------------------------------------------------------------
const incrementVersion = (newVersion = ``) => {
	const pkgPath = `package.json`;
	const pkgExists = fileExists(pkgPath);
	!newVersion && logger(`info`, `버전 정보 없음 - package.json 업데이트 건너뜀`);
	!pkgExists && newVersion && logger(`info`, `package.json 파일 없음 - 건너뜀`);
	pkgExists && newVersion && (() => {
		logger(`info`, `package.json 버전 업데이트 시작: ${newVersion}`);
		const pkg = JSON.parse(fs.readFileSync(pkgPath, `utf8`));
		pkg.version = newVersion;
		fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, `utf8`);
		logger(`success`, `package.json 버전 업데이트 완료: ${newVersion}`);
	})();
};

// 12. git fetch -----------------------------------------------------------------------------
const gitFetch = () => {
	try {
		const privateExists = checkRemoteExists(settings.git.remotes.private.name);
		const publicExists = checkRemoteExists(settings.git.remotes.public.name);
		privateExists ? (
			logger(`info`, `Private remote 감지 - ${settings.git.remotes.private.name}만 fetch 진행`)
		) : (
			logger(`info`, `Private remote 없음 - ${settings.git.remotes.public.name} fetch 진행`)
		);

		const targetRemote = privateExists ? settings.git.remotes.private.name : settings.git.remotes.public.name;
		const targetBranch = getRemoteDefaultBranch(targetRemote);
		!privateExists && !publicExists && (logger(`error`, `사용 가능한 remote가 없습니다`), process.exit(1));
		!targetBranch && (logger(`error`, `원격 기본브랜치를 찾을 수 없습니다`), process.exit(1));

		logger(`info`, `Git Fetch 시작: ${targetRemote}`);
		execSync(`git fetch ${targetRemote}`, { "stdio": `inherit` });
		logger(`success`, `Git Fetch 완료: ${targetRemote}`);

		logger(`info`, `Git Reset Hard 시작: ${targetRemote}/${targetBranch}`);
		execSync(`git reset --hard ${targetRemote}/${targetBranch}`, { "stdio": `inherit` });
		logger(`success`, `Git Reset Hard 완료: ${targetRemote}/${targetBranch}`);
	}
	catch (e) {
		logger(`error`, `Git Fetch/Reset 실패: ${e instanceof Error ? e.message : String(e)}`);
		throw e;
	}
};

// 13. git push 공통 함수 --------------------------------------------------------------------
const gitPush = (remoteName = ``, ignoreFilePath = ``, msg = ``) => {
	const remoteExists = checkRemoteExists(remoteName);
	!remoteExists && logger(`info`, `Remote '${remoteName}' 존재하지 않음 - 건너뜀`);

	remoteExists && (() => {
		const targetBranch = getRemoteDefaultBranch(remoteName);
		!targetBranch && (logger(`error`, `원격 기본브랜치를 찾을 수 없습니다: ${remoteName}`), process.exit(1));

		logger(`info`, `Git Push 시작: ${remoteName}`);

		const ignorePublicFile = fs.readFileSync(`.gitignore.public`, `utf8`);
		const ignoreContent = fs.readFileSync(ignoreFilePath, `utf8`);

		logger(`info`, `.gitignore 파일 수정 적용: ${ignoreFilePath}`);
		fs.writeFileSync(`.gitignore`, ignoreContent, `utf8`);
		clearGitCache();
		execSync(`git add .`, { "stdio": `inherit` });

		const statusOutput = execSync(`git status --porcelain`, { "encoding": `utf8` }).trim();
		statusOutput && (() => {
			logger(`info`, `변경사항 감지 - 커밋 진행`);
			const tempFile = `.git-commit-msg.tmp`;
			const commitContent = msg || (() => {
				const now = new Date();
				const dateStr = now.toISOString().slice(0, 10);
				const timeStr = now.toTimeString().slice(0, 8);
				return `${dateStr} ${timeStr}`;
			})();
			fs.writeFileSync(tempFile, commitContent, `utf8`);
			execSync(`git commit -F "${tempFile}"`, { "stdio": `inherit` });
			fs.unlinkSync(tempFile);
			logger(`success`, `커밋 완료`);
		})();
		!statusOutput && logger(`info`, `변경사항 없음 - 커밋 건너뜀`);

		logger(`info`, `Push 진행: ${remoteName} ${targetBranch}`);
		execSync(`git push --force ${remoteName} HEAD:${targetBranch}`, { "stdio": `inherit` });
		logger(`success`, `Push 완료: ${remoteName} ${targetBranch}`);

		fs.writeFileSync(`.gitignore`, ignorePublicFile, `utf8`);
		logger(`info`, `.gitignore 파일 복원`);
	})();
};

// 14. Push 프로세스 실행 --------------------------------------------------------------------
const runPushProcess = async () => {
	const commitMsg = args3.includes(`n`) ? (
		``
	) : (
		await runPrompt(`커밋 메시지 입력 (빈값 = 날짜/시간): `)
	);
	logger(`info`, `커밋 메시지: ${commitMsg || `auto (date/time)`}`);

	modifyEnvAndIndex();
	incrementVersion(modifyChangelog(commitMsg));
	gitPush(settings.git.remotes.public.name, `.gitignore.public`, commitMsg);
	gitPush(settings.git.remotes.private.name, `.gitignore.private`, commitMsg);
	restoreEnvAndIndex();
	logger(`success`, `Git Push 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
void (async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `fetch` && (() => {
			setRemoteDefaultBranch(settings.git.remotes.public.name);
			setRemoteDefaultBranch(settings.git.remotes.private.name);
			cleanupBranches();
			gitFetch();
		})();
		args2 === `push` && void (async () => {
			setRemoteDefaultBranch(settings.git.remotes.public.name);
			setRemoteDefaultBranch(settings.git.remotes.private.name);
			cleanupBranches();
			await runPushProcess();
		})();
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
