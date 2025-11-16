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

const _getPrettier = async () => {
	if (_prettierCache) {
		return _prettierCache;
	}
	try {
		const prettier = require("prettier");
		_prettierCache = prettier;
		return prettier;
	}
	catch (err) {
		return null;
	}
};
const _getPrettierPluginJava = async () => {
	if (_prettierPluginJavaCache) {
		return _prettierPluginJavaCache;
	}
	try {
		const plugin = require("prettier-plugin-java");
		_prettierPluginJavaCache = plugin;
		return plugin;
	}
	catch (err) {
		return null;
	}
};
const _getPrettierPluginJsp = async () => {
	if (_prettierPluginJspCache) {
		return _prettierPluginJspCache;
	}
	try {
		const plugin = require("prettier-plugin-jsp");
		_prettierPluginJspCache = plugin;
		return plugin;
	}
	catch (err) {
		return null;
	}
};
const _getPrettierPluginXml = async () => {
	if (_prettierPluginXmlCache) {
		return _prettierPluginXmlCache;
	}
	try {
		const plugin = require("@prettier/plugin-xml");
		_prettierPluginXmlCache = plugin;
		return plugin;
	}
	catch (err) {
		return null;
	}
};
const _getPrettierPluginYaml = async () => {
	if (_prettierPluginYamlCache) {
		return _prettierPluginYamlCache;
	}
	try {
		const plugin = require("prettier/plugins/yaml");
		_prettierPluginYamlCache = plugin;
		return plugin;
	}
	catch (err) {
		return null;
	}
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