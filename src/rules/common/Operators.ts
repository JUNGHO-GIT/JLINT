import ReadContents from "../components/ReadContents";
import {Common} from "../../interface/Common";
import fs from "fs";
import path from 'path';

class Operators implements Common {

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

    const rules1 = ["+", "-", "*", "%", "&&", "||"];
    const rules2 = "(\\s*)(\\.)(\\s*)(\\*)(\\s*)(;\n)(\\s*)";

    const data = this.data();
    if (data instanceof Error) {
      return new Error();
    }
    else {
      let result = data;

      rules1.forEach((operators) => {
        const regex = `(?<!\\${operators})(\\s*)(\\${operators})(\\s*)(?!\\${operators})`;
        const regExp1 = new RegExp(regex, "gm");
        result = result.replace(regExp1, (_match, p1, p2, p3, p4) => ` ${p2} `);
      });

      const regExp2 = new RegExp(rules2, "gm");
      result = result.replace(regExp2, (_match, p1, p2, p3, p4, p5, p6, p7) =>
        `${p2}${p4}${p6}`
      );

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

export default Operators;