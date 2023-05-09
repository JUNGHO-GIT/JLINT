import ReadContents from "../components/ReadContents";
import { Lang } from "../interface/Lang";
import fs from "fs";
import path from "path";
import lodash from "lodash";
import { Node } from "estree";
import acorn from "acorn";
import escodegen from "escodegen";

class Js implements Lang {
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

    const data = this.data();
    if (data instanceof Error) {
      return data;
    }

    // 1. ast
    const ast = acorn.parse(data, { ecmaVersion: 2020 });

    // 2. ast format (js)
    const astFormat = escodegen.generate(ast, {
      format: {
        indent: {
          style: "  ",
          base: 0,
          adjustMultilineComment: true,
        },
        newline: "\n",
        space: " ",
        json: false,
        renumber: false,
        hexadecimal: false,
        quotes: "double",
        escapeless: false,
        compact: false,
        parentheses: true,
        semicolons: true,
        safeConcatenation: false,
      },
    });

    // 3. 파일 내용 쓰기
    fs.writeFileSync(this.copyPath, astFormat, "utf8");

    return astFormat;
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      return console.log("_____________________\n" + this.fileName + "  실행");
    }
    catch (err) {
      return console.log(new Error());
    }
  }
}

export default Js;
