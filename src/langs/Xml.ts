// Xml.ts

import { lodash, strip, getPrettier, getPrettierPluginXml } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
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
		const prettier = await getPrettier();
    const prettierStatus = prettier ? "prettier:loaded" : "prettier:missing";
    logger(prettier ? "debug" : "warn", `${fileExt}:prettierFormat - ${prettierStatus}`);

		// 1. parser
    const parser = "xml";

    // 2. plugin
    const plugin = await getPrettierPluginXml();
    const pluginStatus = plugin ? "plugin:xml:loaded" : "plugin:xml:missing";
    logger(plugin ? "debug" : "warn", `${fileExt}:prettierFormat - ${pluginStatus}`);

		// 3. options
		const baseOptions: PrettierOptions = {
			parser: parser,
			plugins: plugin ? [plugin] : [],
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
      filepath: fileName,
      __embeddedInHtml: true,
    };
    const formatterAvailable = prettier && plugin && typeof prettier.format === "function";
    logger(formatterAvailable ? "debug" : "warn", `${fileExt}:prettierFormat - ${formatterAvailable ? "formatter:ready" : "formatter:missing"}`);
    const finalResult = formatterAvailable
    ? await (async () => {
      logger("debug", `${fileExt}:prettierFormat - format:start`);
      const formatted = await prettier.format(contentsParam, baseOptions);
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

    logger("debug", `${fileExt}:finalCheck - Y`);
    return finalResult
  }
  catch (err: any) {
    logger("error", `${fileExt}:finalCheck - ${err.message}`);
    return contentsParam;
  }
};
