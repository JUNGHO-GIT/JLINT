import fs from "fs";
import path from "path";
import vscode from "vscode";
import prettier from "prettier";
import Contents from "../common/Contents";

class Json {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Contents().main().toString();

    fs.writeFileSync(this.filePath, data, "utf8");
    return data;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {
      const formattedCode = prettier.format(data, {
        parser: "json",
        singleQuote: false,
        semi: true,
        tabWidth: 2,
        printWidth: 100,
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

export default Json;
