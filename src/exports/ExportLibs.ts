// exports/ExportLibs.ts

// -----------------------------------------------------------------------------------------
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
import _strip from "strip-comments";
import _stripJsonComments from "strip-json-comments";
import type { FormatOptionsWithLanguage as _FormatOptionsWithLanguage } from "sql-formatter";
import type { Options as _PrettierOptions } from "prettier";
import type { Plugin as _PrettierPlugin } from "prettier";
import type { Options as _StripJsonOptions } from "strip-json-comments";
import type { Options as _StripOptions } from "strip-comments";
import {
  setExtensionPath as _setExtensionPath,
  getModuleWithCache as _getModuleWithCache
} from "@scripts/modules";

// -----------------------------------------------------------------------------------------
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
export { _strip as strip };
export { _stripJsonComments as stripJsonComments };
export type { _FormatOptionsWithLanguage as FormatOptionsWithLanguage };
export type { _PrettierOptions as PrettierOptions };
export type { _PrettierPlugin };
export type { _StripJsonOptions as StripJsonOptions };
export type { _StripOptions as StripOptions };

// -----------------------------------------------------------------------------------------
export { _setExtensionPath as setExtensionPath };
export const getPrettier = async () => _getModuleWithCache("prettier");
export const getPrettierPluginJava = async () => _getModuleWithCache("prettier-plugin-java");
export const getPrettierPluginJsp = async () => _getModuleWithCache("prettier-plugin-jsp");
export const getPrettierPluginXml = async () => _getModuleWithCache("@prettier/plugin-xml");
export const getPrettierPluginYaml = async () => _getModuleWithCache("prettier/plugins/yaml");
export const getSqlFormatter = async () => _getModuleWithCache("sql-formatter");