// Typescriptreact.ts

import * as vscode from "vscode";
import lodash from "lodash";
import prettier from "prettier";
import type {Options as PrettierOptions} from "prettier";
import type {Plugin as PrettierPlugin} from "prettier";
import { minify } from "terser";
import strip from "strip-comments";
import type {Options as StripOptions} from "strip-comments";
import { createRequire } from "module";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
) => {
  try {
		const minifyResult = (
			await minify(contentsParam, {
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
    const baseOptions: PrettierOptions = {
      parser: "babel-ts",
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
    };

    console.log(`_____________________\n 'prettierFormat' Activated!`);
    const finalResult = prettier.format(contentsParam, baseOptions);
    return finalResult;
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
    const rules1 = (
      /(\s*)(public|private|function)(\s*)(.*?)(\s*)(?:[(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
    );
    const rules2 = (
      /(\s*)(public|private|function)(\s*)([(])(\s*)(.*?)(\s*)(?:[)])(\s*)([{])/gm
    );
    const rules3 = (
      /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        `${p[1]}${p[2]} ${p[4]} (${p[7]}) {`
      ))
      .replace(rules2, (...p) => (
        `${p[1]}${p[2]} (${p[6]}) {`
      ))
      .replace(rules3, (...p) => (
        `${p[2]}${p[3]}${p[4]}${p[5]}`
      ))
      .value()
    );

    console.log(`_____________________\n 'insertSpace' Activated!`);
    return finalResult
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

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => {
        const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
      })
      .replace(rules2, (...p) => {
        const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
      })
      .replace(rules3, (...p) => {
        const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
      })
      .replace(rules4, (...p) => {
        const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
      })
      .replace(rules5, (...p) => {
        const spaceSize = 100 - (p[1].length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p[1]}${insetLine}\n${p[1]}${p[2]}${p[3]}`;
      })
      .value()
    );

    console.log(`_____________________\n 'insertLine' Activated!`);
    return finalResult
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
    const rules1 = (
      /(>)(\n*)(?:\})(?:\n*)(function)/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        `${p[1]}\n${p[3]}`
      ))
      .value()
    );

    console.log(`_____________________\n 'lineBreak' Activated!`);
    return finalResult
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
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
      ))
      .value()
    );

    console.log(`_____________________\n 'finalCheck' Activated!`);
    return finalResult
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};