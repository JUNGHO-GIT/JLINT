import ReadContents from "./ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from "path";
import lodash from "lodash";

class RemoveComments implements Common {

  // constructor ---------------------------------------------------------------------------------->
  constructor() {
    this.main();
  }

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
    const data = this.data();
    if (data instanceof Error) {
      return data;
    }

    const rulesOne = /(\/\/)(.*?)((-)|(=))(.*)/gm;
    const rulesTwo = /(\/\/)(.*)(end)/gm;
    const rulesThree = /(\/\/)(\s*?)(\*)(.*)(\*)/gm;

    const result = lodash.chain(this.data())
    .replace(rulesOne, (match, p1, p2, p3, p4) => {
      return ``;
    })
    .replace(rulesTwo, (match, p1, p2, p3) => {
      return ``;
    })
    .replace(rulesThree, (match, p1, p2, p3, p4, p5) => {
      return ``;
    })
    .value();

    fs.writeFileSync(this.copyPath, result);
    return result;
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      return console.log("_____________________\n" + this.fileName + "  실행");
    }
    catch(err) {
      return console.log(new Error());
    }
  }
}

export default RemoveComments;