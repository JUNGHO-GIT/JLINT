// Css.ts

import { lodash, CleanCSS, strip, getPrettier } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import { CommonType } from "@exportTypes";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
	contentsParam: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string
) => {
	try {
		const minifyResult = (
			new CleanCSS({
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
					spaces: {
						aroundSelectorRelation: true,
						beforeBlockBegins: true,
						beforeValue: true,
					},
					breakWith: fileEol,
					indentBy: fileTabSize,
					indentWith: `tab`,
					semicolonAfterLastProperty: true,
					wrapAt: 120,
				},
				level: {
					1: {
						all: false,
						specialComments: `none`,
						selectorsSortingMethod: `standard`,
						normalizeUrls: false,
						roundingPrecision: false,
						cleanupCharsets: true,
						optimizeBackground: true,
						optimizeBorderRadius: true,
						optimizeFilter: true,
						optimizeFont: true,
						optimizeFontWeight: true,
						optimizeOutline: true,
						removeEmpty: true,
						removeWhitespace: true,
						removeNegativePaddings: true,
						removeQuotes: false,
						replaceMultipleZeros: false,
						replaceTimeUnits: false,
						replaceZeroUnits: false,
						tidyAtRules: true,
						tidyBlockScopes: true,
						tidySelectors: true,
					},
					2: {
						all: false,
						mergeMedia: true,
						mergeAdjacentRules: true,
						mergeIntoShorthands: true,
						mergeNonAdjacentRules: true,
						removeDuplicateFontRules: true,
						removeDuplicateMediaBlocks: true,
						removeDuplicateRules: true,
						removeUnusedAtRules: true,
						reduceNonAdjacentRules: true,
						removeEmpty: true,
						overrideProperties: true,
					},
				},
			}).minify(contentsParam).styles
		);

		const baseOptions: StripOptions = {
			language: `css`,
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(
			minifyResult,
			baseOptions
		);

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:removeComments - ${err.message}`);
		return contentsParam;
	}
};

// 1. prettierFormat -------------------------------------------------------------------------------
export const prettierFormat = async (
	commonParam: CommonType,
	contentsParam: string,
	fileName: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. prettier
		const prettier = await getPrettier();
		const prettierStatus = prettier ? `prettier:loaded` : `prettier:missing`;
		logger(prettier ? `debug` : `warn`, `${fileExt}:prettierFormat - ${prettierStatus}`);

		// 1. parser
		const parser = `css`;

		// 2. plugin

		// 3. options
		const baseOptions: PrettierOptions = {
			parser: parser,
			singleQuote: commonParam.quoteType === `single`,
			printWidth: 1000,
			tabWidth: commonParam.tabSize,
			useTabs: true,
			quoteProps: `as-needed`,
			jsxSingleQuote: commonParam.quoteType === `single`,
			trailingComma: `all`,
			bracketSpacing: false,
			jsxBracketSameLine: false,
			arrowParens: `always`,
			rangeStart: 0,
			rangeEnd: Infinity,
			requirePragma: false,
			insertPragma: false,
			proseWrap: `preserve`,
			htmlWhitespaceSensitivity: `ignore`,
			vueIndentScriptAndStyle: true,
			endOfLine: fileEol === `lf` ? `lf` : `crlf`,
			embeddedLanguageFormatting: `auto`,
			singleAttributePerLine: false,
			bracketSameLine: false,
			semi: true,
			filepath: fileName,
			__embeddedInHtml: true,
		};
		const formatterAvailable = prettier && typeof prettier.format === `function`;
		logger(formatterAvailable ? `debug` : `warn`, `${fileExt}:prettierFormat - ${formatterAvailable ? `formatter:ready` : `formatter:missing`}`);
		const finalResult = formatterAvailable
			? await (async () => {
				logger(`debug`, `${fileExt}:prettierFormat - format:start`);
				const formatted = await prettier.format(contentsParam, baseOptions);
				logger(`debug`, `${fileExt}:prettierFormat - format:success`);
				return formatted;
			})()
			: (() => {
					logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
					return contentsParam;
				})();
		logger(`debug`, `${fileExt}:prettierFormat - end`);
		return finalResult;
	}
	catch (err: any) {
		const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, ``);
		const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
		const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replace(msgRegex, msgRegexReplace);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt} - ${msgResult}`);
		return contentsParam;
	}
};

// 2. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const finalResult = contentsParam;

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:insertSpace - ${err.message}`);
		return contentsParam;
	}
};

// 3. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const finalResult = contentsParam;

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:insertLine - ${err.message}`);
		return contentsParam;
	}
};

// 4. lineBreak ------------------------------------------------------------------------------------
export const lineBreak = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(>)(\n*)(?:\})(?:\n*)(function)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}\n${p[3]}`
			))
			.value();

		logger(`debug`, `${fileExt}:lineBreak - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:lineBreak - ${err.message}`);
		return contentsParam;
	}
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const finalResult = contentsParam;

		logger(`debug`, `${fileExt}:finalCheck - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:finalCheck - ${err.message}`);
		return contentsParam;
	}
};
