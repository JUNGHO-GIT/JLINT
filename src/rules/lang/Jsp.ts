import fs from "fs";
import path from "path";
import vscode from "vscode";
import {load} from "cheerio";
import prettier from "prettier";
import stripComments from "strip-comments";
import Contents from "../common/Contents";

class Jsp {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Contents().main().toString();

    // extract head content ("jsp")
    const headStart = data.indexOf("<head>") + "<head>".length;
    const headEnd = data.indexOf("</head>") + "</head>".length;
    let headContent: string = "";
    headContent.length > 0 ? data.slice(headStart, headEnd) : headContent = "";

    // remove head content
    const withoutHead = data.replace(headContent, "");

    // 1. remove comments
    const result = stripComments(withoutHead, {
      preserveNewlines: true,
      keepProtected: true,
      block: true,
      line: true,
      language: "html"
    });

    // 2. cheerio
    const $ = load(result);

    // replace head content
    if (headContent.length > 0) {
      $("head").html(headContent);
    }

    // 3. jsp byproduct
    const jspRegex1 = /(&lt; %|&lt;%)/gm;
    const jspRegex2 = /(%& gt;|%&gt;)/gm;

    const replaceData = result
    .replace(jspRegex1, "<%")
    .replace(jspRegex2, "%>")
    .valueOf();

    fs.writeFileSync(this.filePath, replaceData, "utf8");

    return replaceData;
  }

  // 2. main -------------------------------------------------------------------------------------->
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
        const msgRegexReplace = `[JLINT]\n\n[  Error Line : $5$6$7 ]\n\n$8`;
        const msgResult = msg.replace(msgRegex, msgRegexReplace);

        vscode.window.showInformationMessage(msgResult, {modal: true});
        throw error;
      }
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Jsp;