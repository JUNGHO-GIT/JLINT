import * as fs from "fs";
import * as path from "path";
import {Common} from "../interface/Common";

class ReadContents implements Common {

  // constructor ---------------------------------------------------------------------------------->
  constructor() {
    this.main();
  }

  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      // 1. 파일 내용 읽기
      const content = fs.readFileSync(this.copyPath, "utf8").toString();

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

      // 3. 파일 내용 쓰기
      fs.writeFileSync(this.copyPath, updateContent, "utf8");

      // 4. 결과 반환
      return updateContent;
    }
    catch (err) {
      return new Error(`파일내용을 읽을 수 없습니다. \n`);
    }
  }

  // 2. lang -------------------------------------------------------------------------------------->
  public main(): string | Error {
    try {
      return this.data();
    }
    catch (err) {
      return new Error();
    }
  }


  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      return console.log("_____________________\n" + this.fileName + "  실행");
    }
    catch (err) {
      return console.log(new Error());
    }
  }
}

export default ReadContents;
