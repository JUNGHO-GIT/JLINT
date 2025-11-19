// bundle.cjs

const fs = require(`fs`);
const path = require(`path`);
const { spawnSync } = require(`child_process`);

// 로깅 -----------------------------------------------------------------------------------
// @ts-ignore
const logger = (type = ``, message = ``) => {
	const format = (text = ``) => text.trim().replace(/^\s+/gm, ``);
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

// 모듈 내보내기 -------------------------------------------------------------------------------
module.exports = {
	logger,
	runCmd,
	spawnWrapper,
	validateDir,
	createFile,
	createDir,
	delFile,
	delDir
};