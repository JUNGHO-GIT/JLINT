/**
 * @file Java.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { strip, getPrettier, getPrettierPluginJava } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
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

    const baseOptions: StripOptions = {
      language: `java`,
      preserveNewlines: false,
      keepProtected: false,
      block: true,
      line: true,
    };

    const finalResult = strip(
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
    const parser = `java`;

    // 2. plugin
    const plugin = await getPrettierPluginJava();
    const pluginStatus = plugin ? `plugin:java:loaded` : `plugin:java:missing`;
    logger(plugin ? `debug` : `warn`, `${fileExt}:prettierFormat - ${pluginStatus}`);

    // 3. options
    const baseOptions: PrettierOptions = {
      parser: parser,
      plugins: plugin ? [plugin] : [],
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
      __embeddedInHtml: true,
      filepath: fileName,
    };

    const formatterAvailable = prettier && plugin && typeof prettier.format === `function`;
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
    const msg = error.toString().trim().replaceAll(/\u001B\[[\d;]*[FGKm]/g, ``);
    const msgRegex = /(\s*)(Sad sad panda)(.*)(line:)(\s*)(\d+)([\S\s]*?)(column:)(\s*)(\d+)([\S\s]*)(->)(.*)(<-)([\S\s]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError column = [ $10 ]\nError Site = [ $13 ]`;
    const msgResult = msg.replaceAll(msgRegex, msgRegexReplace);

    logger(`error`, `${fileExt}:prettierFormat - ${msgResult}`);
    modal(`error`, `${fileExt}: Prettier Format Error:\n${msgResult}`);
    return contentsParam;
  }
};

// 3. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    const rules1 = (
      /(\s*)(\))(\s+)(;)/gm
    );
    const rules2 = (
      /(\s*)(@)(\s*)([\S\s]*?)(\s*)(\()/gm
    );
    const rules3 = (
      /(\s*?)(ception)({)/gm
    );

    const finalResult: string = contentsParam
    .replaceAll(rules1, (...p: unknown[]) => (
      `${p[1]}${p[2]}${p[4]}`
    ))
    .replaceAll(rules2, (...p: unknown[]) => (
      `${p[1]}${p[2]}${p[4]} ${p[6]}`
    ))
    .replaceAll(rules3, (...p: unknown[]) => (
      `${p[2]} ${p[3]}`
    ));

    logger(`debug`, `${fileExt}:insertSpace - Y`);
    return finalResult;
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
    return contentsParam;
  }
};

// 2. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    const rules1 = (
      /(?!^\/\/--)(^(?!\n)\s*)(@[A-Z].*?(\n\s*)(?=(public|private|function|class))|(public|private|function|class))/gm
    );

    const finalResult: string = contentsParam
    .replaceAll(rules1, (...p: unknown[]) => {
      const p1 = p[1] as string;
      const p2 = p[2] as string;
      const spaceSize = p1.length + (`// `).length + (`-`).length;
      const insertSize = 100 - spaceSize;
      const insetLine = (`// ${`-`.repeat(insertSize)}`);
      return `${p1}${insetLine}\n${p1}${p2}`;
    });

    logger(`debug`, `${fileExt}:insertLine - Y`);
    return finalResult;
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
    return contentsParam;
  }
};
