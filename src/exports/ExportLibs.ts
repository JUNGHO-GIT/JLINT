/**
 * @file ExportLibs.ts
 * @description 외부 라이브러리와 동적 로더 배럴
 * @author Jungho
 * @since 2026-1-4
 */

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
import type * as PrettierModule from "prettier";
import type { Plugin as PrettierPlugin } from "prettier";
import type * as SqlFormatterModule from "sql-formatter";
import { getModuleWithCache as _getModuleWithCache } from "@scripts/modules";

export { default as fs } from "node:fs";
export { default as path } from "node:path";
export { TextDecoder } from "node:util";
export { setExtensionPath } from "@scripts/modules";
export { default as CleanCSS } from "clean-css";
export { minify as htmlMinify } from "html-minifier-terser";
export type { Options as PrettierOptions, Plugin as PrettierPlugin } from "prettier";
export type { FormatOptionsWithLanguage } from "sql-formatter";
export { default as strip, type Options as StripOptions } from "strip-comments";
export {
	default as stripJsonComments,
	type Options as StripJsonOptions,
} from "strip-json-comments";
export { minify as jsMinify } from "terser";
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export { default as vscode } from "vscode";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const getPrettier = async (): Promise<typeof PrettierModule | null> =>
	_getModuleWithCache<typeof PrettierModule>(`prettier`);
export const getPrettierPluginJava = async (): Promise<PrettierPlugin | null> =>
	_getModuleWithCache<PrettierPlugin>(`prettier-plugin-java`);
export const getPrettierPluginJsp = async (): Promise<PrettierPlugin | null> =>
	_getModuleWithCache<PrettierPlugin>(`prettier-plugin-jsp`);
export const getPrettierPluginXml = async (): Promise<PrettierPlugin | null> =>
	_getModuleWithCache<PrettierPlugin>(`@prettier/plugin-xml`);
export const getPrettierPluginYaml = async (): Promise<PrettierPlugin | null> =>
	_getModuleWithCache<PrettierPlugin>(`prettier/plugins/yaml`);
export const getSqlFormatter = async (): Promise<typeof SqlFormatterModule | null> =>
	_getModuleWithCache<typeof SqlFormatterModule>(`sql-formatter`);
