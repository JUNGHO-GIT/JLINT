// Brackets.ts

import * as fs from 'fs';
import * as path from 'path';
import lodash from "lodash";
import * as vscode from 'vscode';
import Contents from "../common/Contents";

// -------------------------------------------------------------------------------------------------
class Brackets {

  // 0. resource -----------------------------------------------------------------------------------
  constructor() {this.main()}
  private activePath = path.basename(__filename) as string;
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath as string;

  // 1. output -------------------------------------------------------------------------------------
  public output() {
    return console.log(`_____________________\nActivated! ('${this.activePath}')`);
  }

  // 2. data ---------------------------------------------------------------------------------------
  public data() {
    return new Contents().main().trim();
  }

  // 3. main ---------------------------------------------------------------------------------------
  public main() {
    const data = this.data();

    if (this.filePath) {

      const rules1 = /(\))(\{)/gm;

      const result =lodash.chain(data)
      .replace(rules1, (match, p1, p2) => {
        return `${p1} ${p2}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }
}

export default Brackets;