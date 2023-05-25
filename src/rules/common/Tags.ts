import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "./Contents";

class Tags {

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
    let data = this.data();

    if (this.filePath) {

      // 1. except only xml file
      if(this.fileExt === "xml") {
        fs.writeFileSync(this.filePath, data, "utf8");
        return data;
      }

      // 2. allow other files
      if(this.fileExt !== "xml") {
        const rules1
        = /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)(.*?)(\/>)(\s*)/gm;
        const rules2
        = /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)(.*?)(?!\/)(>)(\s*)/gm;

        const result = lodash.chain(data)
        .replace(rules1, (match, p1, p2, p3, p4, p5, p6) => {
          return `${p1}${p2}${p3}${p4}>${p6}`;
        })
        .replace(rules2, (match, p1, p2, p3, p4, p5, p6) => {
          return `${p1}${p2}${p3}${p4}/>${p6}`;
        })
        .value();

        fs.writeFileSync(this.filePath, result, "utf8");
        return result;
      }
    }
  }
  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Tags;