// Yaml.ts

import * as vscode from "vscode";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import type {Plugin as PrettierPlugin} from "prettier";
import strip from "strip-comments";
import type {Options as StripOptions} from "strip-comments";
import { createRequire } from "module";

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
			language: "yaml",
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(
			minifyResult,
			baseOptions
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
    const baseOptions: PrettierOptions = {
      parser: "yaml",
      plugins: [],
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
      filepath: fileName
    };

    try {
      const finalResult = await prettier.format(contentsParam, baseOptions);
      return finalResult;
    }
    catch (innerErr: any) {
      const mod = await import("prettier/plugins/yaml");
      const yamlPlugin: PrettierPlugin = ((mod as any)?.default ?? mod) as PrettierPlugin;

      if ((yamlPlugin as any)?.parsers?.yaml == null) {
        throw new Error("ParserNotRegistered");
      }

      const finalResult = await prettier.format(contentsParam, {
        ...baseOptions,
        plugins: [yamlPlugin]
      });
      return finalResult;
    }
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
    const finalResult = contentsParam;

    console.log(`_____________________\n [${fileExt}] 'finalCheck' Activated!`);
    return finalResult
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'finalCheck' Error!\n${err.message}`);
    return contentsParam;
  }
};