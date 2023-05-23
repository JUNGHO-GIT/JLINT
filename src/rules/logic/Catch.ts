import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Catch {

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

      const rules1 = /(^.*)(\})(\n+)(\s*)(catch)(\s*)(\()(.*)(\))/gm;
      const rules2 = /(^.*)(.*)(\})(\n)(\s*)(catch)(\s*)(\()/gm;
      const rules3 = /(^.*)(.*)(\})(\s*)(catch)(\s*)(\()/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}${p2}\n${p4}${p5} ${p7}${p8}${p9}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p3}\n${p1}${p6} ${p8}`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7) => {
        return `${p1}${p3}\n${p1}${p5} ${p7}`;
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

export default Catch;