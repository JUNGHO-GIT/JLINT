// SingleTags.ts

import * as fs from 'fs';
import * as path from 'path';
import lodash from "lodash";
import * as vscode from 'vscode';
import Contents from "./Contents";

// -------------------------------------------------------------------------------------------------
class Tags {

  // 0. resource -----------------------------------------------------------------------------------
  constructor() {this.main()}
  private activePath = path.basename(__filename) as string;
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath as string;
  private fileExt = vscode.window.activeTextEditor?.document.languageId as string;

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

      // 1. except only xml file
      if (this.fileExt === "xml") {
        fs.writeFileSync(this.filePath, data, "utf8");
        return data;
      }
      // 2. allow other files
      if (this.fileExt !== "xml") {
        const rules1 = /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)([\n\s\S]*?)(\s*)(?<!=)(\/>)/gm;

        const result = lodash.chain(data)
        .replace(rules1, (match, p1, p2, p3, p4, p5, p6) => {
          return `${p1}${p2}${p3}${p4}${p5}/>`;
        })
        .value();

        fs.writeFileSync(this.filePath, result, "utf8");
        return result;
      }
    }
  }
}

export default Tags;