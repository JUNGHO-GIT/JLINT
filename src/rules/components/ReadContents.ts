import fs from "fs";
import path from "path";
import { Components } from "../interface/Components";

class ReadContents implements Components {

  // constructor ---------------------------------------------------------------------------------->
  constructor() {
    this.main();
  }

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;


  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      const content = fs.readFileSync(this.copyPath, "utf8").toString();
      return content.split("\n").map(line => line.replace(/\t/g, " ".repeat(2))).join("\n");
    }
    catch (err) {
      return new Error(`파일내용을 읽을 수 없습니다. \n`);
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
