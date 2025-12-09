/**
 * @file modules.ts
 * @description 동적 모듈 로딩 유틸리티
 * @author Jungho
 * @since 2025-12-9
 */

import { logger } from "@exportScripts";
import _fs from "fs";
import _path from "path";

// -----------------------------------------------------------------------------------------
const _moduleCache: Map<string, any> = new Map();
let _extensionPath: string = ``;

// -----------------------------------------------------------------------------------------
export const setExtensionPath = (path: string) => {
	_extensionPath = path;
};

// -----------------------------------------------------------------------------------------
const resolveModule = (moduleResult: unknown) => (moduleResult && typeof moduleResult === `object` && `default` in moduleResult ? moduleResult.default : moduleResult);

// -----------------------------------------------------------------------------------------
const resolveModulePath = (specifier: string) => {
	const basePath = _path.join(_extensionPath, `out`, `node_modules`, specifier);

	if (!_fs.existsSync(basePath)) {
		return specifier;
	}
	const packageJsonPath = _path.join(basePath, `package.json`);

	if (_fs.existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(_fs.readFileSync(packageJsonPath, `utf8`));
			const mainFile = packageJson.main ? packageJson.main : packageJson.exports?.default ? packageJson.exports.default : `index.js`;
			return _path.join(basePath, mainFile);
		}
		catch (err) {
			return _path.join(basePath, `index.js`);
		}
	}
	if (_fs.existsSync(_path.join(basePath, `index.js`))) {
		return _path.join(basePath, `index.js`);
	}
	return basePath;
};

// -----------------------------------------------------------------------------------------
const isEsmModule = (pkgPath: string): boolean => {
	const packageJsonPath = _path.join(pkgPath, `package.json`);
	if (!_fs.existsSync(packageJsonPath)) {
		return false;
	}
	try {
		const packageJson = JSON.parse(_fs.readFileSync(packageJsonPath, `utf8`));
		if (packageJson.type === `module`) {
			return true;
		}
		const exports = packageJson.exports;
		if (exports && typeof exports === `object`) {
			const str = JSON.stringify(exports);
			const hasImport = str.includes(`"import"`) || str.includes(`"module"`);
			const hasRequire = str.includes(`"require"`) || str.includes(`"node"`);
			return hasImport && !hasRequire;
		}
		return false;
	}
	catch {
		return false;
	}
};

// -----------------------------------------------------------------------------------------
const dynamicImport = async (specifier: string) => {
	const resolvedPath = resolveModulePath(specifier);
	const basePath = _path.join(_extensionPath, `out`, `node_modules`, specifier);
	const useEsm = isEsmModule(basePath);

	// ESM 모듈은 import()만 사용
	if (useEsm) {
		try {
			const fileUrl = _path.isAbsolute(resolvedPath) ? `file:///${resolvedPath.replace(/\\/g, `/`)}` : resolvedPath;
			const moduleResult = await import(fileUrl);
			return resolveModule(moduleResult);
		}
		catch (importErr: unknown) {
			logger(`error`, `dynamicImport - ESM import failed for ${specifier}: ${(importErr as Error).message}`);
			return null;
		}
	}

	// CJS 모듈은 require() 먼저 시도
	try {
		const requiredModule = require(resolvedPath);
		return resolveModule(requiredModule);
	}
	catch (err: unknown) {
		try {
			const fileUrl = _path.isAbsolute(resolvedPath) ? `file:///${resolvedPath.replace(/\\/g, `/`)}` : resolvedPath;
			const moduleResult = await import(fileUrl);
			return resolveModule(moduleResult);
		}
		catch (importErr: unknown) {
			try {
				const fallbackModule = require(specifier);
				return resolveModule(fallbackModule);
			}
			catch (fallbackErr: unknown) {
				logger(`error`, `dynamicImport - all attempts failed for ${specifier}: ${(fallbackErr as Error).message}`);
				return null;
			}
		}
	}
};

// -----------------------------------------------------------------------------------------
export const getModuleWithCache = async (moduleName: string) => {
	if (_moduleCache.has(moduleName)) {
		return _moduleCache.get(moduleName);
	}
	const moduleResult = await dynamicImport(moduleName);
	moduleResult && _moduleCache.set(moduleName, moduleResult);

	return _moduleCache.get(moduleName) || null;
};
