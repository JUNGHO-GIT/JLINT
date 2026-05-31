/**
 * @file Sql.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { FormatOptionsWithLanguage as FrmOpWtLa } from "@exportLibs";
import { gtSqlFrmt } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import type { CommonType } from "@exportTypes";

// 0. removeComments ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const rmvCmts = async (
	cntnPrm: string,
	_fileTabSize: number,
	_fileEol: string,
	fileExt: string,
) => {
	try {
		const minifyResult = cntnPrm;

		const finalResult = minifyResult;

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:removeComments - ${(error as Error).message}`);
		return cntnPrm;
	}
};

// 1. prettierFormat ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const prttFrmt = async (
	commonParam: CommonType,
	cntnPrm: string,
	_fileName: string,
	_fileTabSize: number,
	_fileEol: string,
	fileExt: string,
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. prettier
		const sqlFormatter = await gtSqlFrmt();
		const frmtStat = sqlFormatter
			? `sqlFormatter:loaded`
			: `sqlFormatter:missing`;
		logger(
			sqlFormatter ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${frmtStat}`,
		);

		// 1. parser
		const parser = `mysql`;

		// 2. plugin

		// 3. options
		const baseOptions: FrmOpWtLa = {
			dataTypeCase: `upper`,
			denseOperators: false,
			expressionWidth: 100,
			functionCase: `upper`,
			identifierCase: `upper`,
			indentStyle: `standard`,
			keywordCase: `upper`,
			language: parser,
			linesBetweenQueries: 1,
			logicalOperatorNewline: `before`,
			newlineBeforeSemicolon: false,
			tabWidth: commonParam.indentSize,
			useTabs: commonParam.useTabs,
		};
		const frmtAvail =
			sqlFormatter && typeof sqlFormatter.format === `function`;
		logger(
			frmtAvail ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${frmtAvail ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = frmtAvail
			? await (async () => {
					logger(`debug`, `${fileExt}:prettierFormat - format:start`);
					const formatted = await sqlFormatter.format(
						cntnPrm,
						baseOptions,
					);
					logger(`debug`, `${fileExt}:prettierFormat - format:success`);
					return formatted;
				})()
			: (() => {
					logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
					return cntnPrm;
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
		const msgReRplc = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replaceAll(msgRegex, msgReRplc);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
		return cntnPrm;
	}
};

// 2. insertLine ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const insertLine = async (cntnPrm: string, fileExt: string) => {
	try {
		const finalResult = cntnPrm;

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
		return cntnPrm;
	}
};

// 3. insertSpace ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const insertSpace = async (cntnPrm: string, fileExt: string) => {
	try {
		const finalResult = cntnPrm;

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return cntnPrm;
	}
};

export { prttFrmt as prettierFormat, rmvCmts as removeComments };
