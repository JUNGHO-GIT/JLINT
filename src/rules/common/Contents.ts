// Contents.ts

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// -------------------------------------------------------------------------------------------------
class Contents {

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
    return fs.readFileSync(this.filePath, "utf8");
  }

  // 3. main ---------------------------------------------------------------------------------------
  public main() {
    const data = this.data();

    const updateContent = data.split("\n").map(line => {
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch) {
        const spaces = indentMatch[1].length;
        const newIndent = Math.ceil(spaces / 2) * 2;
        return line.replace(/^(\s+)/, " ".repeat(newIndent));
      }
      return line;
    }).join("\n");

    fs.writeFileSync(this.filePath, updateContent, "utf8");
    return updateContent;
  }
}

export default Contents;