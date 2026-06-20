/**
 * @file ExportLibs.ts
 * @description 외부 라이브러리와 동적 로더 배럴
 * @author Jungho
 * @since 2026-1-4
 */

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
import { getModuleWithCache } from "@scripts/modules";
import type * as PrettierModule from "prettier";
import type { Plugin as PrettierPluginType } from "prettier";
import type * as SqlFormatterModule from "sql-formatter";
import type * as RuffFmtModule from "@wasm-fmt/ruff_fmt";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export { default as fs } from "node:fs";
export { default as path } from "node:path";
export { TextDecoder } from "node:util";
export { spawnSync } from "node:child_process";
export { setExtensionPath } from "@scripts/modules";
export { default as CleanCSS } from "clean-css";
export { minify as htmlMinify } from "html-minifier-terser";
export type { Options as PrettierOptions, Plugin as PrettierPlugin } from "prettier";
export type { FormatOptionsWithLanguage } from "sql-formatter";
export type { Config as RuffOptions } from "@wasm-fmt/ruff_fmt";
export { default as strip, type Options as StripOptions } from "strip-comments";
export { default as stripJsonComments, type Options as StripJsonOptions } from "strip-json-comments";
export { minify as jsMinify } from "terser";
export { default as vscode } from "vscode";

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getPrettier = async (): Promise<typeof PrettierModule | null> => {
  return getModuleWithCache<typeof PrettierModule>(`prettier`);
};
export const getPrettierPluginJava = async (): Promise<PrettierPluginType | null> => {
  return getModuleWithCache<PrettierPluginType>(`prettier-plugin-java`);
};
export const getPrettierPluginJsp = async (): Promise<PrettierPluginType | null> => {
  return getModuleWithCache<PrettierPluginType>(`prettier-plugin-jsp`);
};
export const getPrettierPluginXml = async (): Promise<PrettierPluginType | null> => {
  return getModuleWithCache<PrettierPluginType>(`@prettier/plugin-xml`);
};
export const getPrettierPluginYaml = async (): Promise<PrettierPluginType | null> => {
  return getModuleWithCache<PrettierPluginType>(`prettier/plugins/yaml`);
};
export const getSqlFormatter = async (): Promise<typeof SqlFormatterModule | null> => {
  return getModuleWithCache<typeof SqlFormatterModule>(`sql-formatter`);
};
export const getRuffFmt = async (): Promise<typeof RuffFmtModule | null> => {
  return getModuleWithCache<typeof RuffFmtModule>(`@wasm-fmt/ruff_fmt`);
};