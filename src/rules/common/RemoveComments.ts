import fs from "fs";
import path from "path";
import stripComments from "strip-comments";
import vscode from "vscode";
import Contents from "./Contents";

class RemoveComments {

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
    let data = this.data();

    if (this.filePath) {

      const langArray = [
        "javascript", "javascriptreact", "typescript", "typescriptreact", "java", "jsp",  "html", "css", "xml", "json"
      ];

      // 파일 확장자에 따른 언어 옵션 선택
      let languageOption = this.fileExt; // 기본값 설정

      // langArray 안에 fileExt가 있다면 해당 확장자를 사용
      if (langArray.includes(this.fileExt)) {
        languageOption = this.fileExt;
      }

      // 1. remove comments
      const result = stripComments(data, {
        preserveNewlines: true,
        keepProtected: true,
        block: true,
        line: true,
        language: languageOption // 변수를 사용
      });

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }
  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default RemoveComments;