import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../../core/Contents";

class Brackets {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private contents = new Contents().data();

  // 1. main -------------------------------------------------------------------------------------->
  public main() {

    if (this.filePath) {
      const data = this.contents;
      const rulesOne = /(\))(\{)/gm;

      const result =lodash.chain(data)
      .replace(rulesOne, (match, p1, p2) => {
        return `${p1} ${p2}`;
      })
      .value();
      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 2. output ------------------------------------------------------------------------------------>
  public output() {
    console.log("_____________________\n" + this.activePath + "  실행");
    return this.main();
  }
}

export default Brackets;