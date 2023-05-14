import * as fs from "fs";
import * as vscode from "vscode";

class Contents {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.data();}
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileName = vscode.window.activeTextEditor?.document.fileName;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    if(this.filePath) {

      // 1. 파일 내용 읽기
      const content = fs.readFileSync(this.filePath, "utf8");

      // 2. 들여쓰기 변경
      const updateContent = content.split("\n").map(line => {
        const indentMatch = line.match(/^(\s+)/);
        if (indentMatch) {
          const spaces = indentMatch[1].length;
          const newIndent = Math.ceil(spaces / 2) * 2;
          return line.replace(/^(\s+)/, " ".repeat(newIndent));
        }
        return line;
      }).join("\n");

      if(this.filePath) {
        fs.writeFileSync(this.filePath, updateContent, "utf8");
      }
      return updateContent;
    }
  }

  // 2. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.fileName + "  실행");
  }
}

export default Contents;