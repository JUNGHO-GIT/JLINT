// Json.ts

import * as vscode from "vscode";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import stripJsonComments from "strip-json-comments";
import type {Options as StripOptions} from "strip-json-comments";
import { fnLogger } from "../assets/scripts/utils";

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
      trailingCommas: false,
      whitespace: true
		};

		const finalResult = stripJsonComments(
			minifyResult,
			baseOptions
		);

    fnLogger(fileExt, "removeComments", "Y");
    return finalResult;
  }
  catch (err: any) {
    fnLogger(fileExt, "removeComments", "E", err.message);
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
    const baseOptions: PrettierOptions = {
      parser: "json",
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
      __embeddedInHtml: true,
    };

    fnLogger(fileExt, "prettierFormat", "Y");
    const finalResult = prettier.format(contentsParam, baseOptions);
    return finalResult;
  }
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

    fnLogger(fileExt, "prettierFormat", "E", msgResult);
    vscode.window.showInformationMessage(msgResult, { modal: true });
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

    fnLogger(fileExt, "insertSpace", "Y");
    return finalResult
  }
  catch (err: any) {
		fnLogger(fileExt, "insertSpace", "E", err.message);
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

    fnLogger(fileExt, "lineBreak", "N");
    return finalResult;
  }
  catch (err: any) {
		fnLogger(fileExt, "lineBreak", "E", err.message);
    return contentsParam;
  }
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
    fnLogger(fileExt, "finalCheck", "N");
    return contentsParam;
  }
  catch (err: any) {
		fnLogger(fileExt, "finalCheck", "E", err.message);
    return contentsParam;
  }
};