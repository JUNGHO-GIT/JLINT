// server/gcloud.cjs

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const { logger } = require(`./bundle.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `gcloud.cjs`;
const winOrLinux = os.platform() === 'win32' ? `win` : `linux`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find(arg => [`--deploy`].includes(arg))?.replace(`--`, ``) || ``;

// 프로젝트 설정 -------------------------------------------------------------------------------
const CONFIG = {
	domain: `junghomun.com`,
	projectName: `JPORTFOLIO`,
	serverIp: `104.196.212.101`,
	localPort: {
		client: 3000,
		server: 4000
	},
	gcs: {
		bucket: `jungho-bucket`,
		path: `JPORTFOLIO/SERVER/build.tar.gz`
	},
	ssh: {
		win: {
			keyPath: `C:\\Users\\jungh\\.ssh\\JKEY`,
			serviceId: `junghomun00`
		},
		linux: {
			keyPath: `~/ssh/JKEY`,
			serviceId: `junghomun1234`
		}
	}
};

// env 파일 및 index 파일 수정 ---------------------------------------------------------------------
const modifyEnvAndIndex = () => {
	logger(`info`, `.env 및 index.ts 파일 수정 시작`);

	const envFile = fs.readFileSync('.env', 'utf8');
	const indexFile = fs.readFileSync('index.ts', 'utf8');

	const linesEnv = envFile.split(/\r?\n/);
	const linesIndex = indexFile.split(/\r?\n/);

	const updatedEnv = linesEnv.map(line => (
		line.startsWith('CLIENT_URL=') ? (
			`CLIENT_URL=https://www.${CONFIG.domain}/${CONFIG.projectName}`
		) : line.startsWith('GOOGLE_CALLBACK_URL=') ? (
			`GOOGLE_CALLBACK_URL=https://www.${CONFIG.domain}/${CONFIG.projectName}/api/auth/google/callback`
		) : (
			line
		)
	));

	const updatedIndex = linesIndex.map(line => (
		line.startsWith(`// const db = process.env.DB_NAME`) ? (
			`const db = process.env.DB_NAME`
		) : line.startsWith(`const db = process.env.DB_TEST`) ? (
			`// const db = process.env.DB_TEST`
		) : (
			line
		)
	));

	const newEnvFile = updatedEnv.join(os.EOL);
	const newIndexFile = updatedIndex.join(os.EOL);

	fs.writeFileSync('.env', newEnvFile);
	fs.writeFileSync('index.ts', newIndexFile);

	logger(`success`, `.env 및 index.ts 파일 수정 완료`);
};

// 원격 서버에서 스크립트 실행 ---------------------------------------------------------------------
const runRemoteScript = (winOrLinux=``) => {
	logger(`info`, `원격 서버 스크립트 실행 시작`);

	const keyPath = winOrLinux === `win` ? (
		CONFIG.ssh.win.keyPath
	) : (
		CONFIG.ssh.linux.keyPath
	);
	const serviceId = winOrLinux === `win` ? (
		CONFIG.ssh.win.serviceId
	) : (
		CONFIG.ssh.linux.serviceId
	);

	const ipAddr = CONFIG.serverIp;
	const serverPath = `/var/www/${CONFIG.domain}/${CONFIG.projectName}/server`;

	const cmdCd = `cd ${serverPath}`;
	const cmdGitFetch = `sudo git fetch --all`;
	const cmdGitReset = `sudo git reset --hard origin/master`;
	const cmdRmClient = `sudo rm -rf client`;
	const cmdCh = `sudo chmod -R 755 ${serverPath}`;
	const cmdStop = `if pm2 describe ${CONFIG.projectName} >/dev/null 2>&1; then sudo pm2 stop ${CONFIG.projectName} && pm2 save; fi`;
	const cmdNpm = `sudo npm install`;
	const cmdStart = `sudo pm2 start ecosystem.config.cjs --env production && pm2 save`;
	const cmdSave = `sleep 5 && sudo pm2 save --force`;

	const sshCommand = winOrLinux === `win` ? (
		`powershell -Command "ssh -i ${keyPath} ${serviceId}@${ipAddr} '${cmdCd} && ${cmdGitFetch} && ${cmdGitReset} && ${cmdRmClient} && ${cmdCh} && ${cmdStop} && ${cmdNpm} && ${cmdStart} && ${cmdSave}'"`
	) : (
		`ssh -i ${keyPath} ${serviceId}@${ipAddr} '${cmdCd} && ${cmdGitFetch} && ${cmdGitReset} && ${cmdRmClient} && ${cmdCh} && ${cmdStop} && ${cmdNpm} && ${cmdStart} && ${cmdSave}'`
	);

	logger(`info`, `SSH 명령 실행 중...`);
	execSync(sshCommand, { stdio: 'inherit' });
	logger(`success`, `원격 서버 스크립트 실행 완료`);
};

// env 파일 및 index 파일 복원 --------------------------------------------------------------------
const restoreEnvAndIndex = () => {
	logger(`info`, `.env 및 index.ts 파일 복원 시작`);

	const envFile = fs.readFileSync('.env', 'utf8');
	const indexFile = fs.readFileSync('index.ts', 'utf8');

	const linesEnv = envFile.split(/\r?\n/);
	const linesIndex = indexFile.split(/\r?\n/);

	const updatedEnv = linesEnv.map(line => (
		line.startsWith('CLIENT_URL=') ? (
			`CLIENT_URL=http://localhost:${CONFIG.localPort.client}/${CONFIG.projectName}`
		) : line.startsWith('GOOGLE_CALLBACK_URL=') ? (
			`GOOGLE_CALLBACK_URL=http://localhost:${CONFIG.localPort.server}/${CONFIG.projectName}/api/auth/google/callback`
		) : (
			line
		)
	));

	const updatedIndex = linesIndex.map(line => (
		line.startsWith(`const db = process.env.DB_NAME`) ? (
			`// const db = process.env.DB_NAME`
		) : line.startsWith(`// const db = process.env.DB_TEST`) ? (
			`const db = process.env.DB_TEST`
		) : (
			line
		)
	));

	const newEnvFile = updatedEnv.join(os.EOL);
	const newIndexFile = updatedIndex.join(os.EOL);

	fs.writeFileSync('.env', newEnvFile);
	fs.writeFileSync('index.ts', newIndexFile);

	logger(`success`, `.env 및 index.ts 파일 복원 완료`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 : ${args1 || 'none'}`);
	logger(`info`, `전달된 인자 2 : ${args2 || 'none'}`);
	logger(`info`, `운영체제 : ${winOrLinux}`);

	try {
		args2.includes(`--deploy`) && (() => {
			modifyEnvAndIndex();
			runRemoteScript(winOrLinux);
			restoreEnvAndIndex();
			logger(`success`, `GCloud 배포 프로세스 완료`);
		})();
		process.exit(0);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}
})();