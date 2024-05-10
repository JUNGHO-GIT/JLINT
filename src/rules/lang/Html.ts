import fs from "fs";
import path from "path";
import vscode from "vscode";
import {load} from "cheerio";
import prettier from "prettier";
import Contents from "../common/Contents";

class Html {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main()}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 2. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Contents().main().toString();

    // 1. check if head tags exist
    const headStartIndex = data.indexOf("<head>");
    const headEndIndex = data.indexOf("</head>");

    let headContent: string = "";
    let withoutHead: string = data;

    if (headStartIndex !== -1 && headEndIndex !== -1) {
      // head tags exist, extract head content
      const headStart = headStartIndex + "<head>".length;
      const headEnd = headEndIndex;
      headContent = data.slice(headStart, headEnd);

      // remove head content
      withoutHead = data.replace(headContent, "");
    }

    // 2. cheerio
    const $ = load(withoutHead);
    let html = $.html();

    // 3. replace head content
    if (headContent.length > 0) {
      $("head").html(headContent);
      html = $.html();
    }

    fs.writeFileSync(this.filePath, html, "utf8");

    return html;
  }

  // 3. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    const prettierOptions: any = {
      parser: "vue",
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

    if (this.filePath) {
      try {
        const prettierCode = prettier.format(data, prettierOptions);
        fs.writeFileSync(this.filePath, prettierCode, "utf8");
        return prettierCode;
      }
      catch (error) {
        const message = `${error.message}`;
        const msg = message.toString();

        const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
        const msgRegexReplace = `[JLINT]\n\n Error Line : $5$6$7 \n$8`;
        const msgResult = msg.replace(msgRegex, msgRegexReplace);

        vscode.window.showInformationMessage(msgResult, {modal: true});
        throw error;
      }
    }
  }
}

export default Html;