import fs from "fs";
import path from "path";
import lodash from "lodash";
import xmlFormat from "xml-formatter";
import {Lang} from "../../interface/Lang";
import ReadContents from "../common/ReadContents";

class Xml implements Lang {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {

    // 0. data
    const data:any = new ReadContents().main().toString();
    if (data instanceof Error) {
      return data;
    }

    const rulesOne
    = /(?<=[^!-~]|[;]|[(){}<>])(\/\/|\/\*|^\*|\*\/|<!--|<%--)(.*)(?<=[\s\S]*)/gm;

    const rulesTwo
    = /(?<!([<]|["'].*))(\s*)(===|==|=|!===|!==|!=|&&|<=|>=|=>|\+\+|\+-|\+=|-=|\+|-|[*])(\s*)(?!(.*[\/>]|[>]))/gm;

    // 3. replace
    const result = lodash.chain(data)
    .replace(rulesOne, (match, p1, p2, p3) => {
      return ``;
    })
    .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
      return ` ${p3} `;
    })
    .value();

    // 4. write
    fs.writeFileSync(this.filePath, result, "utf8");
    return result;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {

    // 0. data
    const data:any = this.data();
    if (data instanceof Error) {
      return data;
    }

    // xml format
    const format = xmlFormat(data, {
      indentation: "  ",
      collapseContent: false,
      lineSeparator: "\n",
      whiteSpaceAtEndOfSelfclosingTag: false,
      filter: (node) => node.type !== "Comment",
      throwOnFailure: false,
    });

    // 1. write
    fs.writeFileSync(this.filePath, format, "utf8");
    return format;
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

export default Xml;