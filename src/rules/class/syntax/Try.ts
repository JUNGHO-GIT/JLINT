import fs from "fs";
import path from "path";
import lodash from "lodash";
import {Syntax} from "../../interface/Syntax";
import ReadContents from "../common/ReadContents";

class Try implements Syntax {

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

    // 0. data
    const data = this.data();
    if (data instanceof Error) {return data;}

    const rulesOne = /(\s*)(try)(\s*)(\{)/gm;

    const  result =lodash.chain(data)

    .replace(rulesOne, (match, p1, p2, p3, p4) => {
      return `${p1}${p2} ${p4}`;
    })
    .value();

    fs.writeFileSync(this.filePath, result, "utf8");
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

export default Try;