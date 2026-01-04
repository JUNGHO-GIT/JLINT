/**
 * @file ExportLibs.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

// -----------------------------------------------------------------------------------------
import { getModuleWithCache as _getModuleWithCache } from "@scripts/modules";
export { setExtensionPath } from "@scripts/modules";

// -----------------------------------------------------------------------------------------
export { default as vscode } from "vscode";
export { default as fs } from "node:fs";
export { default as path } from "node:path";
export { TextDecoder } from "node:util";
export { default as CleanCSS } from "clean-css";
export { minify as jsMinify } from "terser";
export { minify as htmlMinify } from "html-minifier-terser";
export { default as strip, type Options as StripOptions } from "strip-comments";
export { default as stripJsonComments, type Options as StripJsonOptions } from "strip-json-comments";
export { type FormatOptionsWithLanguage } from "sql-formatter";
export { type Options as PrettierOptions } from "prettier";

// -----------------------------------------------------------------------------------------
export const getPrettier = async () => _getModuleWithCache(`prettier`);
export const getPrettierPluginJava = async () => _getModuleWithCache(`prettier-plugin-java`);
export const getPrettierPluginJsp = async () => _getModuleWithCache(`prettier-plugin-jsp`);
export const getPrettierPluginXml = async () => _getModuleWithCache(`@prettier/plugin-xml`);
export const getPrettierPluginYaml = async () => _getModuleWithCache(`prettier/plugins/yaml`);
export const getSqlFormatter = async () => _getModuleWithCache(`sql-formatter`);
