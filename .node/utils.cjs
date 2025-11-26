/**
 * @file utils.cjs
 * @since 2025-11-22
 */

const fs = require(`fs`);
const path = require(`path`);
const { spawnSync } = require(`child_process`);

// ----------------------------------------------------------------------------------------
const formatLog = (text = ``) => {
	return text.trim().replace(/^\s+/gm, ``);
};

// 로깅 -----------------------------------------------------------------------------------
// @ts-ignore
const logger = (
	type = ``,
	value = ``
) => {
	const config = {
		line: {
			str: `-----------------------------------------`,
			color: `\u001b[38;2;255;162;0m`,
		},
		debug: {
			str: `[DEBUG]`,
			color: `\u001b[38;5;141m`,
		},
		info: {
			str: `[INFO]`,
			color: `\u001b[38;5;46m`,
		},
		hint: {
			str: `[HINT]`,
			color: `\u001b[38;5;39m`,
		},
		warn: {
			str: `[WARN]`,
			color: `\u001b[38;5;214m`,
		},
		error: {
			str: `[ERROR]`,
			color: `\u001b[38;5;196m`,
		},
		reset: {
			str: ``,
			color: `\u001b[0m`,
		},
	};
	const separator = `${config.reset.color}${config.line.color}${config.line.str}${config.reset.color}`;
	const level = `${config.reset.color}${config?.[type]?.color ?? ``}${config?.[type]?.str ?? ``}${config.reset.color}`;
	const fmtMsg = formatLog(`
		${separator}
		${level}
		${value}
	`);

	type === `debug` && (
		console.debug(fmtMsg)
	);
	type === `info` && (
		console.info(fmtMsg)
	);
	type === `hint` && (
		console.log(fmtMsg)
	);
	type === `warn` && (
		console.warn(fmtMsg)
	);
	type === `error` && (
		console.error(fmtMsg)
	);
};

// 명령 실행 ------------------------------------------------------------------------------
// @ts-ignore
const runCmd = (cmd = ``, args = [], ignoreError = false, useShell = true) => {
	logger(`info`, `실행: ${cmd} ${args.join(` `)}`);

	const shouldUseShell = cmd === `bun` ? false : useShell;
	const result = spawnSync(cmd, args, {
		stdio: `inherit`,
		shell: shouldUseShell,
		env: process.env
	});

	const hasError = result.error;
	const hasFailed = result.status !== 0;

	hasError && (
		logger(`error`, `${cmd} 실행 오류: ${result.error ? result.error.message : `알 수 없는 오류`}`),
		!ignoreError && process.exit(1)
	);

	hasFailed && (
		ignoreError ? (
			logger(`warn`, `${cmd} 경고 무시 (exit code: ${result.status})`)
		) : (
			logger(`error`, `${cmd} 실패 (exit code: ${result.status})`),
			process.exit(result.status || 1)
		)
	);

	logger(`success`, `${cmd} 실행 완료`);
};

// spawn 래퍼 -----------------------------------------------------------------------------
// @ts-ignore
const spawnWrapper = (cmd = ``, args = []) => {
	const binDir = path.join(process.cwd(), `node_modules`, `.bin`);
	const envPath = (process.env.PATH || process.env.Path || ``);
	const pathParts = envPath.split(path.delimiter).filter(Boolean);
	(!pathParts.includes(binDir)) ? pathParts.unshift(binDir) : void 0;

	const newEnv = ({ ...process.env });
	(process.platform === `win32`) ? (
		newEnv.Path = pathParts.join(path.delimiter)
	) : (
		newEnv.PATH = pathParts.join(path.delimiter)
	);

	const options = { encoding: `utf8`, env: newEnv };
	// @ts-ignore
	const result = spawnSync(cmd, args, options);
	return result;
};

// 디렉토리 유효성 검사 -----------------------------------------------------------------------
// @ts-ignore
const validateDir = (list) => {
	const isArr = Array.isArray(list);
	const found = isArr ? list.find(name => fs.existsSync(path.join(process.cwd(), name))) : null;
	const result = found ? (
		logger(`info`, `유효한 디렉터리 발견: ${found}`),
		found
	) : (
		logger(`warn`, `유효한 디렉터리 없음: ${list.join(`, `)}`),
		isArr ? list[0] : null
	);
	return result;
};

// 특정파일 생성 -------------------------------------------------------------------------------
// @ts-ignore
const createFile = (tp = ``, content = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const dir = path.dirname(full);
	!fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

	const exists = fs.existsSync(full);
	const result = exists ? (
		logger(`info`, `이미 존재하는 파일: ${full}`),
		false
	) : (
		fs.writeFileSync(full, content, { encoding: `utf8` }),
		logger(`success`, `파일 생성: ${full}`),
		true
	);
	return result;
};

