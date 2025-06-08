// Sql.ts

import type { FormatOptionsWithLanguage } from "sql-formatter";
import * as prettier from "sql-formatter";
import * as vscode from "vscode";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
) => {
  try {

    // sql is not needed remove comments
    const minifyResult = contentsParam;
    const finalResult = minifyResult;

    console.log(`_____________________\n 'removeComments' Activated!`);
    return finalResult;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 1. prettierFormat -------------------------------------------------------------------------------
export const prettierFormat = async (
  contentsParam: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string
) => {
  try {
    const prettierOptions: FormatOptionsWithLanguage = {
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

    console.log(`_____________________\n 'prettierFormat' Activated!`);
    const finalResult = prettier.format(contentsParam, prettierOptions);
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
  contentsParam: string
) => {
  try {
    const finalResult = contentsParam;

    console.log(`_____________________\n 'insertSpace' Not Supported!`);
    return finalResult;
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
    const finalResult = contentsParam;

    console.log(`_____________________\n 'insertLine' Not Supported!`);
    return finalResult;
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
    const finalResult = contentsParam;

    console.log(`_____________________\n 'lineBreak' Not Supported!`);
    return finalResult;
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
    console.log(`_____________________\n 'finalCheck' Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};