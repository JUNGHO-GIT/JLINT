// TryCatch.ts

import * as fs from 'fs';
import * as path from 'path';
import lodash from "lodash";
import * as vscode from 'vscode';
import Contents from "../common/Contents";

// -------------------------------------------------------------------------------------------------
class TryCatch {

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

      const rules1
      = /(\b)(try)(?:\s*)(\{)/gm;
      const rules2
      = /(.*?)(?<=\})(\s*)(catch)/gm;
      const rules3
      = /(.*?)(?<=\})(\s*)(finally)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3) => {
        return `${p2} {`;
      })
      .replace(rules2, (match, p1, p2, p3) => {
        const indentSize1 = p1.length - `}`.length;
        const spaceSize = indentSize1 == -1 ? 0 : indentSize1;
        const insertSize = " ".repeat(spaceSize);
        return `${p1}\n${insertSize}catch`;
      })
      .replace(rules3, (match, p1, p2, p3) => {
        const indentSize1 = p1.length - `}`.length;
        const spaceSize = indentSize1 == -1 ? 0 : indentSize1;
        const insertSize = " ".repeat(spaceSize);
        return `${p1}\n${insertSize}finally`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }
}

export default TryCatch;