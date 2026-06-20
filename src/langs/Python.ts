/**
 * @file Python.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { RuffOptions } from "@exportLibs";
import { getRuffFmt } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import type { CommonType } from "@exportTypes";

// 0. removeComments ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const removeComments = async (
	contents: string,
	_fileTabSize: number,
	_fileEol: string,
	fileExt: string,
) => {
	try {
		// strip-comments의 python 모드는 삼중따옴표(""" ... """) 문자열 리터럴을
		// 주석(docstring)으로 간주하여 삭제(데이터 손실)하며 block 옵션으로도 막을 수 없으므로,
		// Python은 주석 제거를 수행하지 않고 원본을 보존한다.
		const finalResult = contents;

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:removeComments - ${(error as Error).message}`);
		return contents;
	}
};

// 1. prettierFormat ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const prettierFormat = async (
	commonParam: CommonType,
	contents: string,
	fileName: string,
	_fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. formatter
		const ruffFmt = await getRuffFmt();
		const formatterStatus = ruffFmt ? `ruffFmt:loaded` : `ruffFmt:missing`;
		logger(
			ruffFmt ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatterStatus}`,
		);

		// 1. parser

		// 2. plugin

		// 3. options
		const baseOptions: RuffOptions = {
			indent_style: commonParam.useTabs ? `tab` : `space`,
			indent_width: commonParam.indentSize,
			line_ending: fileEol === `lf` ? `lf` : `crlf`,
			line_width: 1000,
			magic_trailing_comma: `respect`,
			quote_style: commonParam.quoteType === `single` ? `single` : `double`,
		};
		const formatAvailable = ruffFmt && typeof ruffFmt.format === `function`;
		logger(
			formatAvailable ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatAvailable ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = formatAvailable
			? await (async () => {
					logger(`debug`, `${fileExt}:prettierFormat - format:start`);
					const formatted = ruffFmt.format(contents, fileName, baseOptions);
					logger(`debug`, `${fileExt}:prettierFormat - format:success`);
					return formatted;
				})()
			: (() => {
					logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
					return contents;
				})();
		logger(`debug`, `${fileExt}:prettierFormat - end`);
		return finalResult;
	}
  catch (error: unknown) {
		const msg = (error as Error).message
			.toString()
			.trim()
			.replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
		const msgRegex = /([\S\s]*)(\s*)(https)(.*?)(\()(.*?)(\))([\S\s]*)/gm;
		const msgReplacement = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replaceAll(msgRegex, msgReplacement);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
		return contents;
	}
};

// 2. insertLine ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const insertLine = async (contents: string, fileExt: string) => {
	try {
		const finalResult = contents;

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
		return contents;
	}
};

// 3. insertSpace ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const insertSpace = async (contents: string, fileExt: string) => {
	try {
		const finalResult = contents;

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return contents;
	}
};
