/**
 * @file Xml.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { PrettierOptions, StripOptions } from "@exportLibs";
import { getPrettier, getPrettierPluginXml, strip } from "@exportLibs";
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
		const minifyResult = contents;

		const baseOptions: StripOptions = {
			block: true,
			keepProtected: false,
			language: `xml`,
			line: true,
			preserveNewlines: false,
		};

		const finalResult = strip(minifyResult, baseOptions);

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
		// 0. prettier
		const prettier = await getPrettier();
		const prettierStatus = prettier ? `prettier:loaded` : `prettier:missing`;
		logger(
			prettier ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${prettierStatus}`,
		);

		// 1. parser
		const parser = `xml`;

		// 2. plugin
		const plugin = await getPrettierPluginXml();
		const pluginStatus = plugin ? `plugin:xml:loaded` : `plugin:xml:missing`;
		logger(
			plugin ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${pluginStatus}`,
		);

		// 3. options
		const baseOptions: PrettierOptions = {
			__embeddedInHtml: true,
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
		const formatAvailable = prettier && plugin && typeof prettier.format === `function`;
		logger(
			formatAvailable ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatAvailable ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = formatAvailable ? await (async () => {
      logger(`debug`, `${fileExt}:prettierFormat - format:start`);
      const formatted = await prettier.format(contents, baseOptions);
      logger(`debug`, `${fileExt}:prettierFormat - format:success`);
      return formatted;
    })() : (() => {
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
