// Sql.ts

import type { FormatOptionsWithLanguage } from "sql-formatter";
import * as prettier from "sql-formatter";
import * as vscode from "vscode";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
) => {
  try {

    // sql is not needed remove comments
    const minifyResult = contentsParam;
    const stripResult = minifyResult;

    console.log(`_____________________\n 'removeComments' Activated!`);
    return stripResult;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 1. prettierFormat -------------------------------------------------------------------------------
export const prettierFormat = async (
  contentsParam: string,
  fileName: string
) => {
  try {
    const prettierOptions: FormatOptionsWithLanguage = {
      language: "mysql",
      tabWidth: 2,
      useTabs: true,
      keywordCase: "upper",
      dataTypeCase: "upper",
      functionCase: "upper",
      identifierCase: "upper",
      indentStyle: "standard",
      logicalOperatorNewline: "before",
      expressionWidth: 50,
      linesBetweenQueries: 1,
      denseOperators: false,
      newlineBeforeSemicolon: false
    };

    console.log(`_____________________\n 'prettierFormat' Activated!`);
    const prettierCode = prettier.format(contentsParam, prettierOptions);
    return prettierCode;
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
  contentsParam: string
) => {
  try {
    const result = contentsParam;

    console.log(`_____________________\n 'insertSpace' Not Supported!`);
    return result;
  }insertSpace' Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 3. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string
) => {
  try {
    const result = contentsParam;

    console.log(`_____________________\n 'insertLine' Not Supported!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 4. lineBreak ------------------------------------------------------------------------------------
export const lineBreak = async (
  contentsParam: string
) => {
  try {
    const result = contentsParam;

    console.log(`_____________________\n 'lineBreak' Not Supported!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string
) => {
  try {
    const result = contentsParam;

    console.log(`_____________________\n 'insertSpace' Not Supported!`);
    return result;
  }finalCheck' Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};