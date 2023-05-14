import * as fs from "fs";
import * as path from "path";
import * as lodash from "lodash";
import * as vscode from "vscode";
import Contents from "../../core/Contents";

class Try {

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

      const rulesOne = /(\s*)(try)(\s*)(\{)/gm;
      const  result =lodash.chain(data)

      .replace(rulesOne, (match, p1, p2, p3, p4) => {
        return `${p1}${p2} ${p4}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result);
        return result;
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Try;