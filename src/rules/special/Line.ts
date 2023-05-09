import ReadContents from "../components/ReadContents";
import { Special } from "../interface/Special";
import fs from "fs";
import path from "path";
import lodash from "lodash";

class Line implements Special {

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
      return new ReadContents().main().toString();
    }
    catch (err) {
      return new Error(`파일내용을 읽을 수 없습니다. \n`);
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {
    this.data() instanceof Error ? new Error() : null;

    const rulesOne
    = /(\n+)(\s+)(public|private)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
    const rulesTwo
    = /(\s*)(public|private)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?)?)(\s*?)(\{)/gm;
    const rulesThree
    = /(\s*)(ception)(\{)/gm;
    const rulesFour
    = /(\n)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;

    const result = lodash.chain(this.data())

    .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6, p7) => {
      const insetLine = "// " + "-".repeat(96 - p2.length) + ">";
      return `\n${p2}${insetLine}\n${p2}${p3}${p4}${p7}`;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
      return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
    })
    .replace(rulesThree, (match, p1, p2, p3) => {
      return `${p2} ${p3}`;
    })
    .replace(rulesFour, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
      return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
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

export default Line;
