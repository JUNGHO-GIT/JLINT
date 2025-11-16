// Javascript.ts

import { lodash, jsMinify, strip, getPrettier } from "@exportLibs";
import type { PrettierOptions, StripOptions } from "@exportLibs";
import { logger, modal } from "@exportScripts";

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
			await jsMinify(contentsParam, {
				compress: false,
				mangle: false,
				format: {
					comments: false,
				},
			}).then((result) => result.code)
		);

		const baseOptions: StripOptions = {
      language: "javascript",
      preserveNewlines: false,
      keepProtected: false,
      block: true,
      line: true,
		};

    const finalResult = strip(
      minifyResult || "",
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
		logger("debug", `${fileExt}:prettierFormat`, "start");
		// 0. prettier
		const prettier = await getPrettier();
		const prettierStatus = prettier ? "prettier:loaded" : "prettier:missing";
		logger(prettier ? "debug" : "warn", `${fileExt}:prettierFormat`, prettierStatus);

		// 1. parser
    const parser = "babel-flow";

		// 2. plugin

		// 3. options
    const baseOptions: PrettierOptions = {
      parser: parser,
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
    const formatterAvailable = prettier && typeof prettier.format === "function";
    logger(formatterAvailable ? "debug" : "warn", `${fileExt}:prettierFormat`, formatterAvailable ? "formatter:ready" : "formatter:missing");
    const finalResult = formatterAvailable
    ? await (async () => {
      logger("debug", `${fileExt}:prettierFormat`, "format:start");
      const formatted = await prettier.format(contentsParam, baseOptions);
      logger("debug", `${fileExt}:prettierFormat`, "format:success");
      return formatted;
    })()
    : (() => {
      logger("warn", `${fileExt}:prettierFormat`, "format:skipped");
      return contentsParam;
    })();
    logger("debug", `${fileExt}:prettierFormat`, "end");
		return finalResult;
	}
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[Jlint]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

  	logger("error", `${fileExt}:prettierFormat`, msgResult);
  	modal("error", fileExt, msgResult);
    return contentsParam;
  }
};

// 2. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
  contentsParam: string,
	fileExt: string
) => {
  try {
    const rules1 = (
      /(\s*)(public|private|function)(\s*)(.*?)(\s*)(?:[(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
    );
    const rules2 = (
      /(\s*)(public|private|function)(\s*)([(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
    );
    const rules3 = (
      /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}${p[2]} ${p[4]} (${p[7]}) {`
		))
		.replace(rules2, (...p: any[]) => (
			`${p[1]}${p[2]} (${p[6]}) {`
		))
		.replace(rules3, (...p: any[]) => (
			`${p[2]}${p[3]}${p[4]}${p[5]}`
		))
		.value();

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
    const rules1 = (
      /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm
    );
    const rules2 = (
      /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm
    );
    const rules3 = (
      /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm
    );
    const rules4 = (
      /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm
    );
    const rules5 = (
      /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => {
			const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
			const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
			return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
		})
		.replace(rules2, (...p: any[]) => {
			const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
			const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
			return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
		})
		.replace(rules3, (...p: any[]) => {
			const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
			const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
			return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
		})
		.replace(rules4, (...p: any[]) => {
			const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
			const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
			return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
		})
		.replace(rules5, (...p: any[]) => {
			const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
			const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
			return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
		})
		.value();

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
    const rules1 = (
      /(>)(\n*)(?:\})(?:\n*)(function)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}\n${p[3]}`
		))
		.value();

  	logger("debug", `${fileExt}:lineBreak`, "Y");
    return finalResult
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
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p: any[]) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
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