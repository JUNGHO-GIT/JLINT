// assets/scripts/modules.ts

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
const resolveModule = (moduleResult: any) => moduleResult && typeof moduleResult === `object` && `default` in moduleResult ? (
	moduleResult.default
) : (
	moduleResult
);

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
			const mainFile = packageJson.main ? (
				packageJson.main
			) : packageJson.exports?.default ? (
				packageJson.exports.default
			) : (
				`index.js`
			);
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
const dynamicImport = async (specifier: string) => {
	const resolvedPath = resolveModulePath(specifier);

	try {
		const requiredModule = require(resolvedPath);
		return resolveModule(requiredModule);
	}
	catch (err: any) {
		try {
			const fileUrl = _path.isAbsolute(resolvedPath) ? (
				`file:///${resolvedPath.replace(/\\/g, `/`)}`
			) : (
				resolvedPath
			);
			const moduleResult = await import(fileUrl);
			return resolveModule(moduleResult);
		}
		catch (importErr: any) {
			try {
				const fallbackModule = require(specifier);
				return resolveModule(fallbackModule);
			}
			catch (fallbackErr: any) {
				logger(`error`, `dynamicImport - all attempts failed for ${specifier}: ${fallbackErr.message}`);
				return null;
			}
		}
	}
};

// -----------------------------------------------------------------------------------------
export const getModuleWithCache = async (moduleName: string) => {
	_moduleCache.has(moduleName) && (
		_moduleCache.get(moduleName)
	) || await (async () => {
		const moduleResult = await dynamicImport(moduleName);
		moduleResult && _moduleCache.set(moduleName, moduleResult);
		return moduleResult;
	})();

	return _moduleCache.get(moduleName) || null;
};
