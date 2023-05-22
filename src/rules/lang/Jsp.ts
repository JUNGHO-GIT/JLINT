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

    // extract head content
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
    .replace(jspRegex1, `<%`)
    .replace(jspRegex2, `%>`)
    .valueOf();

    fs.writeFileSync(this.filePath, replaceData, "utf8");

    return replaceData;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {
      const formattedCode = prettier.format(data, {
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

export default Jsp;