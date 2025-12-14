/**
 * @file gcloud.mjs
 * @description GCP에 클라이언트 빌드 업로드 및 서버 배포 스크립트 (ESM)
 * @author Jungho
 * @since 2025-12-03
 */

import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { logger, getPlatform, execCommand, fileExists } from "../lib/utils.mjs";
import { env } from "../lib/env.mjs";
import { settings } from "../lib/settings.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const platform = getPlatform();
const args1 = argv.find((arg) => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || `bun`;
const args2 = argv.find((arg) => [
	`--server`,
	`--client`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 공통 설정 ------------------------------------------------------------------------------
const getKeyPath = (pf = ``) => (pf === `win` ? env.ssh.win.keyPath : env.ssh.linux.keyPath);
const getServiceId = (pf = ``) => (pf === `win` ? env.ssh.win.serviceId : env.ssh.linux.serviceId);
const getGcpPath = () => `gs://${env.gcp.bucket}/${env.gcp.path}`;
const getBasePath = () => `/var/www/${env.domain}/${env.projectName}`;

// 3. SSH 명령 실행 --------------------------------------------------------------------------
const runSshCommand = (pf = ``, commands = ``) => {
	const keyPath = getKeyPath(pf);
	const serviceId = getServiceId(pf);
	const ipAddr = env.serverIp;

	!keyPath && (() => {
		throw new Error(`SSH 키 경로가 설정되지 않았습니다 (platform: ${pf})`);
	})();
	!serviceId && (() => {
		throw new Error(`서비스 ID가 설정되지 않았습니다 (platform: ${pf})`);
	})();
	!ipAddr && (() => {
		throw new Error(`서버 IP가 설정되지 않았습니다`);
	})();

	const sshCommand = pf === `win` ? `powershell -Command "ssh -i ${keyPath} ${serviceId}@${ipAddr} '${commands}'"` : `ssh -i ${keyPath} ${serviceId}@${ipAddr} '${commands}'`;

	logger(`info`, `SSH 명령 실행 중...`);
	execSync(sshCommand, { stdio: `inherit` });
	logger(`info`, `SSH 명령 실행 완료`);
};

// 4-1. client 배포 (빌드) -----------------------------------------------------------------------
const buildProject = () => {
	execCommand(`${args1} run build`, `프로젝트 빌드`);
};

// 4-2. client 배포 (압축 및 업로드) -----------------------------------------------------------
const compressBuild = () => {
	const buildDir = path.join(process.cwd(), `build`);

	!fileExists(buildDir) && (() => {
		throw new Error(`build 폴더가 존재하지 않습니다: ${buildDir}`);
	})();

	execCommand(`tar -zcvf build.tar.gz build`, `build 폴더 압축`);
};

// 4-3. client 배포 (GCP 업로드) -----------------------------------------------------------
const uploadToGCP = () => {
	const gcpPath = getGcpPath();
	const tarFile = path.join(process.cwd(), `build.tar.gz`);

	!fileExists(tarFile) && (() => {
		throw new Error(`build.tar.gz 파일이 존재하지 않습니다`);
	})();

	execCommand(`gcloud storage cp build.tar.gz ${gcpPath}`, `GCP 업로드`);
	logger(`info`, `업로드 경로: ${gcpPath}`);
};

// 4-4. client 배포 (임시 파일 삭제) -----------------------------------------------------------
const deleteBuildTar = (pf = ``) => {
	const tarFile = path.join(process.cwd(), `build.tar.gz`);

	!fileExists(tarFile) ? logger(`warn`, `build.tar.gz 파일이 존재하지 않음 - 삭제 건너뜀`) : (() => {
		const cmd = pf === `win` ? `del build.tar.gz` : `rm -rf build.tar.gz`;
		execCommand(cmd, `build.tar.gz 삭제`);
	})();
};

// 4-5. client 배포 (원격 서버 스크립트 실행) -------------------------------------------------
const runClientRemoteScript = (pf = ``) => {
	logger(`info`, `원격 서버 클라이언트 배포 스크립트 실행 시작`);

	const basePath = getBasePath();
	const clientPath = `${basePath}/client`;
	const gcpPath = getGcpPath();

	const commands = [
		`cd ${basePath}`,
		`sudo rm -rf client`,
		`sudo mkdir -p client`,
		`cd ${clientPath}`,
		`sudo gcloud storage cp ${gcpPath} .`,
		`sudo tar -zvxf build.tar.gz --strip-components=1`,
		`sudo rm build.tar.gz`,
		`sudo chmod -R 755 ${clientPath}`,
		`sudo systemctl restart nginx`,
	].join(` && `);

	runSshCommand(pf, commands);
	logger(`info`, `원격 서버 클라이언트 배포 스크립트 실행 완료`);
};

// 5-1. server 배포 (git push) ---------------------------------------------------------------
const runGitPush = () => {
	const gitScript = path.join(__dirname, `git.mjs`);

	!fileExists(gitScript) && (() => {
		throw new Error(`git.mjs 스크립트가 존재하지 않습니다: ${gitScript}`);
	})();

	execCommand(`${args1} ${gitScript} --${args1} --push --n`, `git push 명령어 실행`);
};

// 5-2. server 배포 (원격 서버 스크립트 실행) -------------------------------------------------
const runServerRemoteScript = (pf = ``) => {
	logger(`info`, `원격 서버 배포 스크립트 실행 시작`);

	const basePath = getBasePath();
	const serverPath = `${basePath}/server`;
	const resetBranch = settings.git.deploy.resetBranch;

	!resetBranch && (() => {
		throw new Error(`배포 브랜치가 설정되지 않았습니다 (settings.git.deploy.resetBranch)`);
	})();

	const commands = [
		`cd ${serverPath}`,
		`sudo git fetch --all`,
		`sudo git reset --hard ${resetBranch}`,
		`sudo rm -rf client`,
		`sudo chmod -R 755 ${serverPath}`,
		`if pm2 describe ${env.projectName} >/dev/null 2>&1; then sudo pm2 stop ${env.projectName} && pm2 save; fi`,
		`sudo npm install`,
		`sudo pm2 start ecosystem.config.cjs --env production && pm2 save`,
		`sleep 5 && sudo pm2 save --force`,
	].join(` && `);

	runSshCommand(pf, commands);
	logger(`info`, `원격 서버 배포 스크립트 실행 완료`);
};

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
		// logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `client` && (() => {
			buildProject();
			compressBuild();
			uploadToGCP();
			deleteBuildTar(platform);
			runClientRemoteScript(platform);
		})();
		args2 === `server` && (() => {
			runGitPush();
			runServerRemoteScript(platform);
		})();
		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
