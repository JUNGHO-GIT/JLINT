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

    // 1. remove comments
    const result = stripComments(data, {
      preserveNewlines: false,
      keepProtected: false,
      block: true,
      line: true,
      language : "html"
    });

    // 2. cheerio setting
    const $ = load(result, {
      decodeEntities: true,
      xmlMode: false,
      quirksMode: false,
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
      recognizeCDATA: true,
      recognizeSelfClosing: false,
    });

    // 2-1. comments list
    const tagsArray = [
      "section", "main", "header", "footer", "nav", "table", "form",
      "div[class*=container]", "div[class*=row]", "div[class*=col]"
    ];

    // 2-2. insert comments
    tagsArray.forEach((tag) => {
      let tagParam = tag;
      if (tag === "div[class*=container]") {
        tagParam = "container";
      }
      if (tag === "div[class*=row]") {
        tagParam = "row";
      }
      if (tag === "div[class*=col]") {
        tagParam = "col";
      }
      $(tag).each(function() {
        if (!$(this).prev().is(`:contains(<!-- ${tagParam} -->)`) && !$(this).next().is(`:contains(<!-- /.${tagParam} -->)`)) {
          $(this).before(`<!-- ${tagParam} -->`);
          $(this).after(`<!-- /.${tagParam} -->`);
        }
      });
    });

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