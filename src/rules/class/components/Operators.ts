import fs from "fs";
import path from "path";
import lodash from "lodash";
import ReadContents from "../common/ReadContents";
import {Components} from "../../interface/Components";

class Operators implements Components {

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
    if (data instanceof Error) {
      return data;
    }

    const rulesOne = /(?<!=|\/)(\s*)(\+)(\s*)/gm;
    const rulesTwo = /(?!((<)|(=)|(\/))|(-))(\s*)(-)(\s*)(?!((-)|(>)))/gm;
    const rulesThree = /(?<!=|\/)(\s*)(\*)(?!;|\/)/gm;
    const rulesFour = /(?<!=|\/)(\s*)(%)(\s*)/gm;
    const rulesFive = /(?<!=|\/)(\s*)(&&)(\s*)/gm;
    const rulesSix = /(?<!=|\/)(\s*)(\|\|)(\s*)/gm;

    const result = lodash.chain(this.data())
    .replace(rulesOne, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
      return ` ${p7} `;
    })
    .replace(rulesThree, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesFour, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesFive, (match, p1, p2, p3) => {
      return ` ${p2} `;
    })
    .replace(rulesSix, (match, p1, p2, p3) => {
      return ` ${p2} `;
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

export default Operators;