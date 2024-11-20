// SpellCheck.ts

import * as fs from 'fs';
import * as path from 'path';
import lodash from "lodash";
import * as vscode from 'vscode';
import Contents from "../common/Contents";

// -------------------------------------------------------------------------------------------------
class SpellCheck {

  // 0. resource -----------------------------------------------------------------------------------
  constructor() {this.main()}
  private activePath = path.basename(__filename) as string;
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath as string;
  private fileExt = vscode.window.activeTextEditor?.document.languageId as string;

  // 1. output -------------------------------------------------------------------------------------
  public output() {
    if (
      this.fileExt === "javascript" || this.fileExt === "javascriptreact" ||
      this.fileExt === "typescript" || this.fileExt === "typescriptreact" ||
      this.fileExt === "java" ||
      this.fileExt === "html" || this.fileExt === "jsp"
    ) {
      return console.log(`_____________________\nActivated! ('${this.activePath}')`);
    }
    else {
      return console.log(`_____________________\nSpellCheck not supported ('${this.fileExt}')`);
    }
  }

  // 2. data ---------------------------------------------------------------------------------------
  public data() {
    return new Contents().main().trim();
  }

  // 3. main ---------------------------------------------------------------------------------------
  public main() {
    if (this.fileExt === "javascript" || this.fileExt === "javascriptreact") {
      return this.JsTs();
    }
    if (this.fileExt === "typescript" || this.fileExt === "typescriptreact") {
      return this.JsTs();
    }
    if (this.fileExt === "java") {
      return this.Java();
    }
    if (this.fileExt === "html" || this.fileExt === "jsp") {
      return this.HtmlJsp();
    }
    if (this.fileExt === "css") {
      return this.Css();
    }
    if (this.fileExt === "xml") {
      return this.Xml();
    }
    if (this.fileExt === "json") {
      return this.Json();
    }
    if (this.fileExt === "sql") {
      return this.Sql();
    }

    return this.output();
  }

  // 4-1. JsTs -------------------------------------------------------------------------------------
  public JsTs() {
    const data = this.data();

    if (this.filePath && this.fileExt === "javascript" || this.fileExt === "javascriptreact" || this.fileExt === "typescript" || this.fileExt === "typescriptreact") {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 4-2. Java -------------------------------------------------------------------------------------
  public Java() {
    const data = this.data();

    if (this.filePath && this.fileExt === "java") {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
      const rules2
      = /(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm;
      const rules3
      = /(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p4}${p5}\n${p2}${p3}\n${p7}${p8}`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p2}${p3}${p4}${p5}\n${p7}${p8}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 4-3. HtmlJsp ----------------------------------------------------------------------------------
  public HtmlJsp() {
    const data = this.data();

    if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
        return `${p1}${p2}${p3}${p4}${p11}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 4-4. Css --------------------------------------------------------------------------------------
  public Css() {
    return;
  }

  // 4-6. Xml --------------------------------------------------------------------------------------
  public Xml() {
    return;
  }

  // 4-7. Json -------------------------------------------------------------------------------------
  public Json() {
    return;
  }

  // 4-8. Sql --------------------------------------------------------------------------------------
  public Sql() {
    return;
  }
}

export default SpellCheck;