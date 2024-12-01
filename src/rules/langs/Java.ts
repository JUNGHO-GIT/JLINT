// Java.ts

import lodash from "lodash";
import * as prettier from "prettier";
import type { Options } from "prettier";
import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const prettierFormat = async (
  contentsParam: string,
  fileName: string
) => {

  try {
    const prettierOptions: Options = {
      parser: "java",
      parentParser: "java",
      plugins: [(await import("prettier-plugin-java")).default],
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
    const prettierCode = prettier.format(contentsParam, prettierOptions);
    return prettierCode;
  }
  catch (err: any) {
    const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
    const msgRegex = /(\s*)(Sad sad panda)(.*)(line[:])(\s*)(\d+)([\s\S]*?)(->)(.*?)(<-)(.*)/gm;
    const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError Site = [ $9 ]`;
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
    const rules1 = (
      /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3) => {
        const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
        const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .value()
    );

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

    const result = (
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
      .value()
    );

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
    const rules1 = (
      /(\s*)(\))(\s+)(;)/gm
    );
    const rules2 = (
      /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm
    );
    const rules3 = (
      /(\s*?)(ception)(\{)/gm
    );

    const result = (
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
      /(\s*)(@Value)(\s*)(\()(.*)(\n+)(.*)(\))/gm
    );
    const rules5 = (
      /(^\s*)(.*;)(\n)(?!\n)(\s*)(@Autowired|@Value|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping)/gm
    );

    const result = (
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
      .replace(rules4, (_, p1, p2, p3, p4, p5, p6, p7, p8) => (
        `${p1}${p2} (${p5}${p7})`
      ))
      .replace(rules5, (_, p1, p2, p3, p4, p5) => (
        `${p1}${p2}\n\n${p4}${p5}`
      ))
      .value()
    );

    console.log(`_____________________\n spellCheck Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};