// Css.ts

import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
) => {
  try {
    const minifyResult = contentsParam;

    const { default: stripJsonComments } = await import("strip-json-comments");
    const finalResult = stripJsonComments(minifyResult, {
      trailingCommas: false,
      whitespace: true
    });

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
    const prettierOptions: Options = {
      parser: "json",
      singleQuote: false,
      printWidth: 1000,
      tabWidth: fileTabSize,
      useTabs: true,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
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