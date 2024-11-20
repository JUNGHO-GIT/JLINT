// Jsp.ts

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {load} from "cheerio";
import prettier from "prettier";
import Contents from "../common/Contents";

// -------------------------------------------------------------------------------------------------
class Jsp {

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
    const data = new Contents().main().trim();

    // 1. check if head tags exist
    const headStartIndex = data.indexOf("<head>");
    const headEndIndex = data.indexOf("</head>");

    let headContent: string = "";
    let withoutHead: string = data;

    const jspRegex1 = /(&lt; %|&lt;%)/gm;
    const jspRegex2 = /(%& gt;|%&gt;)/gm;

    /*
    * <head> is existed.
    */
    if (headStartIndex !== -1 && headEndIndex !== -1) {

      const headStart = headStartIndex + "<head>".length;
      const headEnd = headEndIndex;

      headContent = data.slice(headStart, headEnd);
      withoutHead = data.replace(headContent, "");

      // 1. cheerio
      let $ = load(withoutHead);
      let html = $.html();

      // 2. replace head content
      if (headContent.length > 0) {
        $("head").html(headContent);
        html = $.html();
      }

      // 3. replace html tag to jsp
      const replaceData = html
      .replace(jspRegex1, "<%")
      .replace(jspRegex2, "%>")
      .valueOf();

      fs.writeFileSync(this.filePath, replaceData, "utf8");

      return replaceData;
    }

    /*
    * <head> is not existed.
    */
    else if (headStartIndex <= 0 && headEndIndex <= 0) {

      // 3. replace html tag to jsp
      const replaceData = data
      .replace(jspRegex1, "<%")
      .replace(jspRegex2, "%>")
      .valueOf();

      fs.writeFileSync(this.filePath, replaceData, "utf8");

      return replaceData;
    }

    return data;
  }

  // 3. main ---------------------------------------------------------------------------------------
 public main() {
    const data = this.data();

    const prettierOptions: any = {
      parser: "jsp",
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

      const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
      const msgRegexReplace = `[JLINT]\n\n[  Error Line : $5$6$7 ]\n\n$8`;
      const msgResult = msg.replace(msgRegex, msgRegexReplace);

      vscode.window.showInformationMessage(msgResult, {modal: true});
      throw new Error(msgResult);
    }
  }
}

export default Jsp;