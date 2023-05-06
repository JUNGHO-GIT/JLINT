import ReadContents from "../../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from 'path';

class EqualRules implements Common {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0,-this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      return new ReadContents().main().toString();
    }
    catch(err) {
      return new Error(`파일내용을 읽을 수 없습니다. \n`);
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {

    const falseResult1 = "\\b(?!/=)\\s*(===)\\s*\\b(?!/=)";
    const falseResult2 = "\\b(?!/=)\\s*(==)\\s*\\b(?!/=)";
    const falseResult3 = "\\b(?!/=)\\s*(=)\\s*\\b(?!/=)";

    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }
    else {
      const regExp = new RegExp(falseResult1, "g");
      const result1 = data.replace(regExp, " $1 ");
      const regExp2 = new RegExp(falseResult2, "g");
      const result2 = result1.replace(regExp2, " $1 ");
      const regExp3 = new RegExp(falseResult3, "g");
      const result3 = result2.replace(regExp3, " $1 ");
      fs.writeFileSync(this.copyPath, result3);
      return result3;
    }
  }


  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      return console.log("\n_____________________\n" + this.fileName + "실행 : \n" + this.main());
    }
    catch(err) {
      return console.log(new Error());
    }
  }
}

export default EqualRules;