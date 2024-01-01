import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import lodash from "lodash";
import Contents from "./Contents";

export default class Tags {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    // 1. except only xml file
    if (this.fileExt === "xml") {
      fs.writeFileSync(this.filePath, data, "utf8");
      return data;
    }

    // 2. html, vue, jsp
    else {
      const rules1
      = /(<\s*)(hr|img|link|meta|input)((?:(?!--)[\s\S])*?)(\s*)(?:(?!--)\/?[>])/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5) => {
        return `<${p2}${p3}${p4} />`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}