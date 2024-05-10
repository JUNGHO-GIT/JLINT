import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class LineBreak {

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
      = /(>)(\n*)(?:\})(?:\n*)(function)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3) => {
        return `${p1}\n${p3}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 4-2. Java ------------------------------------------------------------------------------------>
  public Java() {
    const data = this.data();

    if (this.filePath && this.fileExt === "java") {

      const rules1
      = /(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
      const rules2
      = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
      const rules3
      = /(?<!package.*)(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
      const rules4
      = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
      const rules5
      = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
      const rules6
      = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
      const rules7
      = /(^\s*)(public|private)(\s*)([\s\S]*?)(\s*)(\{)(\n*)(\s*)(.*)/gm;
      const rules8
      = /(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
      const rules9
      = /(import.*)(;)(\n*)(\/\/ --)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6) => {
        return `${p2}\n${p6}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7) => {
        return `${p1} ${p3}\n${p6}${p7}`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p2}\n${p7}${p8}`;
      })
      .replace(rules4, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
      })
      .replace(rules5, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}${p2}${p3}${p4}\n`;
      })
      .replace(rules6, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
      })
      .replace(rules7, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}${p2}${p3}${p4}${p5}${p6}\n\n${p8}${p9}`;
      })
      .replace(rules8, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
        return `${p1}\n\n${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}`;
      })
      .replace(rules9, (match, p1, p2, p3, p4) => {
        return `${p1}${p2}\n\n${p4}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 4-3. HtmlJsp --------------------------------------------------------------------------------->
  public HtmlJsp() {
    const data = this.data();

    if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /(?:\n*)(\s*)(<\/body>)(\s*?)/gm;
      const rules2
      = /(.*?)(\n*)(\s*)(\/\/ -.*>)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3) => {
        return `\n\n${p1}${p2}${p3}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4) => {
        return `${p1}\n\n${p3}${p4}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
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

export default LineBreak;
