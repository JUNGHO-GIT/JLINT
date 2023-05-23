import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Spell {

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
    return this.sql();
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 4-1. js -------------------------------------------------------------------------------------->
  public js() {}

  // 4-2. ts -------------------------------------------------------------------------------------->
  public ts() {}

  // 4-3. java ------------------------------------------------------------------------------------>
  public java() {}

  // 4-4. jsp ------------------------------------------------------------------------------------->
  public jsp() {}

  // 4-5. html ------------------------------------------------------------------------------------>
  public html() {}

  // 4-6. css ------------------------------------------------------------------------------------->
  public css() {}

  // 4-7. xml ------------------------------------------------------------------------------------->
  public xml() {}

  // 4-8. json ------------------------------------------------------------------------------------>
  public json() {}

  // 4-9. sql ------------------------------------------------------------------------------------->
  public sql() {
    let data = this.data();

    if (this.filePath) {

      const rules1
      = /(\s*)(\s*)(=)(\s*)(\?)(\s*)/gm;
      const rules2
      = /(\s*)(\s*)(=)(\s*)(NOW)(\s*)/gm;
      const rules3
      = /(\s*)(\s*)(=)(\s*)(now)(\s*)/gm;

      let result =lodash.chain(data);

      for (let i = 1; i <= 3; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3, p4, p5, p6) => {
          return `${p2}${p4}${p5}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }
}

export default Spell;