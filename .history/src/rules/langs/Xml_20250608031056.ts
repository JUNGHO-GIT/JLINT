// Xml.ts

import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";
import * as lodash from "lodash";
import strip from "strip-comments";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
) => {
  try {
    const minifyResult = contentsParam;
    const stripResult = strip(minifyResult, {
      language: "xml",
      preserveNewlines: false,
      keepProtected: false,
      block: true,
      line: true,
    });

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
  fileName: string,
  fileTabSize: number,
  fileEol: string
) => {
  try {
    const xmlPlugin = await import("@prettier/plugin-xml");
    const prettierOptions: Options = {
      parser: "xml",
      plugins: [xmlPlugin],
      singleQuote: false,
      printWidth: 120,
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
      htmlWhitespaceSensitivity: "css",
      vueIndentScriptAndStyle: true,
      endOfLine: fileEol === "lf" ? "lf" : "crlf",
      embeddedLanguageFormatting: "auto",
      singleAttributePerLine: false,
      bracketSameLine: false,
      semi: true,
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
    const rules1 = (
      /( , )/gm
    );
    const rules2 = (
      /(\s*)(\n+)(\s*)(,)(\s*)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1) => (
        `, `
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5) => (
        `${p1}, `
      ))
      .value()
    );

    console.log(`_____________________\n 'finalCheck' Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};