// Html.ts

import { load } from "cheerio";
import lodash from "lodash";
import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const prettierFormat = async (
  contentsParam: string,
  fileName: string
) => {
  try {

    // 1. check if head tags exist
    const headStartIndex = contentsParam.indexOf("<head>");
    const headEndIndex = contentsParam.indexOf("</head>");

    let headContent: string = "";
    let withoutHead: string = contentsParam;

    // if <head> tag exists
    if (headStartIndex !== -1 && headEndIndex !== -1) {
      // head tags exist, extract head content
      const headStart = headStartIndex + "<head>".length;
      const headEnd = headEndIndex;
      headContent = contentsParam.slice(headStart, headEnd);

      // remove head content
      withoutHead = contentsParam.replace(headContent, "");
    }

    // 2. cheerio
    let $ = load(withoutHead);
    let html = $.html();

    // 3. replace head content
    if (headContent.length > 0) {
      $("head").html(headContent);
      html = $.html();
      contentsParam = html;
    }

    const prettierOptions: Options = {
      parser: "html",
      parentParser: "html",
      singleQuote: false,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      trailingComma: "all",
      bracketSpacing: false,
      jsxBracketSameLine: true,
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
      bracketSameLine: true,
      semi: true,
      singleAttributePerLine: false,
      __embeddedInHtml: true
    };

    console.log(`_____________________\n prettierFormat Activated!`);
    const prettierCode = await prettier.format(contentsParam, prettierOptions);
    return prettierCode;
  }
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
    const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError Site = $8`;
    const msgResult = msg.replace(msgRegex, msgRegexReplace);

    console.error(`_____________________\nprettierFormat Error! ('${fileName}')\n${msgResult}`);
    vscode.window.showInformationMessage(msgResult, { modal: true });
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string
) => {
  try {
    const rules1
    = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
    const rules2
    = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
    const rules3
    = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
    const rules4
    = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
    const rules5
    = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
    const rules6
    = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
    const rules7
    = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
    const rules8
    = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
    const rules9
    = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;

    const result = lodash.chain(contentsParam)
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
    .replace(rules6, (_, p1, p2, p3) => {
      const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
      const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
      return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
    })
    .replace(rules7, (_, p1, p2, p3) => {
      const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
      const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
      return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
    })
    .replace(rules8, (_, p1, p2, p3) => {
      const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
      const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
      return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
    })
    .replace(rules9, (_, p1, p2, p3) => {
      const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
      const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
      return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
    })
    .value();

    console.log(`_____________________\n insertLine Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const lineBreak = async (
  contentsParam: string
) => {
  try {
    const rules1
    = /(?:\n*)(\s*)(<\/body>)(\s*?)/gm;
    const rules2
    = /(.*?)(\n*)(\s*)(\/\/ -.*>)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3) => {
      return `\n\n${p1}${p2}${p3}`;
    })
    .replace(rules2, (_, p1, p2, p3, p4) => {
      return `${p1}\n\n${p3}${p4}`;
    })
    .value();

    console.log(`_____________________\n lineBreak Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const space = async (
  contentsParam: string
) => {
  try {
    const rules1
    = /(\s*)(\))(\s+)(;)/gm;
    const rules2
    = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
    const rules3
    = /(\s*?)(ception)(\{)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4) => (
      `${p1}${p2}${p4}`
    ))
    .replace(rules2, (_, p1, p2, p3, p4, p5, p6) => (
      `${p1}${p2}${p4} ${p6}`
    ))
    .replace(rules3, (_, p1, p2, p3) => (
      `${p2} ${p3}`
    ))
    .value();

    console.log(`_____________________\n space Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const spellCheck = async (
  contentsParam: string
) => {
  try {
    const rules1
    = /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
      return `${p1}${p2}${p3}${p4}${p11}`;
    })
    .value();

    console.log(`_____________________\n spellCheck Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
}