// exports/ExportLibs.ts

// -------------------------------------------------------------------------------
import * as vscode from "vscode";
export { vscode };
export { default as fs } from "fs";
export { default as path } from "path";
export { createRequire } from "module";
export { default as http } from "http";
export { default as https } from "https";
export { Minimatch } from "minimatch";
export { TextEncoder, TextDecoder } from "util";

// -------------------------------------------------------------------------------
export { default as lodash } from "lodash";
export { default as CleanCSS } from "clean-css";

// -------------------------------------------------------------------------------
export { minify as jsMinify } from "terser";
export { minify as htmlMinify } from "html-minifier-terser";
export type { FormatOptionsWithLanguage } from "sql-formatter";

// -------------------------------------------------------------------------------
export type { Options as PrettierOptions } from "prettier";
export type { Plugin as PrettierPlugin } from "prettier";

// -------------------------------------------------------------------------------
export { default as stripJsonComments } from "strip-json-comments";
export type { Options as StripJsonOptions } from "strip-json-comments";
export { default as strip } from "strip-comments";
export type { Options as StripOptions } from "strip-comments";