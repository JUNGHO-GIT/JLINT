import ReadContents from "../../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from 'path';

class SemiColon implements Common {

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

    const falseResult = "(;)(?!\\n|\\/\\/| \\/\\/|\\}\\n)";

    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }
    else {
      const regExp1 = new RegExp(falseResult, "gm");
      const result1 = data.replace(regExp1, (_match, p1) => `;\n`);
      fs.writeFileSync(this.copyPath, result1);
      return result1;
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

export default SemiColon;