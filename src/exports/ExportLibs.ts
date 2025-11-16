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
export type { _PrettierPlugin as PrettierPlugin };
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

const _getPrettier = async () => (
	_prettierCache ?? (
		_prettierCache = await import("prettier")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);
const _getPrettierPluginJava = async () => (
	_prettierPluginJavaCache ?? (
		_prettierPluginJavaCache = await import("prettier-plugin-java")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);
const _getPrettierPluginJsp = async () => (
	_prettierPluginJspCache ?? (
		_prettierPluginJspCache = await import("prettier-plugin-jsp")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);
const _getPrettierPluginXml = async () => (
	_prettierPluginXmlCache ?? (
		_prettierPluginXmlCache = await import("@prettier/plugin-xml")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);
const _getPrettierPluginYaml = async () => (
	_prettierPluginYamlCache ?? (
		_prettierPluginYamlCache = await import("prettier/plugins/yaml")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);
const _getSqlFormatter = async () => (
	_sqlFormatterCache ?? (
		_sqlFormatterCache = await import("sql-formatter")
		.then((m) => {
			return (m as any).default ?? m;
		})
		.catch(() => {
			return null;
		})
	)
);

export { _getPrettier as getPrettier };
export { _getPrettierPluginJava as getPrettierPluginJava };
export { _getPrettierPluginJsp as getPrettierPluginJsp };
export { _getPrettierPluginYaml as getPrettierPluginYaml };
export { _getPrettierPluginXml as getPrettierPluginXml };
export { _getSqlFormatter as getSqlFormatter };