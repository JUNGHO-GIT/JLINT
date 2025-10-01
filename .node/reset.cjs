// reset.cjs

const { spawnSync } = require("child_process");
const { rmSync, existsSync } = require("fs");
const { join } = require("path");

// ---------------------------------------------------------------------------------------------
// 상수 정의
const PLATFORM_WIN32 = "win32";
const SLEEP_MILLISECONDS = 200;
const DELETE_TARGETS = [
	"node_modules",
	"package-lock.json",
	"bun.lock",
	"yarn.lock",
	"pnpm-lock.yaml"
];
const COMMANDS = {
	POWERSHELL_EXE: "powershell.exe",
	POWERSHELL: "powershell",
	PWSH: "pwsh",
	SH: "sh",
	BUN: "bun",
	NPM: "npm",
	PNPM: "pnpm",
	YARN: "yarn",
	COREPACK: "corepack",
	NPX: "npx"
};

// ---------------------------------------------------------------------------------------------
const fnRun = (cmd, args, opts) => {
	console.log(`[실행] ${cmd} ${args.join(" ")}`);
	const result = spawnSync(cmd, args, {
		stdio: "inherit",
		shell: process.platform === PLATFORM_WIN32,
		...opts
	});

	if (result.error) {
		if (result.error.code === "ENOENT") {
			console.error(`[에러] ${cmd} 명령을 찾을 수 없음 (ENOENT)`);
			throw new Error(`Command not found: ${cmd}`);
		}
		console.error(`[에러] ${cmd} 실행 오류: ${result.error.message}`);
		throw new Error(`${cmd} failed: ${result.error.message}`);
	}

	if (typeof result.status === "number" && result.status !== 0) {
		console.error(`[에러] ${cmd} 종료 코드: ${result.status}`);
		throw new Error(`${cmd} exited with code ${result.status}`);
	}

	console.log(`[완료] ${cmd} 실행 성공`);
};

// ---------------------------------------------------------------------------------------------
const fnHas = (cmd) => {
	try {
		const r = spawnSync(cmd, ["--version"], {
			stdio: "ignore",
			shell: process.platform === PLATFORM_WIN32
		});
		return typeof r.status === "number" && r.status === 0;
	}
	catch {
		return false;
	}
};

const fnHasPwsh = (cmd) => {
	try {
		const args = cmd === COMMANDS.PWSH
			? ["-NoLogo", "-NoProfile", "-Command", "$PSVersionTable.PSVersion.Major"]
			: ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.Major"];
		const r = spawnSync(cmd, args, { stdio: "ignore", shell: false });
		return typeof r.status === "number" && r.status === 0;
	}
	catch {
		return false;
	}
};

const getPowerShellCmd = () => {
	return fnHasPwsh(COMMANDS.POWERSHELL_EXE) ? COMMANDS.POWERSHELL_EXE
		: fnHasPwsh(COMMANDS.POWERSHELL) ? COMMANDS.POWERSHELL
		: fnHasPwsh(COMMANDS.PWSH) ? COMMANDS.PWSH
		: null;
};

// ---------------------------------------------------------------------------------------------
const fnSleep200ms = () => {
	console.log(`[대기] ${SLEEP_MILLISECONDS}ms 대기 시작`);
	if (process.platform === PLATFORM_WIN32) {
		const ps = getPowerShellCmd();
		if (ps) {
			try {
				fnRun(ps, ["-NoProfile", "-Command", `Start-Sleep -Milliseconds ${SLEEP_MILLISECONDS}`]);
				console.log(`[완료] ${SLEEP_MILLISECONDS}ms 대기 종료`);
				return;
			}
			catch {
				console.log(`[경고] PowerShell 대기 실패, JS 대기로 대체`);
			}
		}
		else {
			console.log(`[경고] PowerShell 미탐지, JS 대기로 대체`);
		}
	}
	else {
		try {
			fnRun(COMMANDS.SH, ["-lc", `sleep ${SLEEP_MILLISECONDS / 1000}`]);
			console.log(`[완료] ${SLEEP_MILLISECONDS}ms 대기 종료`);
			return;
		}
		catch {
			console.log(`[경고] 쉘 대기 실패, JS 대기로 대체`);
		}
	}
	const start = Date.now();
	while (Date.now() - start < SLEEP_MILLISECONDS) {}
	console.log(`[완료] ${SLEEP_MILLISECONDS}ms 대기 종료`);
};

// ---------------------------------------------------------------------------------------------
const SHOULD_KILL_NODE = process.env.RESET_KILL_NODE === "1";

const fnStopOtherNodeOnWindows = () => {
	console.log(`[플랫폼] 현재 플랫폼: ${process.platform}`);
	if (process.platform !== PLATFORM_WIN32) {
		console.log(`[건너뜀] Windows 아님`);
		return;
	}
	if (!SHOULD_KILL_NODE) {
		console.log(`[건너뜀] RESET_KILL_NODE!=1`);
		return;
	}

	const ps = getPowerShellCmd();
	if (!ps) {
		console.log(`[건너뜀] PowerShell 미탐지`);
		return;
	}

	const selfPid = process.pid;
	console.log(`[실행] 다른 Node 프로세스 종료 시도 (self PID=${selfPid})`);
	const script = `$self=${selfPid}; ` +
		`$p=Get-Process node -ErrorAction SilentlyContinue; ` +
		`if($p){ $p | Where-Object { $_.Id -ne $self } | ` +
		`Stop-Process -Force -ErrorAction SilentlyContinue }`;

	try {
		spawnSync(ps, ["-NoProfile", "-Command", script], { stdio: "ignore", shell: false });
		console.log(`[완료] Node 프로세스 종료 명령 실행 완료`);
	}
	catch {
		console.log(`[경고] Node 프로세스 종료 실패, 계속 진행`);
	}
};