// 특정폴더 생성 -------------------------------------------------------------------------------
// @ts-ignore
const createDir = (tp = ``) => {
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const exists = fs.existsSync(full);
	const result = exists ? (
		logger(`info`, `이미 존재하는 폴더: ${full}`),
		false
	) : (
		fs.mkdirSync(full, { recursive: true }),
		logger(`success`, `폴더 생성: ${full}`),
		true
	);
	return result;
};

// 특정파일 삭제 ------------------------------------------------------------------------------
// @ts-ignore
const delFile = (tp = ``, ext = ``) => {
	const dir = tp ? (
		path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp)
	) : (
		process.cwd()
	);
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const isPat = ext;
	const isValidDir = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
	const files = isPat && isValidDir ? fs.readdirSync(dir) : [];
	const tgts = files.filter(name => name.includes(ext));
	const fileExists = fs.existsSync(full);

	const result = !isPat ? (
		!fileExists ? (
			logger(`warn`, `삭제할 파일 없음: ${full}`),
			false
		) : (
			fs.unlinkSync(full),
			logger(`success`, `파일 삭제: ${full}`),
			true
		)
	) : !isValidDir ? (
		logger(`warn`, `유효한 디렉터리가 아님: ${dir}`),
		false
	) : !tgts.length ? (
		logger(`warn`, `삭제할 파일 없음 (패턴: ${ext}) - 경로: ${dir}`),
		false
	) : (
		tgts.forEach(name => fs.unlinkSync(path.join(dir, name))),
		logger(`success`, `파일 삭제 (패턴: ${ext}) - 경로: ${dir}, 개수: ${tgts.length}`),
		true
	);

	return result;
};

// 특정폴더 삭제 -------------------------------------------------------------------------------
// @ts-ignore
const delDir = (tp = ``, pat = ``) => {
	const dir = tp ? (
		path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp)
	) : (
		process.cwd()
	);
	const full = path.isAbsolute(tp) ? tp : path.join(process.cwd(), tp);
	const isPat = pat;
	const isValidDir = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
	const ents = isPat && isValidDir ? fs.readdirSync(dir, { withFileTypes: true }) : [];
	const tgts = ents.filter(e => e.isDirectory() && e.name.includes(pat));
	const dirExists = fs.existsSync(full);

	const result = !isPat ? (
		!dirExists ? (
			logger(`warn`, `삭제할 폴더 없음: ${full}`),
			false
		) : (
			fs.rmSync(full, { recursive: true, force: true }),
			logger(`success`, `폴더 삭제: ${full}`),
			true
		)
	) : !isValidDir ? (
		logger(`warn`, `유효한 디렉터리가 아님: ${dir}`),
		false
	) : !tgts.length ? (
		logger(`warn`, `삭제할 폴더 없음 (패턴: ${pat}) - 경로: ${dir}`),
		false
	) : (
		tgts.forEach(dirent => fs.rmSync(path.join(dir, dirent.name), { recursive: true, force: true })),
		logger(`success`, `폴더 삭제 (패턴: ${pat}) - 경로: ${dir}, 개수: ${tgts.length}`),
		true
	);

	return result;
};

// 프로젝트 타입 검증 --------------------------------------------------------------------------
// @ts-ignore
const getProjectType = (args) => {
	const isClient = args === `client`;
	const isServer = args === `server`;

	const hasFile = (filePath = ``) => {
		const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
		return fs.existsSync(absPath);
	};

	!isClient && !isServer && (
		logger(`error`, `프로젝트 타입을 지정해주세요: --client 또는 --server`),
		process.exit(1)
	);

	const viteConfigFiles = [`vite.config.ts`, `vite.config.js`, `vite.config.mts`, `vite.config.mjs`];
	const hasVite = viteConfigFiles.some(file => hasFile(file));
	const hasNext = hasFile(`next.config.js`) || hasFile(`next.config.mjs`);
	const hasReactScripts = hasFile(path.join(`node_modules`, `react-scripts`, `bin`, `react-scripts.js`));
	const hasIndexTs = hasFile(`index.ts`);

	isClient && !hasVite && !hasNext && !hasReactScripts && (
		logger(`warn`, `클라이언트 설정 파일을 찾을 수 없습니다 (vite.config, next.config, react-scripts)`)
	);

	isServer && !hasIndexTs && (
		logger(`warn`, `서버 진입점 파일을 찾을 수 없습니다 (index.ts)`)
	);

	return {
		isClient,
		isServer,
		hasVite,
		hasNext,
		hasReactScripts,
		hasIndexTs
	};
};

// 모듈 내보내기 -------------------------------------------------------------------------------
module.exports = {
	logger,
	runCmd,
	spawnWrapper,
	validateDir,
	createFile,
	createDir,
	delFile,
	delDir,
	getProjectType
};