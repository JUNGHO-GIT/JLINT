/**
 * @file Yaml.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { PrettierOptions as PrttOpts, StripOptions } from "@exportLibs";
import { getPrettier, gtPrPlYm, strip } from "@exportLibs";
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

		const baseOptions: StripOptions = {
			block: true,
			keepProtected: false,
			language: `yaml`,
			line: true,
			preserveNewlines: false,
		};

		const finalResult = strip(minifyResult, baseOptions);

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
	fileName: string,
	_fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. prettier
		const prettier = await getPrettier();
		const prttStat = prettier ? `prettier:loaded` : `prettier:missing`;
		logger(
			prettier ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${prttStat}`,
		);

		// 1. parser
		const parser = `yaml`;

		// 2. plugin
		const plugin = await gtPrPlYm();
		const pluginStatus = plugin ? `plugin:yaml:loaded` : `plugin:yaml:missing`;
		logger(
			plugin ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${pluginStatus}`,
		);

		// 3. options
		const baseOptions: PrttOpts = {
			arrowParens: `always`,
			bracketSameLine: false,
			bracketSpacing: true,
			checkIgnorePragma: false,
			embeddedLanguageFormatting: `auto`,
			endOfLine: fileEol === `lf` ? `lf` : `crlf`,
			filepath: fileName,
			htmlWhitespaceSensitivity: `ignore`,
			insertPragma: false,
			jsxBracketSameLine: false,
			jsxSingleQuote: commonParam.quoteType === `single`,
			objectWrap: `preserve`,
			parser: parser,
			plugins: plugin ? [plugin] : [],
			printWidth: 1000,
			proseWrap: `preserve`,
			quoteProps: `as-needed`,
			rangeEnd: Number.POSITIVE_INFINITY,
			rangeStart: 0,
			requirePragma: false,
			semi: true,
			singleAttributePerLine: false,
			singleQuote: commonParam.quoteType === `single`,
			tabWidth: commonParam.indentSize,
			trailingComma: `all`,
			useTabs: commonParam.useTabs,
			vueIndentScriptAndStyle: true,
      experimentalOperatorPosition: "end",
      experimentalTernaries: true,
		};
		const frmtAvail = prettier && typeof prettier.format === `function`;
		logger(
			frmtAvail ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${frmtAvail ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = frmtAvail ? await (async () => {
      logger(`debug`, `${fileExt}:prettierFormat - format:start`);
      const formatted = await prettier.format(cntnPrm, baseOptions);
      logger(`debug`, `${fileExt}:prettierFormat - format:success`);
      return formatted;
    })() : (() => {
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
