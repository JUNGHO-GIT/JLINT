import fs from "fs";
import path from "path";
import vscode from "vscode";
import stripComments from "strip-comments";

class Contents {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.data();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    if (this.filePath) {
      const content = fs.readFileSync(this.filePath, "utf8");
      let language: string;
      switch (this.fileExt) {
        case "javascript": language = "javascript";
        break;
        case "typescript": language = "typescript";
        break;
        case "html": language = "html";
        break;
        case "json": language = "json";
        break;
        case "jsp" : language = "html";
        break;
        case "css": language = "css";
        break;
        case "java": language = "java";
        break;
        case "xml": language = "xml";
        break;
        default: console.log("지원되지 않는 파일 형식입니다.");
        return "";
      }
      const result = stripComments(content, {
        preserveNewlines: false,
        block: true,
        line: true,
        language,
      });

      return result;
    }
    else {
      return "파일이 존재하지 않습니다.";
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    if(this.filePath) {
      const commentsData = this.data();
      const updateContent = commentsData.split("\n").map(line => {
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
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Contents;