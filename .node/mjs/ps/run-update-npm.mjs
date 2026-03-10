/**
 * @file run-update-npm.mjs
 * @description NPM 패키지 일괄 업데이트 (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const rootPath = envPaths.workspaceNode;
const stack = [];

// 2. 유틸 함수 -------------------------------------------------------------------------------

const initializeStack = () => {
  stack.push(rootPath);
};

const getPackageManagerFromReset = (pkgPath) => {
  try {
    const pkgContent = JSON.parse(fs.readFileSync(pkgPath, `utf8`));
    const resetScript = pkgContent?.scripts?.reset ?? ``;
    const match = resetScript.match(/--(\w+)/);
    if (match) {
      return match[1];
    }
  }
  catch {
    ui.printText(`Yellow`, `- Warning: unable to parse package.json for reset argument`);
  }
  return `pnpm`;
};

const updatePackageJson = (pm = `pnpm`) => {
  if (pm === `npm`) {
    execSync(`npx npm-check-updates -u`, { stdio: `inherit` });
  }
  else {
    execSync(`${pm} dlx npm-check-updates -u`, { stdio: `inherit` });
  }
};

const installDependencies = (pm = `pnpm`) => {
  const env = { ...process.env, CI: `true` };
  let installed = false;

  try {
    execSync(`${pm} install`, { stdio: `pipe`, env });
    installed = true;
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printText(`Yellow`, `- ${pm} install failed or blocked by prompt: ${errMsg}`);
  }

  if (!installed) {
    ui.printText(`Yellow`, `- Retrying with forced 'Y' to stdin...`);
    try {
      execSync(`echo Y | ${pm} install`, { stdio: `pipe`, env });
    }
    catch {
      // ignore retry failure
    }
  }
};

const runResetScript = (pm = `pnpm`) => {
  ui.printText(`Cyan`, `- Running reset script...`);
  execSync(`${pm} run reset`, { stdio: `inherit` });
};

const addChildDirectories = (dirFullName) => {
  try {
    const children = fs.readdirSync(dirFullName, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== `node_modules` && d.name !== `client`);

    for (const child of children) {
      stack.push(path.join(dirFullName, child.name));
    }
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printText(`Yellow`, `- Warning: unable to enumerate children of ${dirFullName}: ${errMsg}`);
  }
};

// 3. NPM 업데이트 실행 ----------------------------------------------------------------------

const run1 = () => {
  ui.printLine(`Yellow`);
  initializeStack();
};

const run2 = () => {
  while (stack.length > 0) {
    const dir = stack.pop();

    if (!dir || !fs.existsSync(dir)) {
      continue;
    }

    const pkg = path.join(dir, `package.json`);
    if (fs.existsSync(pkg)) {
      const pm = getPackageManagerFromReset(pkg);

      ui.printLine(`Cyan`);
      ui.printText(`Cyan`, `▶ Processing directory: ${dir}`);
      ui.printText(`Cyan`, `▶ Package Manager: [${pm}]`);

      const prevCwd = process.cwd();
      process.chdir(dir);

      try {
        updatePackageJson(pm);
        installDependencies(pm);
        runResetScript(pm);
        ui.printText(`Green`, `✓ Successfully updated & reset in ${dir}`);

        // 클라이언트 폴더가 있는지 확인하고 처리
        const clientPath = path.join(dir, `client`);
        const clientPkg = path.join(clientPath, `package.json`);
        if (fs.existsSync(clientPkg)) {
          const clientPm = getPackageManagerFromReset(clientPkg);
          ui.printText(`Cyan`, `- Found client folder, processing...`);
          ui.printText(`Cyan`, `- Client Package Manager: [${clientPm}]`);

          process.chdir(clientPath);
          try {
            updatePackageJson(clientPm);
            installDependencies(clientPm);
            runResetScript(clientPm);
            ui.printText(`Green`, `✓ Successfully updated & reset in client folder`);
          }
          catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            ui.printText(`Red`, `! Error in client folder: ${errMsg}`);
          }
          finally {
            process.chdir(dir);
          }
        }

        ui.printEmpty();
      }
      catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        ui.printText(`Red`, `! Error in ${dir}: ${errMsg}`);
      }
      finally {
        process.chdir(prevCwd);
      }
    }

    addChildDirectories(dir);
  }
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  run1();
  run2();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);
