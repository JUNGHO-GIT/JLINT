import fs from "fs";
import path from "path";
import vscode from "vscode";

class Contents {

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
    if (this.filePath) {
      return fs.readFileSync(this.filePath, "utf8");
    }
    else {
      return "파일이 존재하지 않습니다.";
    }
  }

  // 3. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if(this.filePath) {
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
}

export default Contents;