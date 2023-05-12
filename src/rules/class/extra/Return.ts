import fs from "fs";
import path from "path";
import lodash from "lodash";
import {Extra} from "../../interface/Extra";
import ReadContents from "../common/ReadContents";

class Return implements Extra {

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
    catch (err) {
      return new Error(`파일내용을 읽을 수 없습니다. \n`);
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {

    const data = this.data();
    if (data instanceof Error) {return data;}

    const rulesOne = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
    const rulesTwo = /(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
    const rulesThree = /(^\s*)(public|private)(\s*?)([\s\S]*?)(@?)(\s*)([\s\S]|(\n+)?)(\s*)(\))(\s*)(\{)/gm;

    const result = lodash.chain(data)
    .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6, p7) => {
      return `${p1} ${p3}\n${p6}${p7}`;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
      return `${p2}\n${p7}${p8}`;
    })
    .replace(rulesThree, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
      return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p10} ${p12}`;
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

export default Return;
