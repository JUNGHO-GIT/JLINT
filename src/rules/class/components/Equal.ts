import fs from "fs";
import path from "path";
import lodash from "lodash";
import ReadContents from "../../class/common/ReadContents";
import {Components} from "../../interface/Components";

class Equal implements Components {

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

    const rulesOne = /(?<!=|\/)(\s*)(===)(\s*)(?!=|>)/gm;
    const rulesTwo = /(?<!=|\/)(\s*)(==)(\s*)(?!=|>)/gm;
    const rulesThree = /(?<!=|\/)(\s*)(=)(\s*)(?!=|>)/gm;
    const rulesFour = /(\s*)(! =)(\s*)/gm;

    const result = lodash.chain(this.data())
    .replace(rulesOne, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesTwo, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesThree, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesFour, (match, p1, p2, p3) => {
      return ` != `;
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

export default Equal;