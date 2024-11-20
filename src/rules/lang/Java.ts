// Java.ts

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import Contents from "../common/Contents";

// -------------------------------------------------------------------------------------------------
class Java {

  // 0. resource -----------------------------------------------------------------------------------
  constructor() {this.main()}
  private activePath = path.basename(__filename) as string;
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath as string;

  // 1. output -------------------------------------------------------------------------------------
  public output() {
    return console.log(`_____________________\nActivated! ('${this.activePath}')`);
  }

  // 2. data ---------------------------------------------------------------------------------------
  public data() {
    return new Contents().main().trim();
  }

  // 3. main ---------------------------------------------------------------------------------------
  public main() {
    const data = this.data();

    const prettierOptions: any = {
      parser: "java",
      singleQuote: false,
      printWidth: 1000,
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
      parentParser: "none",
      semi: true,
      singleAttributePerLine: false,
    };

    try {
      const prettierCode = prettier.format(data, prettierOptions);
      fs.writeFileSync(this.filePath, prettierCode, "utf8");
      return prettierCode;
    }
    catch (err: any) {
      const msg = err.message.toString();
      const msgRegex = /(.*Sad sad panda.*)(line.*?)([!]\n.*?found -->)(.*?)(<--!\n*.*$)/gm;
      const msgRegexReplace = `[JLINT]\n\nError Line\t=\t(  $2  )\nError Site\t=\t(  $4  )`;
      const msgResult = msg.replace(msgRegex, msgRegexReplace);

      vscode.window.showInformationMessage(msgResult, {modal: true});
      throw new Error(msgResult);
    }
  }
}

export default Java;