import * as fs from "fs";
import * as path from "path";
import * as lodash from "lodash";
import * as vscode from "vscode";
import * as prettier from "prettier";
import Contents from "../../core/Contents";

class Html {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    if (this.filePath) {
      return new Contents().data();
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();
    if (data instanceof Error) {
      return data;
    }
    else {
      const formattedCode = prettier.format(data, {
        parser: "html",
        printWidth: 1000,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
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