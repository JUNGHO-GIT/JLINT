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
      return new Error();
    }
  }

  // 3. main ---------------------------------------------------------------------------------->
  public main(): string | Error {

    const falseResult = " *[ ]*=/*[ ]*";

    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }

    try {
      const regExp = new RegExp(falseResult, "g");
      let result = data.replace(regExp, " = ");
      fs.writeFileSync(this.copyPath, result);
      return result;
    }
    catch(err) {
      return new Error();
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      console.log("_____________________\n" + this.fileName + "실행 \n : ", this.main());
      return this.main();
    }
    catch(err) {
      console.log("_____________________\n" + this.fileName + "에서 에러 발생 \n : ", new Error());
      return new Error();
    }
  }
}

export default EqualRules;