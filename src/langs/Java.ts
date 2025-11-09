// Java.ts

import { lodash, prettier, strip, createRequire } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
import type { Plugin as PrettierPlugin } from "prettier";
import { logger, notify } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  activateLint: boolean,
  removeComments: boolean,
  insertLine: boolean,
  tabSize: number,
  quoteType: string
};

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
	contentsParam: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string
) => {
	try {
		const minifyResult = (
			contentsParam
		);

		const baseOptions: StripOptions = {
			language: "java",
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(
			minifyResult,
			baseOptions
		);

		logger("debug", `${fileExt}:removeComments`, "Y");
		return finalResult;
	}
	catch (err: any) {
		logger("error", `${fileExt}:removeComments`, err.message);
		return contentsParam;
	}
};

// 1. prettierFormat -------------------------------------------------------------------------------
export const prettierFormat = async (
	confParam: ConfProps,
	contentsParam: string,
	fileName: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string
) => {
	try {
		// 공통 옵션
		const baseOptions: PrettierOptions = {
			parser: "java",
			plugins: [],
			singleQuote: confParam.quoteType === "single",
			printWidth: 1000,
			tabWidth: confParam.tabSize,
			useTabs: true,
			quoteProps: "as-needed",
			jsxSingleQuote: confParam.quoteType === "single",
			trailingComma: "all",
			bracketSpacing: false,
			jsxBracketSameLine: false,
			arrowParens: "always",
			rangeStart: 0,
			rangeEnd: Infinity,
			requirePragma: false,
			insertPragma: false,
			proseWrap: "preserve",
			htmlWhitespaceSensitivity: "ignore",
			vueIndentScriptAndStyle: true,
			endOfLine: fileEol === "lf" ? "lf" : "crlf",
			embeddedLanguageFormatting: "auto",
			singleAttributePerLine: false,
			bracketSameLine: false,
			semi: true,
			filepath: fileName
		};

		// 1차: ESM 동적 임포트로 플러그인 객체 주입
		try {
			const mod = await import("prettier-plugin-java" as any);
			const javaPlugin: PrettierPlugin = ((mod as any)?.default ?? mod) as PrettierPlugin;

			if ((javaPlugin as any)?.parsers?.java == null) {
				throw new Error("ParserNotRegistered");
			}

			const formatted = await prettier.format(contentsParam, {
				...baseOptions,
				plugins: [javaPlugin]
			});

			logger("debug", `${fileExt}:prettierFormat`, "Y");
			return formatted;
		}
		// 2차: CJS require 경로 해석 후 객체 주입
		catch (innerErr: any) {
			try {
				const require = createRequire(typeof __filename !== "undefined" ? __filename : "");
				const reqMod = require("prettier-plugin-java");
				const javaPlugin2: PrettierPlugin = (reqMod?.default ?? reqMod) as PrettierPlugin;

				if ((javaPlugin2 as any)?.parsers?.java == null) {
					throw new Error("ParserNotRegistered");
				}

				const formatted = await prettier.format(contentsParam, {
					...baseOptions,
					plugins: [javaPlugin2]
				});

				logger("debug", `${fileExt}:prettierFormat`, "Y");
				return formatted;
			}
			catch (fallbackErr: any) {
				logger("error", `${fileExt}:prettierFormat`, fallbackErr?.message ?? fallbackErr);
				return contentsParam;
			}
		}
	}
	catch (err: any) {
		const msg = err.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
		const msgRegex = /(\s*)(Sad sad panda)(.*)(line[:])(\s*)(\d+)([\s\S]*?)(column[:])(\s*)(\d+)([\n\s\S]*)(->)(.*)(<-)([\s\S]*)/gm;
		const msgMatch = msg.match(msgRegex);
		const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError column = [ $10 ]\nError Site = [ $13 ]`;

		if (!msgMatch) {
			logger("error", `${fileExt}:prettierFormat`, msg);
			return contentsParam;
		}

		const msgResult = msg.replace(msgRegex, msgRegexReplace);
		logger("error", `${fileExt}:prettierFormat`, msgResult);
		notify("error", fileExt, msgResult);
		return contentsParam;
	}
};

// 2. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)(\))(\s+)(;)/gm
		);
		const rules2 = (
			/(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm
		);
		const rules3 = (
			/(\s*?)(ception)(\{)/gm
		);

		const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}${p[2]}${p[4]}`
		))
		.replace(rules2, (...p: any[]) => (
			`${p[1]}${p[2]}${p[4]} ${p[6]}`
		))
		.replace(rules3, (...p: any[]) => (
			`${p[2]} ${p[3]}`
		))
		.value();

		logger("debug", `${fileExt}:insertSpace`, "Y");
		return finalResult
	}
	catch (err: any) {
		logger("error", `${fileExt}:insertSpace`, err.message);
		return contentsParam;
	}
};

