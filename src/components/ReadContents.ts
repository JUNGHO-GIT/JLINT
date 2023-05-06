import fs from "fs";
import {Components} from "../rules/interface/Components";

class ReadContents implements Components {

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

    const data = fs.readFileSync(this.copyPath(), "utf-8");

    try {
      return data;
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
    catch (err) {
      return new Error();
    }
  }

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      console.log(this.main());
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default ReadContents;