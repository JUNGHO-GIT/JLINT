// Css.ts

import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const prettierFormat = async (
  contentsParam: string,
  fileName: string
) => {
  try {
    // 1. parse
    const prettierOptions: Options = {
      parser: "json",
      parentParser: "json",
      singleQuote: false,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      trailingComma: "all",
      bracketSpacing: false,
      jsxBracketSameLine: true,
      arrowParens: "always",
      rangeStart: 0,
      rangeEnd: Infinity,
      requirePragma: false,
      insertPragma: false,
      proseWrap: "preserve",
      htmlWhitespaceSensitivity: "css",
      vueIndentScriptAndStyle: true,
      endOfLine: "lf",
      embeddedLanguageFormatting: "auto",
      bracketSameLine: true,
      semi: true,
      singleAttributePerLine: false,
      __embeddedInHtml: true
    };

    console.log(`_____________________\n prettierFormat Activated!`);
    const prettierCode = await prettier.format(contentsParam, prettierOptions);
    return prettierCode;
  }
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

    console.error(`_____________________\nprettierFormat Error! ('${fileName}')\n${msgResult}`);
    vscode.window.showInformationMessage(msgResult, { modal: true });
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string
) => {
  try {
    console.log(`_____________________\n insertLine Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const lineBreak = async (
  contentsParam: string
) => {
  try {
    console.log(`_____________________\n lineBreak Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const space = async (
  contentsParam: string
) => {
  try {
    console.log(`_____________________\n space Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const spellCheck = async (
  contentsParam: string
) => {
  try {
    console.log(`_____________________\n spellCheck Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};