// 3. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(?!^\/\/--)(^(?!\n)\s*)(@[A-Z].*?(?:(\n\s*))(?=(public|private|function|class))|(?:(public|private|function|class)))/gm
		);

		const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => {
			const spaceSize = p[1].length + (`// `).length + (`-`).length;
			const insertSize = 100 - spaceSize;
			const insetLine = (`// ${"-".repeat(insertSize)}`);
			return `${p[1]}${insetLine}\n${p[1]}${p[2]}`;
		})
		.value();

		logger("debug", `${fileExt}:insertLine`, "Y");
		return finalResult
	}
	catch (err: any) {
		logger("error", `${fileExt}:insertLine`, err.message);
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
			/(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm
		);
		const rules5 = (
			/(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm
		);
		const rules6 = (
			/(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm
		);
		const rules9 = (
			/(import.*)(;)(\n*)(\/\/ --)/gm
		);
		const rules10 = (
			/(import.*;)(\n)(^public)/gm
		);
		const rules2 = (
			/(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
		);
		const rules4 = (
			/(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm
		);
		const rules8 = (
			/(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
		);
		const rules11 = (
			/(^\s*)(@Value)(\s*)(\()(.*)(\n+)(.*)(\))/gm
		);
		const rules12 = (
			/(^\s*)(.*;)(\n)(?!\n)(\s*)(@Autowired|@Value|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping)/gm
		);
		const rules13 = (
			/(\s*)(@Override)(\n|\n+)(.*)(\n|\n+)(\s*)(public|private)/gm
		);

		const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}${p[2]}\n${p[6]}`
		))
		.replace(rules5, (...p: any[]) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}\n`
		))
		.replace(rules6, (...p: any[]) => (
		`${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[8]}${p[10]}`
		))
		.replace(rules9, (...p: any[]) => (
			`${p[1]}${p[2]}\n\n${p[4]}`
		))
		.replace(rules10, (...p: any[]) => (
			`${p[1]}${p[2]}\n${p[3]}`
		))
		.replace(rules2, (...p: any[]) => (
			`${p[1]} ${p[3]}\n${p[6]}${p[7]}`
		))
		.replace(rules4, (...p: any[]) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[7]}${p[8]}`
		))
		.replace(rules8, (...p: any[]) => (
			`${p[1]}\n${p[3]}${p[4]}${p[5]}${p[6]}${p[7]}${p[8]}${p[9]}${p[10]}${p[11]}`
		))
		.replace(rules11, (...p: any[]) => (
			`${p[1]}${p[2]} (${p[5]}${p[7]})`
		))
		.replace(rules12, (...p: any[]) => (
			`${p[1]}${p[2]}\n\n${p[4]}${p[5]}`
		))
		.replace(rules13, (...p: any[]) => (
			`${p[1]}${p[2]}\n${p[6]}${p[7]}`
		))
		.value();

		logger("debug", `${fileExt}:lineBreak`, "Y");
		return finalResult
	}
	catch (err: any) {
		logger("error", `${fileExt}:lineBreak`, err.message);
		return contentsParam;
	}
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
		);
		const rules2 = (
			/(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm
		);
		const rules3 = (
			/(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm
		);
		const rules4 = (
			/(^\s*)(\/\/ [-]+)([->][\n\s]*)(\s*)(\/\/ [-]+)([->][\n\s])/gm
		);
		const rules5 = (
			/(---------------------------)(\n+)(\s*)(\w+)/m
		);

		const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
		))
		.replace(rules2, (...p: any[]) => (
			`${p[4]}${p[5]}\n${p[2]}${p[3]}\n${p[7]}${p[8]}`
		))
		.replace(rules3, (...p: any[]) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}\n${p[7]}${p[8]}`
		))
		.replace(rules4, (...p: any[]) => (
			`${p[1]}${p[2]}-\n`
		))
		.replace(rules5, (...p: any[]) => (
			`${p[1]}\n${p[3]}${p[4]}`
		))
		.value();

		logger("debug", `${fileExt}:finalCheck`, "Y");
		return finalResult
	}
	catch (err: any) {
		logger("error", `${fileExt}:finalCheck`, err.message);
		return contentsParam;
	}
};