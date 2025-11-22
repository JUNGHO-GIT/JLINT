// Sql.ts

import { getSqlFormatter } from "@exportLibs";
import type { FormatOptionsWithLanguage } from "@exportLibs";
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

		const finalResult = (
			minifyResult
		);

    logger("debug", `${fileExt}:removeComments - Y`);
    return finalResult;
  }
  catch (err: any) {
    logger("error", `${fileExt}:removeComments - ${err.message}`);
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
    logger("debug", `${fileExt}:prettierFormat - start`);
		// 0. prettier
		const sqlFormatter = await getSqlFormatter();
    const formatterStatus = sqlFormatter ? "sqlFormatter:loaded" : "sqlFormatter:missing";
    logger(sqlFormatter ? "debug" : "warn", `${fileExt}:prettierFormat - ${formatterStatus}`);

		// 1. parser
		const parser = "mysql";

		// 2. plugin

		// 3. options
    const baseOptions: FormatOptionsWithLanguage = {
      language: parser,
      tabWidth: confParam.tabSize,
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
    const formatterAvailable = sqlFormatter && typeof sqlFormatter.format === "function";
    logger(formatterAvailable ? "debug" : "warn", `${fileExt}:prettierFormat - ${formatterAvailable ? "formatter:ready" : "formatter:missing"}`);
    const finalResult = formatterAvailable
    ? await (async () => {
      logger("debug", `${fileExt}:prettierFormat - format:start`);
      const formatted = await sqlFormatter.format(contentsParam, baseOptions);
      logger("debug", `${fileExt}:prettierFormat - format:success`);
      return formatted;
    })()
    : (() => {
      logger("warn", `${fileExt}:prettierFormat - format:skipped`);
      return contentsParam;
    })();
    logger("debug", `${fileExt}:prettierFormat - end`);
		return finalResult;
	}
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

    logger("error", `${fileExt}:prettierFormat - ${msgResult}`);
		notify("error", `${fileExt}: Prettier Format Error:\n${msgResult}`);
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

    logger("debug", `${fileExt}:insertSpace - Y`);
    return finalResult
  }
  catch (err: any) {
    logger("error", `${fileExt}:insertSpace - ${err.message}`);
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

    logger("debug", `${fileExt}:insertLine - Y`);
    return finalResult
  }
  catch (err: any) {
    logger("error", `${fileExt}:insertLine - ${err.message}`);
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

    logger("debug", `${fileExt}:lineBreak - N`);
    return finalResult;
  }
  catch (err: any) {
    logger("error", `${fileExt}:lineBreak - ${err.message}`);
    return contentsParam;
  }
};

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
  logger("debug", `${fileExt}:finalCheck - N`);
    return contentsParam;
  }
  catch (err: any) {
    logger("error", `${fileExt}:finalCheck - ${err.message}`);
    return contentsParam;
  }
};