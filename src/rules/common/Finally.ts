import ReadContents from "../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from "path";
import lodash from "lodash";

class Finally implements Common {

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

    const rulesOne = /(^.*)(.*)(\})(\n)(\s*)(finally)(\s*)(\{)(\})/gm;
    const rulesTwo = /(^.*)(.*)(\})(\n)(\s*)(finally)(\s*)(\{)/gm;
    const rulesThree = /(^.*)(.*)(\})(\s*)(finally)(\s*)(\{)/gm;

    const result = lodash.chain(this.data())
    .replace(new RegExp(rulesOne, "gm"), (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
      return `${p1}${p2}${p3}${p4}${p5}${p6} ${p8}\n${p1}${p9}`
    })
    .replace(new RegExp(rulesTwo, "gm"), (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
      return `${p1}${p3}\n${p1}${p6} ${p8}`
    })
    .replace(new RegExp(rulesThree, "gm"), (match, p1, p2, p3, p4, p5, p6, p7) => {
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

export default Finally;