// ---------------------------------------------------------------------------------------------
const fnRemoveIfExists = (p) => {
	console.log(`[삭제 시도] ${p}`);
	try {
		const exists = existsSync(p);
		exists ? (
			console.log(`[삭제 진행] ${p} 존재함 - 삭제 시작`),
			rmSync(p, { recursive: true, force: true }),
			console.log(`[삭제 완료] ${p}`)
		) : console.log(`[건너뜀] ${p} 존재하지 않음`);
	}
	catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error(`[remove] ${p} 실패: ${msg}`);
		throw e;
	}
};

// ---------------------------------------------------------------------------------------------
const ensurePnpmAndInstall = () => {
	if (fnHas(COMMANDS.PNPM)) {
		fnRun(COMMANDS.PNPM, ["install"]);
		return;
	}

	if (fnHas(COMMANDS.COREPACK)) {
		try {
			console.log(`[시도] corepack enable`);
			fnRun(COMMANDS.COREPACK, ["enable"]);
		}
		catch {
			console.log(`[경고] corepack enable 실패, 계속 진행`);
		}
		try {
			console.log(`[시도] corepack prepare pnpm@latest --activate`);
			fnRun(COMMANDS.COREPACK, ["prepare", "pnpm@latest", "--activate"]);
			if (fnHas(COMMANDS.PNPM)) {
				fnRun(COMMANDS.PNPM, ["install"]);
				return;
			}
		}
		catch {
			console.log(`[경고] corepack prepare 실패, 다음 단계로 진행`);
		}
	}

	fnHas(COMMANDS.NPX) ? fnRun(COMMANDS.NPX, ["-y", "pnpm", "install"])
		: (() => { throw new Error("pnpm 사용 불가: pnpm/corepack/npx 모두 실행 불가"); })();
};

// ---------------------------------------------------------------------------------------------
const fnInstall = (cliTool) => {
	console.log(`[설치] 패키지 매니저 옵션: ${cliTool || "auto-detect"}`);

	const installOrThrow = (primaryCmd, primaryArgs) => {
		!fnHas(primaryCmd) && (() => { throw new Error(`${primaryCmd} 미설치 또는 실행 불가`); })();
		fnRun(primaryCmd, primaryArgs);
	};

	switch (cliTool) {
		case "--bun":
			console.log(`[설치] Bun 사용하여 설치 시작`);
			installOrThrow(COMMANDS.BUN, ["install"]);
			break;

		case "--pnpm":
			console.log(`[설치] PNPM 사용하여 설치 시작`);
			ensurePnpmAndInstall();
			break;

		case "--yarn":
			console.log(`[설치] Yarn 사용하여 설치 시작`);
			installOrThrow(COMMANDS.YARN, ["install"]);
			break;

		case "--npm":
			console.log(`[설치] NPM 사용하여 설치 시작`);
			fnRun(COMMANDS.NPM, ["install"]);
			break;

		default:
			console.log(`[자동 감지] 사용 가능한 패키지 매니저 확인 중`);
			fnHas(COMMANDS.BUN) ? (
				console.log(`[자동 선택] Bun 사용`),
				fnRun(COMMANDS.BUN, ["install"])
			) : fnHas(COMMANDS.PNPM) ? (
				console.log(`[자동 선택] PNPM 사용`),
				fnRun(COMMANDS.PNPM, ["install"])
			) : fnHas(COMMANDS.YARN) ? (
				console.log(`[자동 선택] Yarn 사용`),
				fnRun(COMMANDS.YARN, ["install"])
			) : (
				console.log(`[자동 선택] NPM 사용`),
				fnRun(COMMANDS.NPM, ["install"])
			);
			break;
	}
};

// ---------------------------------------------------------------------------------------------
const fnReset = async (cliTool) => {
	console.log(`[시작] 프로젝트 리셋 시작 (작업 디렉토리: ${process.cwd()})`);

	fnStopOtherNodeOnWindows();
	fnSleep200ms();

	console.log(`[삭제] 타겟 파일/폴더 삭제 시작 (총 ${DELETE_TARGETS.length}개)`);
	DELETE_TARGETS.forEach((target, index) => {
		console.log(`[진행] ${index + 1}/${DELETE_TARGETS.length} - ${target}`);
		fnRemoveIfExists(join(process.cwd(), target));
	});
	console.log(`[완료] 모든 타겟 삭제 완료`);

	fnInstall(cliTool);
	console.log(`[완료] 프로젝트 리셋 완료`);
};

// ---------------------------------------------------------------------------------------------
require.main === module && (
	(() => {
		const arg = process.argv[2] || "";
		console.log(`[시작] reset.cjs 스크립트 실행 (인자: ${arg || "none"})`);
		fnReset(arg).catch((err) => {
			console.error("reset 실패:", err && err.message ? err.message : err);
			process.exit(1);
		});
	})()
);

module.exports = { reset: fnReset };
