/**
 * @file Json.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { stripJsonComments, getPrettier } from "@exportLibs";
import type { PrettierOptions, StripJsonOptions } from "@exportLibs";
import { logger, modal } from "@exportScripts";
import { CommonType } from "@exportTypes";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {
  try {
    const minifyResult = (
      contentsParam
    );

    const baseOptions: StripJsonOptions = {
      trailingCommas: false,
      whitespace: true,
    };

    const finalResult = stripJsonComments(
      minifyResult,
      baseOptions,
    );

    logger(`debug`, `${fileExt}:removeComments - Y`);
    return finalResult;
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:removeComments - ${(error as Error).message}`);
    return contentsParam;
  }
};

// 1. prettierFormat -------------------------------------------------------------------------------
export const prettierFormat = async (
  commonParam: CommonType,
  contentsParam: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {
  try {
    logger(`debug`, `${fileExt}:prettierFormat - start`);
    // 0. prettier
    const prettier = await getPrettier();
    const prettierStatus = prettier ? `prettier:loaded` : `prettier:missing`;
    logger(prettier ? `debug` : `warn`, `${fileExt}:prettierFormat - ${prettierStatus}`);

    // 1. parser
    const parser = `json`;

    // 2. plugin

    // 3. options
    const baseOptions: PrettierOptions = {
      parser: parser,
      singleQuote: commonParam.quoteType === `single`,
      printWidth: 1000,
      tabWidth: commonParam.indentSize,
      useTabs: commonParam.useTabs,
      quoteProps: `as-needed`,
      jsxSingleQuote: commonParam.quoteType === `single`,
      trailingComma: `all`,
      bracketSpacing: false,
      jsxBracketSameLine: false,
      arrowParens: `always`,
      rangeStart: 0,
      rangeEnd: Number.POSITIVE_INFINITY,
      requirePragma: false,
      insertPragma: false,
      proseWrap: `preserve`,
      htmlWhitespaceSensitivity: `ignore`,
      vueIndentScriptAndStyle: true,
      endOfLine: fileEol === `lf` ? `lf` : `crlf`,
      embeddedLanguageFormatting: `auto`,
      singleAttributePerLine: false,
      bracketSameLine: false,
      semi: true,
      filepath: fileName,
      __embeddedInHtml: true,
    };
    const formatterAvailable = prettier && typeof prettier.format === `function`;
    logger(formatterAvailable ? `debug` : `warn`, `${fileExt}:prettierFormat - ${formatterAvailable ? `formatter:ready` : `formatter:missing`}`);
    const finalResult = formatterAvailable
			? await (async () => {
			  logger(`debug`, `${fileExt}:prettierFormat - format:start`);
			  const formatted = await prettier.format(contentsParam, baseOptions);
			  logger(`debug`, `${fileExt}:prettierFormat - format:success`);
			  return formatted;
			})()
			: (() => {
			  logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
			  return contentsParam;
			})();
    logger(`debug`, `${fileExt}:prettierFormat - end`);
    return finalResult;
  }
  catch (error: unknown) {
    const msg = (error as Error).message.toString().trim().replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
    const msgRegex = /([\S\s]*)(\s*)(https)(.*?)(\()(.*?)(\))([\S\s]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replaceAll(msgRegex, msgRegexReplace);

    logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
    modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
    return contentsParam;
  }
};

// 2. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    const finalResult = contentsParam;

    logger(`debug`, `${fileExt}:insertLine - Y`);
    return finalResult;
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
    return contentsParam;
  }
};

// 3. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    const finalResult = contentsParam;

    logger(`debug`, `${fileExt}:insertSpace - Y`);
    return finalResult;
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
    return contentsParam;
  }
};
