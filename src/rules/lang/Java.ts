import ReadContents from "../components/ReadContents";
import {Lang} from "../interface/Lang";
import fs from "fs";
import path from "path";
import lodash from "lodash";

class Java implements Lang {

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

    const rulesOne = /(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
    const rulesTwo = /(\s*)(package)(\s*)([\s\S]*?)(;)(\n)(\s*)(import)/gm;
    const rulesThree = /(\s*)(\))(\s+)(;)/gm;

    const result = lodash.chain(this.data())
    .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6) => {
      return `${p2}\n${p6}`;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
      return `${p2} ${p4}${p5}${p6}\n${p8}`;
    })
    .replace(rulesThree, (match, p1, p2, p3, p4) => {
      return `${p1}${p2}${p4}`;
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

export default Java;