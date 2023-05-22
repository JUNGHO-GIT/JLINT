import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Import {

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

    if (this.filePath) {

      const rulesOne = /(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
      const rulesTwo = /(\s*)(package)(\s*)([\s\S]*?)(;)(\n)(\s*)(import)/gm;
      const rulesThree = /(\s*)(\))(\s+)(;)/gm;
      const rulesFour = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;

      const  result =lodash.chain(data)
      .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6) => {
        return `${p2}\n${p6}`;
      })
      .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p2} ${p4}${p5}${p6}\n${p8}`;
      })
      .replace(rulesThree, (match, p1, p2, p3, p4) => {
        return `${p1}${p2}${p4}`;
      })
      .replace(rulesFour, (match, p1, p2, p3, p4, p5, p6) => {
        return `${p1}${p2}${p4} ${p6}`;
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

export default Import;
