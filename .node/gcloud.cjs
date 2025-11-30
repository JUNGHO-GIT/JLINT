// gcloud.cjs

const os = require('os');
const { execSync } = require('child_process');
const { logger } = require(`./utils.cjs`);
const { CONFIG } = require(`./env.cjs`);

// 인자 파싱 ------------------------------------------------------------------------------------
const TITLE = `gcloud.cjs`;
const winOrLinux = os.platform() === `win32` ? `win` : `linux`;
const argv = process.argv.slice(2);
const args1 = argv.find(arg => [`--npm`, `--pnpm`, `--yarn`, `--bun`].includes(arg))?.replace(`--`, ``) || `bun`;
const args2 = argv.find(arg => [`--server`, `--client`].includes(arg))?.replace(`--`, ``) || ``;

// 공통 함수 ------------------------------------------------------------------------------------
const getKeyPath = (platform=``) => platform === `win` ? CONFIG.ssh.win.keyPath : CONFIG.ssh.linux.keyPath;
const getServiceId = (platform=``) => platform === `win` ? CONFIG.ssh.win.serviceId : CONFIG.ssh.linux.serviceId;
const runSshCommand = (platform=``, commands=``) => {
	const keyPath = getKeyPath(platform);
	const serviceId = getServiceId(platform);
	const ipAddr = CONFIG.serverIp;

	const sshCommand = platform === `win` ? (
		`powershell -Command "ssh -i ${keyPath} ${serviceId}@${ipAddr} '${commands}'"`
	) : (
		`ssh -i ${keyPath} ${serviceId}@${ipAddr} '${commands}'`
	);

	logger(`info`, `SSH 명령 실행 중...`);
	execSync(sshCommand, { "stdio": `inherit` });
};

// Client 배포 함수 -----------------------------------------------------------------------------
const buildProject = () => {
	logger(`info`, `프로젝트 빌드 시작`);
	execSync(`${args1} run build`, { "stdio": `inherit` });
	logger(`info`, `프로젝트 빌드 완료`);
};

const compressBuild = () => {
	logger(`info`, `build 폴더 압축 시작`);
	execSync(`tar -zcvf build.tar.gz build`, { "stdio": `inherit` });
	logger(`info`, `build 폴더 압축 완료`);
};

const uploadToGCP = () => {
	logger(`info`, `GCP 업로드 시작`);
	const gcpPath = `gs://${CONFIG.gcp.bucket}/${CONFIG.gcp.path}`;
	execSync(`gcloud storage cp build.tar.gz ${gcpPath}`, { "stdio": `inherit` });
	logger(`info`, `GCP 업로드 완료: ${gcpPath}`);
};

const deleteBuildTar = (platform=``) => {
	logger(`info`, `build.tar.gz 삭제 시작`);
	const command = platform === `win` ? `del build.tar.gz` : `rm -rf build.tar.gz`;
	execSync(command, { "stdio": `inherit` });
	logger(`info`, `build.tar.gz 삭제 완료`);
};

const runClientRemoteScript = (platform=``) => {
	logger(`info`, `원격 서버 클라이언트 배포 스크립트 실행 시작`);

	const basePath = `/var/www/${CONFIG.domain}/${CONFIG.projectName}`;
	const clientPath = `${basePath}/client`;
	const gcpPath = `gs://${CONFIG.gcp.bucket}/${CONFIG.gcp.path}`;

	const commands = [
		`cd ${basePath}`,
		`sudo rm -rf client`,
		`sudo mkdir -p client`,
		`cd ${clientPath}`,
		`sudo gcloud storage cp ${gcpPath} .`,
		`sudo tar -zvxf build.tar.gz --strip-components=1`,
		`sudo rm build.tar.gz`,
		`sudo chmod -R 755 ${clientPath}`,
		`sudo systemctl restart nginx`
	].join(` && `);

	runSshCommand(platform, commands);
	logger(`info`, `원격 서버 클라이언트 배포 스크립트 실행 완료`);
};

// Server 배포 함수 -----------------------------------------------------------------------------
const runGitPush = () => {
	logger(`info`, `git push 명령어 실행 시작`);
	execSync(`${args1} .node/git.cjs --${args1} --push`, { "stdio": `inherit` });
	logger(`info`, `git push 명령어 실행 완료`);
};

const runServerRemoteScript = (platform=``) => {
	logger(`info`, `원격 서버 서버 배포 스크립트 실행 시작`);

	const serverPath = `/var/www/${CONFIG.domain}/${CONFIG.projectName}/server`;

	const commands = [
		`cd ${serverPath}`,
		`sudo git fetch --all`,
		`sudo git reset --hard ${CONFIG.git.deploy.resetBranch}`,
		`sudo rm -rf client`,
		`sudo chmod -R 755 ${serverPath}`,
		`if pm2 describe ${CONFIG.projectName} >/dev/null 2>&1; then sudo pm2 stop ${CONFIG.projectName} && pm2 save; fi`,
		`sudo npm install`,
		`sudo pm2 start ecosystem.config.cjs --env production && pm2 save`,
		`sleep 5 && sudo pm2 save --force`
	].join(` && `);

	runSshCommand(platform, commands);
	logger(`info`, `원격 서버 서버 배포 스크립트 실행 완료`);
};

// 실행 ---------------------------------------------------------------------------------------
(() => {
	logger(`info`, `스크립트 실행: ${TITLE}`);
	logger(`info`, `전달된 인자 1 (패키지 매니저): ${args1}`);
	logger(`info`, `전달된 인자 2 (배포 대상): ${args2 || `none`}`);
	logger(`info`, `운영체제: ${winOrLinux}`);

	const isValidArgs = args2 === `client` || args2 === `server`;
	!isValidArgs ? (
		logger(`error`, `배포 대상을 지정해주세요. (--server 또는 --client)`),
		process.exit(1)
	) : null;

	try {
		args2 === `client` && (() => {
			logger(`info`, `클라이언트 배포 프로세스 시작`);
			buildProject();
			compressBuild();
			uploadToGCP();
			deleteBuildTar(winOrLinux);
			runClientRemoteScript(winOrLinux);
			logger(`info`, `클라이언트 배포 프로세스 완료`);
		})();
		args2 === `server` && (() => {
			logger(`info`, `서버 배포 프로세스 시작`);
			runGitPush();
			runServerRemoteScript(winOrLinux);
			logger(`info`, `서버 배포 프로세스 완료`);
		})();
		logger(`info`, `전체 배포 프로세스 완료`);
		process.exit(0);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${msg}`);
		process.exit(1);
	}
})();