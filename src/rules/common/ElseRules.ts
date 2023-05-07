import ReadContents from "../../components/ReadContents";
import {Common} from "../interface/Common";
import fs from "fs";
import path from 'path';

class ElseRules implements Common {

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

    const falseResult1 = "(^.*)(\\.*)(\\})(\\n)(\\s*)(else)(\\s*)(\\{)(\\})";
    const falseResult2 = "(^.*)(\\.*)(\\})(\\n)(\\s*)(else)(\\s*)(\\{)";
    const falseResult3 = "(^.*)(\\.*)(\\})(\\s*)(else)(\\s*)(\\{)";

    /**
    const falseResult4 = "(\\s*)(\\})(\\s*)(else)(\\s*)(\\{)";
    const falseResult5 = "(\\s*)(\\})(\\s*)(\\n)(\\s*)(else)(\\s*)(\\{)(\\s*)(\\.*)";
    **/

    const data = this.data();
    if (data instanceof Error) {
      return new Error();
    }
    else {
      let result = data;

      const regExp1 = new RegExp(falseResult1, "gm");
      result = result.replace(regExp1, (_match, p1, p2, p3, p4, p5, p6, p7, p8, p9) =>
        `${p1}${p2}${p3}${p4}${p5}${p6} ${p8}\n${p1}${p9}`
      );

      const regExp2 = new RegExp(falseResult2, "gm");
      result = result.replace(regExp2, (_match, p1, p2, p3, p4, p5, p6, p7, p8) =>
        `${p1}${p3}\n${p1}${p6} ${p8}`
      );

      const regExp3 = new RegExp(falseResult3, "gm");
      result = result.replace(regExp3, (_match, p1, p2, p3, p4, p5, p6, p7, p8) =>
        `${p1}${p3}\n${p1}${p5} ${p7}`
      );

      /*
      const regExp3 = new RegExp(falseResult3, "g");
      result = result.replace(regExp3, (_match, p1, p2, _p3, p4, _p5, p6) =>
        `${p1}${p2}\n${p1}${p4} ${p6}`
      );

      const regExp4 = new RegExp(falseResult4, "g");
      result = result.replace(regExp4, (_match, p1, p2, p3, p4, p5, p6, _p7, p8, _p9, p10) =>
        `${p1}${p2}${p3}${p4}${p5}${p6} ${p8}\n${p5}\t${p10}`
      ); */

      fs.writeFileSync(this.copyPath, result);
      return result;
    }
  }



  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      return console.log("\n_____________________\n" + this.fileName + "실행 : \n" + this.main());
    }
    catch(err) {
      return console.log(new Error());
    }
  }
}

export default ElseRules;