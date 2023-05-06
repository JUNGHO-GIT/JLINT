import ReadContents from "../../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from 'path';

class SemiColonRules implements Common {

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

    const falseResult = "/*[ ]*;/*[ ]*";

    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }
    else {
      try {
        const regExp = new RegExp(falseResult, "g");
        let result = data.replace(regExp, ";\n");
        fs.writeFileSync(this.copyPath,result);
        return result;
      }
      catch(err) {
        return new Error();
      }
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

export default SemiColonRules;