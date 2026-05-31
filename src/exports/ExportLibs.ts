/**
 * @file ExportLibs.ts
 * @description 외부 라이브러리와 동적 로더 배럴
 * @author Jungho
 * @since 2026-1-4
 */

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
import type * as PrttMod from "prettier";
import type { Plugin as PrttPlgn } from "prettier";
import type * as SqlFrmtMod from "sql-formatter";
import { gtModWthCch as _gtModWthCch } from "@scripts/modules";

export { default as fs } from "node:fs";
export { default as path } from "node:path";
export { TextDecoder } from "node:util";
export { stExtPth as setExtensionPath } from "@scripts/modules";
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
export const getPrettier = async (): Promise<typeof PrttMod | null> =>
	_gtModWthCch<typeof PrttMod>(`prettier`);
export const gtPrttPlgnJv = async (): Promise<PrttPlgn | null> =>
	_gtModWthCch<PrttPlgn>(`prettier-plugin-java`);
export const gtPrPlJs = async (): Promise<PrttPlgn | null> =>
	_gtModWthCch<PrttPlgn>(`prettier-plugin-jsp`);
export const gtPrPlXm = async (): Promise<PrttPlgn | null> =>
	_gtModWthCch<PrttPlgn>(`@prettier/plugin-xml`);
export const gtPrPlYm = async (): Promise<PrttPlgn | null> =>
	_gtModWthCch<PrttPlgn>(`prettier/plugins/yaml`);
export const gtSqlFrmt = async (): Promise<typeof SqlFrmtMod | null> =>
	_gtModWthCch<typeof SqlFrmtMod>(`sql-formatter`);
