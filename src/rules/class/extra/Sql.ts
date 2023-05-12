import fs from "fs";
import path from "path";
import lodash from "lodash";
import {Extra} from "../../interface/Extra";
import ReadContents from "../common/ReadContents";

class Sql implements Extra {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

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
    if (data instanceof Error) {return data;}

    const rulesOne = /(\s*)(\s*)(=)(\s*)(\?)(\s*)/gm;
    const rulesTwo = /(\s*)(\s*)(=)(\s*)(NOW)(\s*)/gm;
    const rulesThree = /(\s*)(\s*)(=)(\s*)(now)(\s*)/gm;

    const result = lodash.chain(this.data())
    .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
      return `${p2}${p4}${p5}`;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
      return `${p2}${p4}${p5}`;
    })
    .replace(rulesThree, (match, p1, p2, p3, p4, p5) => {
      return `${p2}${p4}${p5}`;
    })
    .value();

    fs.writeFileSync(this.copyPath, result, "utf8");
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

export default Sql;