// Sql.ts

import * as vscode from "vscode";
import lodash from "lodash";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import type {Plugin as PrettierPlugin} from "prettier";
import strip from "strip-comments";
import type {Options as StripOptions} from "strip-comments";
import { createRequire } from "module";
import type { FormatOptionsWithLanguage } from "sql-formatter";

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

    console.log(`_____________________\n [${fileExt}] 'removeComments' Activated!`);
    return finalResult;
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'removeComments' Error!\n${err.message}`);
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

    console.log(`_____________________\n [${fileExt}] 'prettierFormat' Activated!`);
    const finalResult = prettier.format(contentsParam, baseOptions);
    return finalResult;
  }
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

    console.error(`_____________________\n 'prettierFormat' Error! ('${fileName}')\n${msgResult}`);
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

    console.log(`_____________________\n [${fileExt}] 'insertSpace' Activated!`);
    return finalResult
  }
  catch (err: any) {
		console.error(`_____________________\n [${fileExt}] 'insertSpace' Error!\n${err.message}`);
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

    console.log(`_____________________\n [${fileExt}] 'insertLine' Activated!`);
    return finalResult
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'insertLine' Error!\n${err.message}`);
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

    console.log(`_____________________\n [${fileExt}] 'lineBreak' Not Supported!`);
    return finalResult;
  }
  catch (err: any) {
		console.error(`_____________________\n [${fileExt}] 'lineBreak' Error!\n${err.message}`);
    return contentsParam;
  }
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
    console.log(`_____________________\n [${fileExt}] 'finalCheck' Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'finalCheck' Error!\n${err.message}`);
    return contentsParam;
  }
};