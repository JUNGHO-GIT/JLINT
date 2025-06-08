// Java.ts

import * as lodash from "lodash";
import type {Options} from "prettier";
import * as prettier from "prettier";
import * as vscode from "vscode";
import strip from "strip-comments";

// 0. removeComments -------------------------------------------------------------------------------
export const removeComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
) => {
  try {
    const minifyResult = contentsParam;

    const stripResult = strip(minifyResult, {
      language: "java",
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
  fileName: string,
  fileTabSize: number,
  fileEol: string
) => {
  try {
    const javaPlugin = await import("prettier-plugin-java");
    const prettierOptions: Options = {
      parser: "java",
      plugins: [javaPlugin],
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
    const finalResult = prettier.format(contentsParam, prettierOptions);
    return finalResult;
  }
  catch (err: any) {
    const msg = err.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /(\s*)(Sad sad panda)(.*)(line[:])(\s*)(\d+)([\s\S]*?)(column[:])(\s*)(\d+)([\n\s\S]*)(->)(.*)(<-)([\s\S]*)/gm;
    const msgMatch = msg.match(msgRegex);
    const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError column = [ $10 ]\nError Site = [ $13 ]`;

    if (!msgMatch) {
      console.error(`_____________________\n 'prettierFormat' Error! ('${fileName}')\n${msg}`);
      return contentsParam;
    }

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
      /(\s*)(\))(\s+)(;)/gm
    );
    const rules2 = (
      /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm
    );
    const rules3 = (
      /(\s*?)(ception)(\{)/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4) => (
        `${p1}${p2}${p4}`
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5, p6) => (
        `${p1}${p2}${p4} ${p6}`
      ))
      .replace(rules3, (_, p1, p2, p3) => (
        `${p2} ${p3}`
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

// 3. insertLine -----------------------------------------------------------------------------------
export const insertLine = async (
  contentsParam: string
) => {
  try {
    const rules1 = (
      /(?!^\/\/--)(^(?!\n)\s*)(@[A-Z].*?(?:(\n\s*))(?=(public|private|function|class))|(?:(public|private|function|class)))/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5) => {
        const spaceSize = (p1).length + (`// `).length + (`-`).length;
        const insertSize = 100 - spaceSize;
        const insetLine = (`// ${"-".repeat(insertSize)}`);
        return `${p1}${insetLine}\n${p1}${p2}`;
      })
    );

    console.log(`_____________________\n 'insertLine' Activated!`);
    return result;
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
      /(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm
    );
    const rules2 = (
      /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
    );
    const rules3 = (
      /(?<!package.*)(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm
    );
    const rules4 = (
      /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm
    );
    const rules5 = (
      /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm
    );
    const rules6 = (
      /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm
    );
    const rules7 = (
      /(^\s*)(public|private)(\s*)([\s\S]*?)(\s*)(\{)(\n*)(\s*)(.*)/gm
    );
    const rules8 = (
      /(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
    );
    const rules9 = (
      /(import.*)(;)(\n*)(\/\/ --)/gm
    );
    const rules10 = (
      /(import.*;)(\n)(^public)/gm
    );
    const rules11 = (
      /(^\s*)(@Value)(\s*)(\()(.*)(\n+)(.*)(\))/gm
    );
    const rules12 = (
      /(^\s*)(.*;)(\n)(?!\n)(\s*)(@Autowired|@Value|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping)/gm
    );
    const rules13 = (
      /(\s*)(@Override)(\n|\n+)(.*)(\n|\n+)(\s*)(public|private)/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5, p6) => (
        `${p2}\n${p6}`
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7) => (
        `${p1} ${p3}\n${p6}${p7}`
      ))
      .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p2}\n${p7}${p8}`
      ))
      .replace(rules4, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`
      ))
      .replace(rules5, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => (
        `${p1}${p2}${p3}${p4}\n`
      ))
      .replace(rules6, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => (
        `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`
      ))
      .replace(rules7, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => (
        `${p1}${p2}${p3}${p4}${p5}${p6}\n\n${p8}${p9}`
      ))
      .replace(rules8, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => (
        `${p1}\n\n${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}`
      ))
      .replace(rules9, (_, p1, p2, p3, p4) => (
        `${p1}${p2}\n\n${p4}`
      ))
      .replace(rules10, (_, p1, p2, p3) => (
        `${p1}${p2}\n${p3}`
      ))
      .replace(rules11, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p1}${p2} (${p5}${p7})`
      ))
      .replace(rules12, (_, p1, p2, p3, p4, p5) => (
        `${p1}${p2}\n\n${p4}${p5}`
      ))
      .replace(rules13, (_, p1, p2, p3, p4, p5, p6, p7) => (
        `${p1}${p2}\n${p6}${p7}`
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

// 5. finalCheck -----------------------------------------------------------------------------------
export const finalCheck = async (
  contentsParam: string
) => {
  try {
    const rules1 = (
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
    );
    const rules2 = (
      /(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm
    );
    const rules3 = (
      /(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm
    );
    const rules4 = (
      /(^\s*)(\/\/ [-]+)([->][\n\s]*)(\s*)(\/\/ [-]+)([->][\n\s])/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => (
        `${p1}${p2}${p3}${p4}${p5}${p13}`
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p4}${p5}\n${p2}${p3}\n${p7}${p8}`
      ))
      .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p1}${p2}${p3}${p4}${p5}\n${p7}${p8}`
      ))
      .replace(rules4, (_, p1, p2, p3, p4, p5, p6) => (
        `${p1}${p2}-\n`
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