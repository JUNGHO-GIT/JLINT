// Javascript.ts

import * as lodash from "lodash";
import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";
import strip from "strip-comments";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
) => {
  try {
    const { minify } = await import("terser");
    const minifyResult = await minify(contentsParam, {
      compress: false,
      mangle: true,
      format: {
        comments: false,
      },
    }).then((result) => result.code);

    const stripResult = strip(minifyResult, {
      language: "javascript",
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
  fileName: string
) => {
  try {
    const prettierOptions: Options = {
      parser: "babel-flow",
      singleQuote: false,
      printWidth: 120,
      tabWidth: 2,
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
      endOfLine: "lf",
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

// 2. insertLine -----------------------------------------------------------------------------------
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

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rules2, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rules3, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rules4, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rules5, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .value()
    );

    console.log(`_____________________\n 'insertLine' Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 3. lineBreak ------------------------------------------------------------------------------------
export const lineBreak = async (
  contentsParam: string
) => {
  try {
    const rules1 = (
      /(>)(\n*)(?:\})(?:\n*)(function)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3) => (
        `${p1}\n${p3}`
      ))
      .value()
    );

    console.log(`_____________________\n 'lineBreak' Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// 4. insertSpace ----------------------------------------------------------------------------------
export const insertSpace = async (
  contentsParam: string
) => {
  try {
    const rules1 = (
      /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)([\s\S]*?)(\s*?)(\{)/gm
    );
    const rules2 = (
      /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14) => (
        `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5) => (
        `${p2}${p3}${p4}${p5}`
      ))
      .value()
    );

    console.log(`_____________________\n 'insertSpace' Activated!`);
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
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => (
        `${p1}${p2}${p3}${p4}${p5}${p13}`
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