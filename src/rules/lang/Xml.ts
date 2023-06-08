import fs from "fs";
import path from "path";
import vscode from "vscode";
import prettier from "prettier";
import Contents from "../common/Contents";

class Xml {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    const prettierOptions: any = {
      parser: "xml",
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
        const msgRegexReplace = `[JLINTER]\n\n Error Line : $5$6$7\n$8`;
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

export default Xml;