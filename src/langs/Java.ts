/**
 * @file Java.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { PrettierOptions as PrttOpts, StripOptions } from "@exportLibs";
import { getPrettier, gtPrttPlgnJv, strip } from "@exportLibs";
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
			language: `java`,
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
		const parser = `java`;

		// 2. plugin
		const plugin = await gtPrttPlgnJv();
		const pluginStatus = plugin ? `plugin:java:loaded` : `plugin:java:missing`;
		logger(
			plugin ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${pluginStatus}`,
		);

		// 3. options
		const baseOptions: PrttOpts = {
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

		const frmtAvail = prettier && plugin && typeof prettier.format === `function`;
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
		const msg = (error instanceof Error ? error : String(error))
			.toString()
			.trim()
			.replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
		const msgRegex =
			/(\s*)(Sad sad panda)(.*)(line:)(\s*)(\d+)([\S\s]*?)(column:)(\s*)(\d+)([\S\s]*)(->)(.*)(<-)([\S\s]*)/gm;
		const msgReRplc = `[Jlint]\n\nError Line = [ $6 ]\nError column = [ $10 ]\nError Site = [ $13 ]`;
		const msgResult = msg.replaceAll(msgRegex, msgReRplc);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
		return cntnPrm;
	}
};

// 3. insertSpace ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const insertSpace = async (cntnPrm: string, fileExt: string) => {
	try {
		const rules1 = /(\s*)(\))(\s+)(;)/gm;
		const rules2 = /(\s*)(@)(\s*)([\S\s]*?)(\s*)(\()/gm;
		const rules3 = /(\s*?)(ception)({)/gm;

		const finalResult: string = cntnPrm
			.replaceAll(rules1, (...p: unknown[]) => `${p[1]}${p[2]}${p[4]}`)
			.replaceAll(rules2, (...p: unknown[]) => `${p[1]}${p[2]}${p[4]} ${p[6]}`)
			.replaceAll(rules3, (...p: unknown[]) => `${p[2]} ${p[3]}`);

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return cntnPrm;
	}
};

// 2. insertLine ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const insertLine = async (cntnPrm: string, fileExt: string) => {
	try {
		const rules1 =
			/(?!^\/\/--)(^(?!\n)\s*)(@[A-Z].*?(\n\s*)(?=(public|private|function|class))|(public|private|function|class))/gm;

		const finalResult: string = cntnPrm.replaceAll(
			rules1,
			(...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const spaceSize = p1.length + `// `.length + `-`.length;
				const insertSize = 100 - spaceSize;
				const insetLine = `// ${`-`.repeat(insertSize)}`;
				return `${p1}${insetLine}\n${p1}${p2}`;
			},
		);

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
		return cntnPrm;
	}
};

export { prttFrmt as prettierFormat, rmvCmts as removeComments };
