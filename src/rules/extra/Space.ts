import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Space {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    return this.JsTs() + this.Java() + this.HtmlJsp();
  }

  // 3-1. JsTs ------------------------------------------------------------------------------------>
  public JsTs() {
    let data = this.data();

    if (this.filePath && this.fileExt === "javascript" || this.fileExt === "javascriptreact" || this.fileExt === "typescript" || this.fileExt === "typescriptreact") {

      const rules1
      = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
      const rules2
      = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;

      let result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
        return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5) => {
        return `${p2}${p3}${p4}${p5}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-2. Java ------------------------------------------------------------------------------------>
  public Java() {
    let data = this.data();

    if (this.filePath && this.fileExt === "java") {

      const rules1
      = /(\s*)(\))(\s+)(;)/gm;
      const rules2
      = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
      const rules3
      = /(\s*?)(ception)(\{)/gm;

      let result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4) => {
        return `${p1}${p2}${p4}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6) => {
        return `${p1}${p2}${p4} ${p6}`;
      })
      .replace(rules3, (match, p1, p2, p3) => {
        return `${p2} ${p3}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-3. HtmlJsp --------------------------------------------------------------------------------->
  public HtmlJsp() {
    let data = this.data();

    if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /(<%@)(\s*)(page)/gm;
      const rules2
      = /(<%@)(\s*)(taglib)/gm;

      let result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3) => {
        return `${p1} ${p3}`;
      })
      .replace(rules2, (match, p1, p2, p3) => {
        return `${p1} ${p3}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-4. Css ------------------------------------------------------------------------------------->
  public Css() {}

  // 3-5. Xml ------------------------------------------------------------------------------------->
  public Xml() {}

  // 3-6. Json ------------------------------------------------------------------------------------>
  public Json() {}

  // 3-7. Sql ------------------------------------------------------------------------------------->
  public Sql() {}

  // 4. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

}

export default Space;
