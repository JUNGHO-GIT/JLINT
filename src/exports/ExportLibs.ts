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
import * as _sqlFormatter from "sql-formatter";
import type { FormatOptionsWithLanguage as _FormatOptionsWithLanguage } from "sql-formatter";
import _prettier from "prettier";
import type { Options as _PrettierOptions } from "prettier";
import type { Plugin as _PrettierPlugin } from "prettier";
import _stripJsonComments from "strip-json-comments";
import type { Options as _StripJsonOptions } from "strip-json-comments";
import _strip from "strip-comments";
import type { Options as _StripOptions } from "strip-comments";
import _prettierPluginYaml from "prettier/plugins/yaml";
import _prettierPluginXml from "@prettier/plugin-xml";
import _prettierPluginJava from "prettier-plugin-java";

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
export { _sqlFormatter as sqlFormatter };
export type { _FormatOptionsWithLanguage as FormatOptionsWithLanguage };
export { _prettier as prettier };
export type { _PrettierOptions as PrettierOptions };
export type { _PrettierPlugin as PrettierPlugin };
export { _stripJsonComments as stripJsonComments };
export type { _StripJsonOptions as StripJsonOptions };
export { _strip as strip };
export type { _StripOptions as StripOptions };
export { _prettierPluginYaml as prettierPluginYaml };
export { _prettierPluginXml as prettierPluginXml };
export { _prettierPluginJava as prettierPluginJava };