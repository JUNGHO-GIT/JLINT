// Xml.ts

import { lodash, prettier, strip } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
import type { PrettierPlugin } from "@exportLibs";
import { logger, notify } from "@exportScripts";

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

  	logger("debug", `${fileExt}:removeComments`, "Y");
    return finalResult;
  }
  catch (err: any) {
  	logger("error", `${fileExt}:removeComments`, err.message);
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
    // 공통 옵션
    const baseOptions: PrettierOptions = {
      parser: "xml",
      plugins: [],
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
      filepath: fileName
    };

    // 1차: ESM 동적 임포트로 플러그인 객체 주입
    try {
      const mod = await import("@prettier/plugin-xml");
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
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

  	logger("error", `${fileExt}:prettierFormat`, msgResult);
  notify("error", fileExt, msgResult);
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

  	logger("debug", `${fileExt}:insertSpace`, "Y");
    return finalResult
  }
  catch (err: any) {
  	logger("error", `${fileExt}:insertSpace`, err.message);
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

  	logger("debug", `${fileExt}:insertLine`, "Y");
    return finalResult
  }
  catch (err: any) {
  	logger("error", `${fileExt}:insertLine`, err.message);
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

  	logger("debug", `${fileExt}:lineBreak`, "N");
    return finalResult;
  }

	catch (err: any) {
  logger("error", `${fileExt}:lineBreak`, err.message);
    return contentsParam;
  }
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string,
	fileExt: string
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
		.replace(rules1, (...p: any[]) => (
			`, `
		))
		.replace(rules2, (...p: any[]) => (
			`${p[1]}, `
		))
		.replace(rules3, (...p: any[]) => (
			`${p[1]} = ${p[5]}`
		))
		.value();

  	logger("debug", `${fileExt}:finalCheck`, "Y");
    return finalResult
  }
  catch (err: any) {
  	logger("error", `${fileExt}:finalCheck`, err.message);
    return contentsParam;
  }
};
