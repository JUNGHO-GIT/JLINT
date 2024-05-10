import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Quote {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main()}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 2. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 3. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {

      const rules1 = /(?<!(?:(?:\\['])|(?:['"'])|(?:["'"])))(\s*)(')(\s*)(?!(?:(?:\\['])|(?:['"'])|(?:["'"])))/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3) => {
        return `${p1}"${p3}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }

  }
}

export default Quote;