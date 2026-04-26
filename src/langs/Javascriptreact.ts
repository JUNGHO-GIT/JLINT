/**
 * @file Javascriptreact.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { PrettierOptions, StripOptions } from "@exportLibs";
import { getPrettier, jsMinify, strip } from "@exportLibs";
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
		const minifyResult = await jsMinify(contentsParam, {
			compress: false,
			mangle: false,
			format: {
				comments: false,
			},
		}).then((result: unknown) => {
			return (result as { code: string }).code;
		});

		const baseOptions: StripOptions = {
			language: `javascript`,
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(minifyResult || ``, baseOptions);

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
		const prettier = await getPrettier();
		const prettierStatus = prettier ? `prettier:loaded` : `prettier:missing`;
		logger(
			prettier ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${prettierStatus}`,
		);

		// 1. parser
		const parser = `babel-flow`;

		// 2. plugin

		// 3. options
		const baseOptions: PrettierOptions = {
			parser: parser,
			singleQuote: commonParam.quoteType === `single`,
			printWidth: 1000,
			tabWidth: commonParam.indentSize,
			useTabs: commonParam.useTabs,
			quoteProps: `as-needed`,
			jsxSingleQuote: commonParam.quoteType === `single`,
			trailingComma: `all`,
			bracketSpacing: false,
			jsxBracketSameLine: false,
			arrowParens: `always`,
			rangeStart: 0,
			rangeEnd: Number.POSITIVE_INFINITY,
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
		const formatterAvailable =
			prettier && typeof prettier.format === `function`;
		logger(
			formatterAvailable ? `debug` : `warn`,
			`${fileExt}:prettierFormat - ${formatterAvailable ? `formatter:ready` : `formatter:missing`}`,
		);
		const finalResult = formatterAvailable
			? await (async () => {
					logger(`debug`, `${fileExt}:prettierFormat - format:start`);
					const formatted = await prettier.format(contentsParam, baseOptions);
					const chained = (formatted as string).replaceAll(
						/\n(\t+)(\.)/g,
						(...p: unknown[]) => {
							const p1 = p[1] as string;
							const p2 = p[2] as string;
							return `\n${p1.slice(1)}${p2}`;
						},
					);
					logger(`debug`, `${fileExt}:prettierFormat - format:success`);
					return chained;
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
		const rules1 =
			/^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))\n*(\s*)(public|private|function|class)(\s*.*)(\s*?)/gm;
		const rules2 =
			/^(?!\/\/--)\n*(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*{)(\s*?)/gm;
		const rules3 = /^(?!\/\/--)\n*(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
		const rules4 =
			/^(?!\/\/--)\n*(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*{)(\s*?)/gm;
		const rules5 = /^(?!\/\/--)\n*(\s*)(return\s*.*?\s*<)(\s*?)/gm;

		const finalResult: string = contentsParam
			.replaceAll(rules1, (...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const p3 = p[3] as string;
				const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
			})
			.replaceAll(rules2, (...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const p3 = p[3] as string;
				const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
			})
			.replaceAll(rules3, (...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const p3 = p[3] as string;
				const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
			})
			.replaceAll(rules4, (...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const p3 = p[3] as string;
				const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
			})
			.replaceAll(rules5, (...p: unknown[]) => {
				const p1 = p[1] as string;
				const p2 = p[2] as string;
				const p3 = p[3] as string;
				const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
				const insetLine = `// ${`-`.repeat(spaceSize)}-`;
				return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
			});

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
		const rules1 =
			/(\s*)(public|private|function)(\s*)(.*?)(\s*)\((\s*)(.*?)(\s*)\)(\s*)({)/gm;
		const rules2 =
			/(\s*)(public|private|function)(\s*)(\()(\s*)(.*?)(\s*)\)(\s*)({)/gm;
		const rules3 =
			/^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;

		const finalResult: string = contentsParam
			.replaceAll(
				rules1,
				(...p: unknown[]) => `${p[1]}${p[2]} ${p[4]} (${p[7]}) {`,
			)
			.replaceAll(rules2, (...p: unknown[]) => `${p[1]}${p[2]} (${p[6]}) {`)
			.replaceAll(rules3, (...p: unknown[]) => `${p[2]}${p[3]}${p[4]}${p[5]}`);

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	} catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return contentsParam;
	}
};
