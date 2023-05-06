import fs from "fs";
import path from "path";
import {Components} from "../rules/interface/Components";

class Copy implements Components {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      fs.copyFileSync(this.filePath, this.copyPath);
      return this.copyPath;
    }
    catch(err) {
      return new Error(`파일을 복사할 수 없습니다. \n`);
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
      return console.log("\n_____________________\n 파일 복사 : \n" + this.main());
    }
    catch(err) {
      return console.log(new Error());
    }
  }
}

export default Copy;