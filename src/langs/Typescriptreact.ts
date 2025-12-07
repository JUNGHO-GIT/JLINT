// Typescriptreact.ts

import { lodash, jsMinify, strip, getPrettier } from "@exportLibs";
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
			await jsMinify(contentsParam, {
				compress: false,
				mangle: false,
				format: {
					comments: false,
				},
			})
				.then((result: any) => {
					return result.code;
				})
		);

		const baseOptions: StripOptions = {
			language: `javascript`,
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(
			minifyResult || ``,
			baseOptions
		);

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:removeComments - ${(err as Error).message}`);
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
		const parser = `babel-ts`;

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
	catch (err: unknown) {
		const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, ``);
		const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
		const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
		const msgResult = msg.replace(msgRegex, msgRegexReplace);

		logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
		modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
		return contentsParam;
	}
};

// 2. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm
		);
		const rules2 = (
			/^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm
		);
		const rules3 = (
			/^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm
		);
		const rules4 = (
			/^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm
		);
		const rules5 = (
			/^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: unknown[]) => {
				const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
			})
			.replace(rules2, (...p: unknown[]) => {
				const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
			})
			.replace(rules3, (...p: unknown[]) => {
				const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
			})
			.replace(rules4, (...p: unknown[]) => {
				const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
			})
			.replace(rules5, (...p: unknown[]) => {
				const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
			})
			.value();

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(err as Error).message}`);
		return contentsParam;
	}
};

// 3. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)(public|private|function)(\s*)(.*?)(\s*)(?:[(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
		);
		const rules2 = (
			/(\s*)(public|private|function)(\s*)([(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
		);
		const rules3 = (
			/^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}${p[2]} ${p[4]} (${p[7]}) {`
			))
			.replace(rules2, (...p: unknown[]) => (
				`${p[1]}${p[2]} (${p[6]}) {`
			))
			.replace(rules3, (...p: unknown[]) => (
				`${p[2]}${p[3]}${p[4]}${p[5]}`
			))
			.value();

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(err as Error).message}`);
		return contentsParam;
	}
};