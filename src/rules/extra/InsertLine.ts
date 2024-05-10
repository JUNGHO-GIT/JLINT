import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class InsertLine {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main()}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 2. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 3. main -------------------------------------------------------------------------------------->
  public main() {
    return this.JsTs(), this.Java(), this.HtmlJsp(), this.Css(), this.Xml(), this.Json(), this.Sql(), this.output();
  }

  // 4-1. JsTs ------------------------------------------------------------------------------------>
  public JsTs() {
    const data = this.data();

    if (this.filePath && this.fileExt === "javascript" || this.fileExt === "javascriptreact" || this.fileExt === "typescript" || this.fileExt === "typescriptreact") {

      const rules1
      = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
      const rules2
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules3
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
      const rules4
      = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules5
      = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 5; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
          const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 4-2. Java ------------------------------------------------------------------------------------>
  public Java() {
    const data = this.data();

    if (this.filePath && this.fileExt === "java") {

      const rules1
      = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 1; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
          const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 4-3. HtmlJsp --------------------------------------------------------------------------------->
  public HtmlJsp() {
    const data = this.data();

    if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
      const rules2
      = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
      const rules3
      = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
      const rules4
      = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
      const rules5
      = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
      const rules6
      = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
      const rules7
      = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
      const rules8
      = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
      const rules9
      = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 9; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (lodash.size(p1) + lodash.size(`<!--`) + lodash.size(`-->`));
          const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 4-4. Css ------------------------------------------------------------------------------------->
  public Css() {
    const data = this.data();

    if (this.filePath && this.fileExt === "css") {
      return console.log("_____________________\n" + this.fileExt + "!!!!!!!!!!!!!!!!");
    }
  }

  // 4-6. Xml ------------------------------------------------------------------------------------->
  public Xml() {
    const data = this.data();

    if (this.filePath && this.fileExt === "xml") {
      return console.log("_____________________\n" + this.fileExt + "!!!!!!!!!!!!!!!!");
    }
  }

  // 4-7. Json ------------------------------------------------------------------------------------>
  public Json() {
    const data = this.data();

    if (this.filePath && this.fileExt === "json") {
      return console.log("_____________________\n" + this.fileExt + "!!!!!!!!!!!!!!!!");
    }
  }

  // 4-8. Sql ------------------------------------------------------------------------------------->
  public Sql() {
    const data = this.data();

    if (this.filePath && this.fileExt === "sql") {
      return console.log("_____________________\n" + this.fileExt + "!!!!!!!!!!!!!!!!");
    }
  }
}

export default InsertLine;