// exports/ExportLibs.ts

// 1. import --------------------------------------------------------------------------------
import _vscode from "vscode";
import _fs from "fs";
import _path from "path";
import _http from "http";
import _https from "https";
import { Minimatch as _Minimatch } from "minimatch";
import { TextEncoder as _TextEncoder, TextDecoder as _TextDecoder } from "util";
import _lodash from "lodash";
import _CleanCSS from "clean-css";
import { minify as _jsMinify } from "terser";
import { minify as _htmlMinify } from "html-minifier-terser";
import type { FormatOptionsWithLanguage as _FormatOptionsWithLanguage } from "sql-formatter";
import type { Options as _PrettierOptions } from "prettier";
import type { Plugin as _PrettierPlugin } from "prettier";
import _stripJsonComments from "strip-json-comments";
import type { Options as _StripJsonOptions } from "strip-json-comments";
import _strip from "strip-comments";
import type { Options as _StripOptions } from "strip-comments";

// 2. export --------------------------------------------------------------------------------
export { _vscode as vscode };
export { _fs as fs };
export { _path as path };
export { _http as http };
export { _https as https };
export { _Minimatch as Minimatch };
export { _TextEncoder as TextEncoder, _TextDecoder as TextDecoder };
export { _lodash as lodash };
export { _CleanCSS as CleanCSS };
export { _jsMinify as jsMinify };
export { _htmlMinify as htmlMinify };
export type { _FormatOptionsWithLanguage as FormatOptionsWithLanguage };
export type { _PrettierOptions as PrettierOptions };
export type { _PrettierPlugin };
export { _stripJsonComments as stripJsonComments };
export type { _StripJsonOptions as StripJsonOptions };
export { _strip as strip };
export type { _StripOptions as StripOptions };

// 3. special export -------------------------------------------------------------------------------
let _prettierCache: any = null;
let _prettierPluginJavaCache: any = null;
let _prettierPluginJspCache: any = null;
let _prettierPluginXmlCache: any = null;
let _prettierPluginYamlCache: any = null;
let _sqlFormatterCache: any = null;

const _resolveModule = (moduleResult: any) => moduleResult && typeof moduleResult === "object" && "default" in moduleResult ? (
  moduleResult.default
) : (
  moduleResult
);
const _resolveModulePath = (specifier: string) => {
  const extensionPath = _path.dirname(__dirname || "");
  const localPath = _path.join(extensionPath, "node_modules", specifier);

  if (_fs.existsSync(localPath)) {
    return localPath;
  }

  if (_fs.existsSync(_path.join(localPath, "index.js"))) {
    return _path.join(localPath, "index.js");
  }

  const packageJsonPath = _path.join(localPath, "package.json");
  if (_fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(_fs.readFileSync(packageJsonPath, "utf8"));
      const mainFile = packageJson.main || "index.js";
      return _path.join(localPath, mainFile);
    }
    catch (err) {
      return specifier;
    }
  }

  return specifier;
};
const _dynamicImport = async (specifier: string) => {
  const resolvedPath = _resolveModulePath(specifier);
  try {
    const requiredModule = require(resolvedPath);
    return _resolveModule(requiredModule);
  }
  catch (requireErr) {
    try {
      const moduleResult = await import(resolvedPath);
      return _resolveModule(moduleResult);
    }
    catch (importErr) {
      try {
        const fallbackModule = require(specifier);
        return _resolveModule(fallbackModule);
      }
      catch (fallbackErr) {
        return null;
      }
    }
  }
};

const _getPrettier = async () => {
	return _prettierCache ? (
		_prettierCache
	) : await (async () => {
		const moduleResult = await _dynamicImport("prettier");
		return moduleResult ? (
			_prettierCache = moduleResult,
			moduleResult
		) : null;
	})();
};
const _getPrettierPluginJava = async () => {
	return _prettierPluginJavaCache ? (
		_prettierPluginJavaCache
	) : await (async () => {
		const moduleResult = await _dynamicImport("prettier-plugin-java");
		return moduleResult ? (
			_prettierPluginJavaCache = moduleResult,
			moduleResult
		) : null;
	})();
};
const _getPrettierPluginJsp = async () => {
	return _prettierPluginJspCache ? (
		_prettierPluginJspCache
	) : await (async () => {
		const moduleResult = await _dynamicImport("prettier-plugin-jsp");
		return moduleResult ? (
			_prettierPluginJspCache = moduleResult,
			moduleResult
		) : null;
	})();
};
const _getPrettierPluginXml = async () => {
	return _prettierPluginXmlCache ? (
		_prettierPluginXmlCache
	) : await (async () => {
		const moduleResult = await _dynamicImport("@prettier/plugin-xml");
		return moduleResult ? (
			_prettierPluginXmlCache = moduleResult,
			moduleResult
		) : null;
	})();
};
const _getPrettierPluginYaml = async () => {
	return _prettierPluginYamlCache ? (
		_prettierPluginYamlCache
	) : await (async () => {
		const moduleResult = await _dynamicImport("prettier/plugins/yaml");
		return moduleResult ? (
			_prettierPluginYamlCache = moduleResult,
			moduleResult
		) : null;
	})();
};
const _getSqlFormatter = async () => {
	if (_sqlFormatterCache) {
		return _sqlFormatterCache;
	}
	try {
		const formatter = require("sql-formatter");
		_sqlFormatterCache = formatter;
		return formatter;
	}
	catch (err) {
		return null;
	}
};

export { _getPrettier as getPrettier };
export { _getPrettierPluginJava as getPrettierPluginJava };
export { _getPrettierPluginJsp as getPrettierPluginJsp };
export { _getPrettierPluginYaml as getPrettierPluginYaml };
export { _getPrettierPluginXml as getPrettierPluginXml };
export { _getSqlFormatter as getSqlFormatter };