import fs from "fs";
import path from "path";
import {Components} from "../rules/interface/Components";

class ReadTitle implements Components {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0,-this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      return path.basename(this.filePath);
    }
    catch(err) {
      return new Error();
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {
    try {
      return this.data();
    }
    catch(err) {
      return new Error();
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      console.log("_____________________\n 파일 이름 \n :", this.main());
      return this.main();
    }
    catch(err) {
      console.log("_____________________\n" + this.filePath + "에서 에러 발생 : \n", new Error());
      return new Error();
    }
  }
}

export default ReadTitle;