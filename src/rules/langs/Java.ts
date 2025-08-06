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

    const finalResult = strip(minifyResult, {
      language: "java",
      preserveNewlines: false,
      keepProtected: false,
      block: true,
      line: true,
    });

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
      .replace(rules1, (...p) => (
        `${p[1]}${p[2]}${p[4]}`
      ))
      .replace(rules2, (...p) => (
        `${p[1]}${p[2]}${p[4]} ${p[6]}`
      ))
      .replace(rules3, (...p) => (
        `${p[2]} ${p[3]}`
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
      /(?!^\/\/--)(^(?!\n)\s*)(@[A-Z].*?(?:(\n\s*))(?=(public|private|function|class))|(?:(public|private|function|class)))/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => {
        const p1 = p[1] ?? "";
        const p2 = p[2] ?? "";
        const spaceSize = p[1].length + (`// `).length + (`-`).length;
        const insertSize = 100 - spaceSize;
        const insetLine = (`// ${"-".repeat(insertSize)}`);
        return `${p[1]}${insetLine}\n${p[1]}${p[2]}`;
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
      /(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm
    );
    const rules5 = (
      /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm
    );
    const rules6 = (
      /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm
    );
    const rules9 = (
      /(import.*)(;)(\n*)(\/\/ --)/gm
    );
    const rules10 = (
      /(import.*;)(\n)(^public)/gm
    );
    const rules2 = (
      /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
    );
    const rules4 = (
      /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm
    );
    const rules8 = (
      /(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
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
      .replace(rules1, (...p) => (
  		`${p[1]}${p[2]}\n${p[6]}`
	  ))
      .replace(rules5, (...p) => (
        `${p[1]}${p[2]}${p[3]}${p[4]}\n`
      ))
      .replace(rules6, (...p) => (
  		`${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[8]}${p[10]}`
      ))
      .replace(rules9, (...p) => (
        `${p[1]}${p[2]}\n\n${p[4]}`
      ))
      .replace(rules10, (...p) => (
        `${p[1]}${p[2]}\n${p[3]}`
      ))
      .replace(rules2, (...p) => (
        `${p[1]} ${p[3]}\n${p[6]}${p[7]}`
      ))
      .replace(rules4, (...p) => (
        `${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[7]}${p[8]}`
      ))
      .replace(rules8, (...p) => (
        `${p[1]}\n\n${p[3]}${p[4]}${p[5]}${p[6]}${p[7]}${p[8]}${p[9]}${p[10]}${p[11]}`
      ))
      .replace(rules11, (...p) => (
        `${p[1]}${p[2]} (${p[5]}${p[7]})`
      ))
      .replace(rules12, (...p) => (
        `${p[1]}${p[2]}\n\n${p[4]}${p[5]}`
      ))
      .replace(rules13, (...p) => (
        `${p[1]}${p[2]}\n${p[6]}${p[7]}`
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
      .replace(rules1, (...p) => (
        `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
      ))
      .replace(rules2, (...p) => (
        `${p[4]}${p[5]}\n${p[2]}${p[3]}\n${p[7]}${p[8]}`
      ))
      .replace(rules3, (...p) => (
        `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}\n${p[7]}${p[8]}`
      ))
      .replace(rules4, (...p) => (
        `${p[1]}${p[2]}-\n`
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