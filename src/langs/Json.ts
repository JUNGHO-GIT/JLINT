// Json.ts

import { stripJsonComments, getPrettier } from "@exportLibs";
import type { PrettierOptions, StripJsonOptions } from "@exportLibs";
import { logger, modal } from "@exportScripts";

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

    const baseOptions: StripJsonOptions = {
      trailingCommas: false,
      whitespace: true
		};

		const finalResult = stripJsonComments(
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
		// 0. prettier
		const prettier = await getPrettier();

		// 1. parser
    const parser = "json";

		// 2. plugin

		// 3. options
    const baseOptions: PrettierOptions = {
      parser: parser,
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
      filepath: fileName,
      __embeddedInHtml: true,
    };

		logger("debug", `${fileExt}:prettierFormat`, "Y");
		const finalResult = prettier && typeof prettier.format === "function"
		? prettier.format(contentsParam, baseOptions)
		: contentsParam;
		return finalResult;
	}
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

  	logger("error", `${fileExt}:prettierFormat`, msgResult);
  	modal("error", fileExt, msgResult);
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

  	logger("debug", `${fileExt}:insertSpace`, "Y");
    return finalResult
  }
  catch (err: any) {
  	logger("error", `${fileExt}:insertSpace`, err.message);
    return contentsParam;
  }
};

// 4. lineBreak ------------------------------------------------------------------------------------
export const lineBreak = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
    const finalResult = contentsParam;

  	logger("debug", `${fileExt}:lineBreak`, "N");
    return finalResult;
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
  logger("debug", `${fileExt}:finalCheck`, "N");
    return contentsParam;
  }
  catch (err: any) {
  	logger("error", `${fileExt}:finalCheck`, err.message);
    return contentsParam;
  }
};