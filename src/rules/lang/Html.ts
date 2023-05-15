import fs from "fs";
import path from "path";
import vscode from "vscode";
import prettier from "prettier";
import { load } from "cheerio";
import Contents from "../../core/Contents";

class Html {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data(tags: string[]) {
    if (this.filePath) {
      const data = new Contents().main();

      const $ = load(data, {
        decodeEntities: true,
        xmlMode: true,
      });

      tags.forEach((tag) => {
        $(tag).each((_index, element) => {
          const tagName = $(element).prop("tagName").toLowerCase();
          const startComment = `<!-- ${tagName} -->`;
          const endComment = `<!-- /.${tagName} -->`;

          $(element).before(startComment);
          $(element).after(endComment);
        });
      });

      return $.html();
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const tagsToComment = ["section", "main", "header", "footer"];
    const updatedHtml = this.data(tagsToComment);

    if (updatedHtml instanceof Error) {
      return updatedHtml;
    }
    else {
      const formattedCode = prettier.format(updatedHtml, {
        parser: "html",
        printWidth: 300,
        tabWidth: 2,
        useTabs: false,
        quoteProps: "as-needed",
        jsxSingleQuote: false,
        trailingComma: "all",
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: "always",
        rangeStart: 0,
        rangeEnd: Infinity,
        requirePragma: false,
        insertPragma: false,
        proseWrap: "preserve",
        htmlWhitespaceSensitivity: "css",
        vueIndentScriptAndStyle: true,
        endOfLine: "lf",
        embeddedLanguageFormatting: "off",
        bracketSameLine: false,
        parentParser: "none",
        singleAttributePerLine: false,
      });
      if(this.filePath) {
        fs.writeFileSync(this.filePath, formattedCode, "utf8");
      }
      return formattedCode;
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Html;