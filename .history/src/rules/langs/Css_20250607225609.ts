// Css.ts

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
    const { default: CleanCSS } = await import("clean-css");
    const minifyResult = new CleanCSS({
      format: {
        breaks: {
          afterAtRule: true,
          afterBlockBegins: true,
          afterBlockEnds: true,
          afterComment: true,
          afterProperty: true,
          afterRuleBegins: true,
          afterRuleEnds: true,
          beforeBlockEnds: true,
          betweenSelectors: true,
        },
        spaces: {
          aroundSelectorRelation: true,
          beforeBlockBegins: true,
          beforeValue: true,
        },
        breakWith: '\n',
        indentBy: 2,
        indentWith: 'tab',
        semicolonAfterLastProperty: true,
        wrapAt: 100,
      },
      level: {
        1: {
          all: false,
          specialComments: 'none',
          selectorsSortingMethod: 'standard',
          normalizeUrls: false,
          roundingPrecision: false,
          cleanupCharsets: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFont: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeWhitespace: true,
          removeNegativePaddings: true,
          removeQuotes: false,
          replaceMultipleZeros: false,
          replaceTimeUnits: false,
          replaceZeroUnits: false,
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true,
        },
        2: {
          all: false,
          mergeMedia: true,
          mergeAdjacentRules: true,
          mergeIntoShorthands: true,
          mergeNonAdjacentRules: true,
          removeDuplicateFontRules: true,
          removeDuplicateMediaBlocks: true,
          removeDuplicateRules: true,
          removeUnusedAtRules: true,
          reduceNonAdjacentRules: true,
          removeEmpty: true,
          overrideProperties: true,
        },
      },
    }).minify(contentsParam).styles;

    const stripResult = strip(minifyResult, {
      language: "css",
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
      parser: "css",
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
    console.log(`_____________________\n 'insertLine' Not Supported!`);
    return contentsParam;
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
    console.log(`_____________________\n 'insertSpace' Not Supported!`);
    return contentsParam;
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
    console.log(`_____________________\n 'finalCheck' Not Supported!`);
    return contentsParam;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};