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
    return this.ts() + this.java() + this.jsp();
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 4-1. js -------------------------------------------------------------------------------------->
  public js() {}

  // 4-2. ts -------------------------------------------------------------------------------------->
  public ts() {
    let data = this.data();

    if (this.filePath) {

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

  // 4-3. java ------------------------------------------------------------------------------------>
  public java() {
    let data = this.data();

    if (this.filePath) {

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

  // 4-4. jsp ------------------------------------------------------------------------------------->
  public jsp() {
    let data = this.data();

    if (this.filePath) {

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

  // 4-5. html ------------------------------------------------------------------------------------>
  public html() {}

  // 4-6. css ------------------------------------------------------------------------------------->
  public css() {}

  // 4-7. xml ------------------------------------------------------------------------------------->
  public xml() {}

  // 4-8. json ------------------------------------------------------------------------------------>
  public json() {}

  // 4-9. sql ------------------------------------------------------------------------------------->
  public sql() {}

}

export default Space;
