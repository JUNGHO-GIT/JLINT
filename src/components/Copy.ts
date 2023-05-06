import fs from "fs";
import path from "path";
import {Components} from "../rules/interface/Components";

class Copy implements Components {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];

  private copyPath(): string {
    const fileName = this.filePath.split(".")[0];
    const fileExt = this.filePath.split(".")[1];

    const copyPath = fileName + "-2." + fileExt;

    return copyPath;
  }

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      fs.copyFileSync(this.filePath,this.copyPath());
      return this.copyPath();
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

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      console.log("파일이 복사되었습니다 :", this.main());
    }
    catch(err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Copy;
