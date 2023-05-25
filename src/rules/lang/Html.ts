import fs from "fs";
import path from "path";
import vscode from "vscode";
import {load} from "cheerio";
import prettier from "prettier";
import stripComments from "strip-comments";
import Contents from "../common/Contents";

class Html {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Contents().main().toString();

    // extract head content (unique value of "html")
    const headStart = data.indexOf("<head>") + "<head>".length;
    const headEnd = data.indexOf("</head>") + "</head>".length;
    const headContent = data.slice(headStart, headEnd);

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

    // 3. return
    fs.writeFileSync(this.filePath, $.html(), "utf8");

    return $.html();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {
      const formattedCode = prettier.format(data, {
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
        bracketSameLine: false,
        parentParser: "none",
        singleAttributePerLine: false
      });

      fs.writeFileSync(this.filePath, formattedCode, "utf8");
      return formattedCode;
    }

  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Html;