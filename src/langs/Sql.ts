/**
 * @file Sql.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { FormatOptionsWithLanguage } from "@exportLibs";
import { getSqlFormatter } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import type { CommonType } from "@exportTypes";

// 0. removeComments ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const removeComments = async (
	contentsParam: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		const minifyResult = contentsParam;

		const finalResult = minifyResult;

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	} catch (error: unknown) {
		logger(`error`, `${fileExt}:removeComments - ${(error as Error).message}`);
		return contentsParam;
	}
};

// 1. prettierFormat ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const prettierFormat = async (
	commonParam: CommonType,
	contentsParam: string,
	fileName: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. prettier
		const sqlFormatter = await getSqlFormatter();
		const formatterStatus = sqlFormatter
			? `sqlFormatter:loaded`
			: `sqlFormatter:missing`;
		logger(
			sqlFormatter ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatterStatus}`,
		);

		// 1. parser
		const parser = `mysql`;

		// 2. plugin

		// 3. options
		const baseOptions: FormatOptionsWithLanguage = {
			language: parser,
			tabWidth: commonParam.indentSize,
			useTabs: commonParam.useTabs,
			keywordCase: `upper`,
			dataTypeCase: `upper`,
			functionCase: `upper`,
			identifierCase: `upper`,
			indentStyle: `standard`,
			logicalOperatorNewline: `before`,
			expressionWidth: 100,
			linesBetweenQueries: 1,
			denseOperators: false,
			newlineBeforeSemicolon: false,
		};
		const formatterAvailable =
			sqlFormatter && typeof sqlFormatter.format === `function`;
		logger(
			formatterAvailable ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatterAvailable ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = formatterAvailable
			? await (async () => {
					logger(`debug`, `${fileExt}:prettierFormat - format:start`);
					const formatted = await sqlFormatter.format(
						contentsParam,
						baseOptions,
					);
					logger(`debug`, `${fileExt}:prettierFormat - format:success`);
					return formatted;
				})()
			: (() => {
					logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
					return contentsParam;
				})();
		logger(`debug`, `${fileExt}:prettierFormat - end`);
		return finalResult;
	} catch (error: unknown) {
		const msg = (error as Error).message
			.toString()
			.trim()
			.replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
		const msgRegex = /([\S\s]*)(\s*)(https)(.*?)(\()(.*?)(\))([\S\s]*)/gm;
		const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replaceAll(msgRegex, msgRegexReplace);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
		return contentsParam;
	}
};

// 2. insertLine ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const insertLine = async (contentsParam: string, fileExt: string) => {
	try {
		const finalResult = contentsParam;

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	} catch (error: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
		return contentsParam;
	}
};

// 3. insertSpace ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const insertSpace = async (contentsParam: string, fileExt: string) => {
	try {
		const finalResult = contentsParam;

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	} catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return contentsParam;
	}
};
