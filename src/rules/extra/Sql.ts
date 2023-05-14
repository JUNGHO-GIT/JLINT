import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../../core/Contents";

class Sql {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().data();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    if (this.filePath) {
      const data = this.data();

      const rulesOne = /(\s*)(\s*)(=)(\s*)(\?)(\s*)/gm;
      const rulesTwo = /(\s*)(\s*)(=)(\s*)(NOW)(\s*)/gm;
      const rulesThree = /(\s*)(\s*)(=)(\s*)(now)(\s*)/gm;

      const  result =lodash.chain(data)
      .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
        return `${p2}${p4}${p5}`;
      })
      .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
        return `${p2}${p4}${p5}`;
      })
      .replace(rulesThree, (match, p1, p2, p3, p4, p5) => {
        return `${p2}${p4}${p5}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    console.log("_____________________\n" + this.activePath + "  실행");
    return this.main();
  }
}

export default Sql;