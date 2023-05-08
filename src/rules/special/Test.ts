import ReadContents from "../../components/ReadContents";
import { Special } from "../../interface/Special";
import fs from "fs";
import path from "path";

class Test implements Special {

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

    const falseResult1
    = "(\\s?)(^.)(\\s*)(public|private)(.*?)(\\{)";

    const falseResult2
    = "(\\s*)(public|private)(\\s*)([\\s\\S]*?)(\\s*)(\\()(\\s*)([\\s\\S]*?)(\\s*)(\\))(\\s*)(([\\s\\S]*?)?)(\\s*?)(\\{)";

    const falseResult3
    = "(\\s*)(ception)(\\{)";

    const data = this.data();

    if (data instanceof Error) {
      return new Error();
    }
    else {
      let result = data;

      const regExp1 = new RegExp(falseResult1, "gm");
      result = result.replace(regExp1, (match, p1, p2, p3, p4, p5, p6) => {
        const remainingLength = 95 - p2.length - p3.length;
        return `\n${p2}${p3}// ${"-".repeat(remainingLength)}>\n${p2}${p3}${p4}${p5}${p6}`;
      });

      const regExp2 = new RegExp(falseResult2, "gm");
      result = result.replace(regExp2, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12,
      p13, p14, p15) => {
        return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
      });

      const regExp3 = new RegExp(falseResult3, "gm");
      result = result.replace(regExp3, (match, p1, p2, p3) => {
        return `${p2} ${p3}`;
      });

      fs.writeFileSync(this.copyPath, result);
      return result;
    }
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

export default Test;
