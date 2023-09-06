import fs from "fs";
import path from "path";
import * as vscode from "vscode";

export default class Contents {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return fs.readFileSync(this.filePath, "utf8");
  }

  // 2. main -------------------------------------------------------------------------------------->
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

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}