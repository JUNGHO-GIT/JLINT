import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Semicolon {

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

      const rulesOne = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
      const rulesTwo = /(&nbsp;)(\n+)(&nbsp;)/gm;
      const rulesThree = /(&lt;)(\n+)(&lt;)/gm;
      const rulesFour = /(;)(\n*)(\s*)(charset)/gm;

      const result = lodash.chain(data)
      .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}${p4}\n${p1}${p5}`;
      })
      .replace(rulesTwo, (match, p1, p2, p3) => {
        return `${p1}${p3}`;
      })
      .replace(rulesThree, (match, p1, p2, p3) => {
        return `${p1}${p3}`;
      })
      .replace(rulesFour, (match, p1, p2, p3, p4) => {
        return `${p1} ${p4}`;
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

export default Semicolon;