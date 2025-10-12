// Sql.ts

import * as vscode from "vscode";
import lodash from "lodash";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import strip from "strip-comments";
import type {Options as StripOptions} from "strip-comments";
import type { FormatOptionsWithLanguage } from "sql-formatter";
import { fnLogger } from "@scripts/utils";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
	fileExt: string
) => {
  try {

    // sql is not needed remove comments
    const minifyResult = (
			contentsParam
		);

		const finalResult = (
			minifyResult
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
  contentsParam: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
	fileExt: string
) => {
  try {
    const baseOptions: FormatOptionsWithLanguage = {
      language: "mysql",
      tabWidth: fileTabSize,
      useTabs: true,
      keywordCase: "upper",
      dataTypeCase: "upper",
      functionCase: "upper",
      identifierCase: "upper",
      indentStyle: "standard",
      logicalOperatorNewline: "before",
      expressionWidth: 100,
      linesBetweenQueries: 1,
      denseOperators: false,
      newlineBeforeSemicolon: false
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

// 3. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
    const finalResult = contentsParam;

    fnLogger(fileExt, "insertLine", "Y");
    return finalResult
  }
  catch (err: any) {
    fnLogger(fileExt, "insertLine", "E", err.message);
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