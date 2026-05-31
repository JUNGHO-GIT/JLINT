/**
 * @file modules.ts
 * @description 동적 모듈 로딩 유틸리티
 * @author Jungho
 * @since 2025-12-9
 */

import _fs from "node:fs";
import _path from "node:path";
import { pathToFileURL as pthTFlUrl } from "node:url";
import { logger } from "@exportScripts";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const _moduleCache: Map<string, unknown> = new Map();
let _extPth: string = ``;

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const stExtPth = (path: string): void => {
	_extPth = path;
};

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const hsDefExpr = (
	moduleResult: unknown,
): moduleResult is { default: unknown } => (
	Boolean(moduleResult && typeof moduleResult === `object` && `default` in moduleResult)
);

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const rslvMod = (moduleResult: unknown): unknown => {
	let rslvMod2 = moduleResult;

	if (hsDefExpr(moduleResult)) {
		rslvMod2 = moduleResult.default;
	}

	return rslvMod2;
};

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const rslvModPth = (specifier: string) => {
	const basePath = _path.join(_extPth, `out`, `node_modules`, specifier);

	if (!_fs.existsSync(basePath)) {
		return specifier;
	}
	const pckgJsnPth = _path.join(basePath, `package.json`);

	if (_fs.existsSync(pckgJsnPth)) {
		try {
			const packageJson = JSON.parse(
				_fs.readFileSync(pckgJsnPth, `utf8`),
			) as {
				main?: string;
				exports?: {
					default?: string;
				};
			};
			const mainFile = packageJson.main
				? packageJson.main
				: packageJson.exports?.default
					? packageJson.exports.default
					: `index.js`;
			return _path.join(basePath, mainFile);
		}
		catch {
			return _path.join(basePath, `index.js`);
		}
	}
	if (_fs.existsSync(_path.join(basePath, `index.js`))) {
		return _path.join(basePath, `index.js`);
	}
	return basePath;
};

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const isEsmModule = (pkgPath: string): boolean => {
	const pckgJsnPth = _path.join(pkgPath, `package.json`);
	if (!_fs.existsSync(pckgJsnPth)) {
		return false;
	}
	try {
		const packageJson = JSON.parse(_fs.readFileSync(pckgJsnPth, `utf8`)) as {
			type?: string;
			exports?: unknown;
		};
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

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
const dynmImpr = async (specifier: string): Promise<unknown | null> => {
	const resolvedPath = rslvModPth(specifier);
	const basePath = _path.join(_extPth, `out`, `node_modules`, specifier);
	const useEsm = isEsmModule(basePath);

	// ESM 모듈은 import()만 사용
	if (useEsm) {
		try {
			const fileUrl = _path.isAbsolute(resolvedPath)
				? pthTFlUrl(resolvedPath).href
				: resolvedPath;
			const moduleResult = await import(fileUrl);
			return rslvMod(moduleResult);
		}
		catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			logger(
				`error`,
				`dynamicImport - ESM import failed for ${specifier}: ${message}`,
			);
			return null;
		}
	}
	// CJS 모듈은 require() 먼저 시도
	try {
		const rqrdMod = require(resolvedPath);
		return rslvMod(rqrdMod);
	}
	catch {
		try {
			const fileUrl = _path.isAbsolute(resolvedPath)
				? pthTFlUrl(resolvedPath).href
				: resolvedPath;
			const moduleResult = await import(fileUrl);
			return rslvMod(moduleResult);
		}
		catch {
			try {
				const fbMod = require(specifier);
				return rslvMod(fbMod);
			}
			catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);
				logger(
					`error`,
					`dynamicImport - all attempts failed for ${specifier}: ${message}`,
				);
				return null;
			}
		}
	}
};

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const gtModWthCch = async <T = unknown>(
	moduleName: string,
): Promise<T | null> => {
	if (!_moduleCache.has(moduleName)) {
		const moduleResult = await dynmImpr(moduleName);
		moduleResult && _moduleCache.set(moduleName, moduleResult);
	}

	const cachedModule = _moduleCache.get(moduleName) ?? null;
	return cachedModule as T | null;
};
