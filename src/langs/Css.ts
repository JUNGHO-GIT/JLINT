/**
 * @file Css.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { PrettierOptions as PrttOpts, StripOptions } from "@exportLibs";
import { CleanCSS, getPrettier, strip } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import type { CommonType } from "@exportTypes";

// 0. removeComments ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const rmvCmts = async (
	cntnPrm: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		const minifyResult = new CleanCSS({
			format: {
				breaks: {
					afterAtRule: true,
					afterBlockBegins: true,
					afterBlockEnds: true,
					afterComment: true,
					afterProperty: true,
					afterRuleBegins: true,
					afterRuleEnds: true,
					beforeBlockEnds: true,
					betweenSelectors: true,
				},
				breakWith: fileEol,
				indentBy: fileTabSize,
				indentWith: `tab`,
				semicolonAfterLastProperty: true,
				spaces: {
					aroundSelectorRelation: true,
					beforeBlockBegins: true,
					beforeValue: true,
				},
				wrapAt: 120,
			},
			level: {
				1: {
					all: false,
					cleanupCharsets: true,
					normalizeUrls: false,
					optimizeBackground: true,
					optimizeBorderRadius: true,
					optimizeFilter: true,
					optimizeFont: true,
					optimizeFontWeight: true,
					optimizeOutline: true,
					removeEmpty: true,
					removeNegativePaddings: true,
					removeQuotes: false,
					removeWhitespace: true,
					replaceMultipleZeros: false,
					replaceTimeUnits: false,
					replaceZeroUnits: false,
					roundingPrecision: false,
					selectorsSortingMethod: `standard`,
					specialComments: `none`,
					tidyAtRules: true,
					tidyBlockScopes: true,
					tidySelectors: true,
				},
				2: {
					all: false,
					mergeAdjacentRules: true,
					mergeIntoShorthands: true,
					mergeMedia: true,
					mergeNonAdjacentRules: true,
					overrideProperties: true,
					reduceNonAdjacentRules: true,
					removeDuplicateFontRules: true,
					removeDuplicateMediaBlocks: true,
					removeDuplicateRules: true,
					removeEmpty: true,
					removeUnusedAtRules: true,
				},
			},
		}).minify(cntnPrm).styles;

		const baseOptions: StripOptions = {
			block: true,
			keepProtected: false,
			language: `css`,
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
		const parser = `css`;

		// 2. plugin

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
		const msg = (error instanceof Error ? error.message : String(error))
			.toString()
			.trim()
			.replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
		const msgRegex = /([\S\s]*)(\s*)(https)(.*?)(\()(.*?)(\))([\S\s]*)/gm;
		const msgReRplc = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replaceAll(msgRegex, msgReRplc);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt} - ${msgResult}`);
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
