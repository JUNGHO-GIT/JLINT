/**
 * @file utils.mjs
 * @description 공통 유틸리티 함수 모음 (ESM)
 * @author Jungho
 * @since 2025-11-22
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { spawnSync, execSync } from "child_process";

// 1. 텍스트 포맷 ----------------------------------------------------------------------------
export const formatLog = (text = ``) => text.trim().replace(/^\s+/gm, ``);

// 2. 로깅 -----------------------------------------------------------------------------------
export const logger = (type = ``, value = ``) => {
	const config = {
		"line": {
			"str": `-----------------------------------------`,
			"color": `\u001b[38;2;255;162;0m`,
		},
		"debug": {
			"str": `[DEBUG]`,
			"color": `\u001b[38;5;141m`,
		},
		"info": {
			"str": `[INFO]`,
			"color": `\u001b[38;5;46m`,
		},
		"success": {
			"str": `[SUCCESS]`,
			"color": `\u001b[38;5;82m`,
		},
		"hint": {
			"str": `[HINT]`,
			"color": `\u001b[38;5;39m`,
		},
		"warn": {
			"str": `[WARN]`,
			"color": `\u001b[38;5;214m`,
		},
		"error": {
			"str": `[ERROR]`,
			"color": `\u001b[38;5;196m`,
		},
		"reset": {
			"str": ``,
			"color": `\u001b[0m`,
		},
	};

	const separator = `${config.reset.color}${config.line.color}${config.line.str}${config.reset.color}`;
	const level = `${config.reset.color}${config?.[type]?.color ?? ``}${config?.[type]?.str ?? ``}${config.reset.color}`;
	const fmtMsg = formatLog(`
    ${separator}
    ${level}
    ${value}
  `);

	type === `debug` && console.debug(fmtMsg);
	type === `info` && console.info(fmtMsg);
	type === `success` && console.log(fmtMsg);
	type === `hint` && console.log(fmtMsg);
	type === `warn` && console.warn(fmtMsg);
	type === `error` && console.error(fmtMsg);
};

// 3. 명령 실행 ------------------------------------------------------------------------------
export const runCmd = (cmd = ``, args = [], ignoreError = false, useShell = true) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const shouldUseShell = cmd !== `bun` && useShell;
	const result = spawnSync(cmd, args, {
		"stdio": `inherit`,
		"shell": shouldUseShell,
		"env": process.env,
	});

	result.error && (() => {
		logger(`error`, `${cmd} 실행 오류: ${result.error?.message ?? `알 수 없는 오류`}`);
		!ignoreError && process.exit(1);
	})();

	result.status !== 0 && (() => {
		ignoreError ? (() => {
			logger(`warn`, `${cmd} 경고 무시 (exit code: ${result.status})`);
		})() : (() => {
			logger(`error`, `${cmd} 실패 (exit code: ${result.status})`);
			process.exit(result.status || 1);
		})();
	})();

	logger(`success`, `${cmd} 실행 완료`);
};

// 4. 사용자 입력 받기 -----------------------------------------------------------------------
export const runPrompt = (question = ``) => {
	const rl = readline.createInterface({
		"input": process.stdin,
		"output": process.stdout,
	});
	const result = new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
	return result;
};

// 5. spawn 래퍼 -----------------------------------------------------------------------------
export const spawnWrapper = (cmd = ``, args = []) => {
	const binDir = path.join(process.cwd(), `node_modules`, `.bin`);
	const envPath = process.env.PATH || process.env.Path || ``;
	const pathParts = envPath.split(path.delimiter).filter(Boolean);

	!pathParts.includes(binDir) && pathParts.unshift(binDir);

	const newEnv = {
		...process.env,
	};
	const pathKey = process.platform === `win32` ? `Path` : `PATH`;
	newEnv[pathKey] = pathParts.join(path.delimiter);

	const result = spawnSync(cmd, args, {
		"encoding": `utf8`,
		"env": newEnv,
	});
	return result;
};

// 6. 디렉토리 유효성 검사 -------------------------------------------------------------------
export const validateDir = (list = []) => {
	const isArr = Array.isArray(list);
	const found = isArr ? list.find((name) => fs.existsSync(path.join(process.cwd(), name))) : null;

	found ? logger(`info`, `유효한 디렉터리 발견: ${found}`) : logger(`warn`, `유효한 디렉터리 없음: ${list.join(`, `)}`);

	const result = found ?? (isArr ? list[0] : null);
	return result;
};

// 7. 특정파일 생성 --------------------------------------------------------------------------
export const createFile = (tp = ``, content = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const dir = path.dirname(full);
	const exists = fs.existsSync(full);

	!fs.existsSync(dir) && fs.mkdirSync(dir, {
		"recursive": true,
	});

	exists && logger(`info`, `이미 존재하는 파일: ${full}`);
	!exists && (() => {
		fs.writeFileSync(full, content, {
			"encoding": `utf8`,
		});
		logger(`success`, `파일 생성: ${full}`);
	})();

	return !exists;
};

// 8. 특정폴더 생성 --------------------------------------------------------------------------
export const createDir = (tp = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const exists = fs.existsSync(full);

	exists && logger(`info`, `이미 존재하는 폴더: ${full}`);
	!exists && (() => {
		fs.mkdirSync(full, {
			"recursive": true,
		});
		logger(`success`, `폴더 생성: ${full}`);
	})();

	return !exists;
};

// 9. 특정파일 삭제 --------------------------------------------------------------------------
export const delFile = (tp = ``, ext = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const dir = tp ? full : process.cwd();
	const isValidDir = fs.existsSync(dir) && fs.statSync(dir).isDirectory();

	// 패턴 삭제 모드
	const patternResult = ext && isValidDir && (() => {
		const files = fs.readdirSync(dir).filter((name) => name.includes(ext));

		!files.length && logger(`warn`, `삭제할 파일 없음 (패턴: ${ext}) - 경로: ${dir}`);
		files.length && (() => {
			files.forEach((name) => {
				fs.unlinkSync(path.join(dir, name));
			});
			logger(`success`, `파일 삭제 (패턴: ${ext}) - 경로: ${dir}, 개수: ${files.length}`);
		})();

		return files.length > 0;
	})();

	// 단일 파일 삭제 모드
	const singleResult = !ext && (() => {
		const fileExists = fs.existsSync(full);

		!fileExists && logger(`warn`, `삭제할 파일 없음: ${full}`);
		fileExists && (() => {
			fs.unlinkSync(full);
			logger(`success`, `파일 삭제: ${full}`);
		})();

		return fileExists;
	})();

	const result = ext ? (patternResult ?? false) : (singleResult ?? false);
	return result;
};

// 10. 특정폴더 삭제 -------------------------------------------------------------------------
export const delDir = (tp = ``, pat = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const dir = tp ? full : process.cwd();
	const isValidDir = fs.existsSync(dir) && fs.statSync(dir).isDirectory();

	// 패턴 삭제 모드
	const patternResult = pat && isValidDir && (() => {
		const ents = fs.readdirSync(dir, {
			"withFileTypes": true,
		});
		const tgts = ents.filter((e) => e.isDirectory() && e.name.includes(pat));

		!tgts.length && logger(`warn`, `삭제할 폴더 없음 (패턴: ${pat}) - 경로: ${dir}`);
		tgts.length && (() => {
			tgts.forEach((d) => {
				fs.rmSync(path.join(dir, d.name), {
					"recursive": true,
					"force": true,
				});
			});
			logger(`success`, `폴더 삭제 (패턴: ${pat}) - 경로: ${dir}, 개수: ${tgts.length}`);
		})();

		return tgts.length > 0;
	})();

	// 단일 폴더 삭제 모드
	const singleResult = !pat && (() => {
		const dirExists = fs.existsSync(full);

		!dirExists && logger(`warn`, `삭제할 폴더 없음: ${full}`);
		dirExists && (() => {
			fs.rmSync(full, {
				"recursive": true,
				"force": true,
			});
			logger(`success`, `폴더 삭제: ${full}`);
		})();

		return dirExists;
	})();

	const result = pat ? (patternResult ?? false) : (singleResult ?? false);
	return result;
};

// 11. 프로젝트 타입 검증 --------------------------------------------------------------------
export const getProjectType = (args = ``) => {
	const isClient = args === `client`;
	const isServer = args === `server`;
	const hasFile = (fp = ``) => fs.existsSync(path.isAbsolute(fp) ? fp : path.join(process.cwd(), fp));

	!isClient && !isServer && (() => {
		logger(`error`, `프로젝트 타입을 지정해주세요: --client 또는 --server`);
		process.exit(1);
	})();

	const viteConfigs = [
		`vite.config.ts`,
		`vite.config.js`,
		`vite.config.mts`,
		`vite.config.mjs`,
	];
	const hasVite = viteConfigs.some(hasFile);
	const hasNext = hasFile(`next.config.js`) || hasFile(`next.config.mjs`);
	const hasReactScripts = hasFile(path.join(`node_modules`, `react-scripts`, `bin`, `react-scripts.js`));
	const hasIndexTs = hasFile(`index.ts`);

	isClient && !hasVite && !hasNext && !hasReactScripts && logger(`warn`, `클라이언트 설정 파일을 찾을 수 없습니다 (vite.config, next.config, react-scripts)`);
	isServer && !hasIndexTs && logger(`warn`, `서버 진입점 파일을 찾을 수 없습니다 (index.ts)`);

	const result = {
		isClient,
		isServer,
		hasVite,
		hasNext,
		hasReactScripts,
		hasIndexTs,
	};
	return result;
};

// 12. 플랫폼 감지 ---------------------------------------------------------------------------
export const getPlatform = () => (process.platform === `win32` ? `win` : `linux`);

// 13. 패키지 매니저 인자 생성 ---------------------------------------------------------------
export const getPmArgs = (mgr = ``, baseArgs = [], options = {}) => {
	const { execPrefix = true } = options;

	const result = mgr === `npm` ? (execPrefix ? [
		`exec`,
		`--`,
		...baseArgs,
	] : baseArgs) : mgr === `pnpm` ? (execPrefix ? [
		`exec`,
		...baseArgs,
	] : baseArgs) : mgr === `yarn` ? baseArgs : mgr === `bun` ? [
		`x`,
		...baseArgs,
	] : [];

	return result;
};

// 14. 명령 실행 헬퍼 (설명 포함) ------------------------------------------------------------
export const execCommand = (cmd = ``, desc = ``) => {
	logger(`info`, `${desc} 시작`);
	try {
		execSync(cmd, {
			"stdio": `inherit`,
		});
		logger(`info`, `${desc} 완료`);
		return true;
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${desc} 실패: ${errMsg}`);
		throw e;
	}
};

// 15. 파일 존재 확인 ------------------------------------------------------------------------
export const fileExists = (fp = ``) => {
	const full = path.isAbsolute(fp) ? fp : path.join(process.cwd(), fp);
	return fs.existsSync(full);
};
