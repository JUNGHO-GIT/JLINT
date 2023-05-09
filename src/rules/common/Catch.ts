import ReadContents from "../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from "path";
import lodash from "lodash";

class Catch implements Common {

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
    this.data() instanceof Error ? new Error() : null;

    const resultOne = /(^.*)(\})(\n+)(\s*)(catch)(\s*)(\()(.*)(\))/gm;
    const resultTwo = /(^.*)(.*)(\})(\n)(\s*)(catch)(\s*)(\()/gm;
    const resultThree = /(^.*)(.*)(\})(\s*)(catch)(\s*)(\()/gm;

    const result = lodash.chain(this.data())
    .replace(resultOne, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
      return `${p1}${p2}\n${p4}${p5} ${p7}${p8}${p9}`
    })
    .replace(resultTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
      return `${p1}${p3}\n${p1}${p6} ${p8}`
    })
    .replace(resultThree, (match, p1, p2, p3, p4, p5, p6, p7) => {
      return `${p1}${p3}\n${p1}${p5} ${p7}`
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

export default Catch;