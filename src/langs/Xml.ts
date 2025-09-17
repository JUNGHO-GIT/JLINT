// Xml.ts

import * as vscode from "vscode";
import lodash from "lodash";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import type {Plugin as PrettierPlugin} from "prettier";
import strip from "strip-comments";
import type {Options as StripOptions} from "strip-comments";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
) => {
  try {
    const minifyResult = (
			contentsParam
		);

		const baseOptions: StripOptions = {
			language: "xml",
			preserveNewlines: false,
			keepProtected: false,
			block: true,
			line: true,
		};

		const finalResult = strip(
			minifyResult,
			baseOptions
		);

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
    // 공통 옵션
    const baseOptions: PrettierOptions = {
      parser: "xml",
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

    // 1차: ESM 동적 임포트로 플러그인 객체 주입
    try {
      const mod = await import("prettier-plugin-xml");
      const xmlPlugin: PrettierPlugin = ((mod as any)?.default ?? mod) as PrettierPlugin;

      if ((xmlPlugin as any)?.parsers?.xml == null) {
        throw new Error("ParserNotRegistered");
      }

      const finalResult = await prettier.format(contentsParam, {
        ...baseOptions,
        plugins: [xmlPlugin]
      });
      return finalResult;
    }
		// 2차: CJS 전용 환경에서 require로 재시도
    catch (innerErr: any) {
      try {
        const maybeRequire = (globalThis as any).require ?? (typeof require !== "undefined" ? (require as any) : undefined);
        if (!maybeRequire) {
          throw new Error("RequireNotAvailable");
        }

        const reqMod = maybeRequire("@prettier/plugin-xml");
        const xmlPlugin2: PrettierPlugin = (reqMod?.default ?? reqMod) as PrettierPlugin;

        if ((xmlPlugin2 as any)?.parsers?.xml == null) {
          throw new Error("ParserNotRegistered");
        }

        const finalResult = await prettier.format(contentsParam, {
          ...baseOptions,
          plugins: [xmlPlugin2]
        });
        return finalResult;
      }
      catch (fallbackErr: any) {
        throw fallbackErr;
      }
    }
  }
  catch (err: any) {
    const msg = err.message?.toString()?.trim()?.replace(/\x1B\[[0-9;]*[mGKF]/g, "") ?? "unknown";
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
    const rules1 = (
      /( , )/gm
    );
    const rules2 = (
      /(\s*)(\n+)(\s*)(,)(\s*)/gm
    );
    const rules3 = (
      /([a-zA-Z0-9$#]+)(\s*)(=)(\s*)([a-zA-Z0-9$#]+)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`, `
		))
		.replace(rules2, (...p) => (
			`${p[1]}, `
		))
		.replace(rules3, (...p) => (
			`${p[1]} = ${p[5]}`
		))
		.value();

    console.log(`_____________________\n 'finalCheck' Activated!`);
    return finalResult
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};
