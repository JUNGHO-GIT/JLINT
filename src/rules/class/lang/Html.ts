import fs from "fs";
import path from "path";
import lodash from "lodash";
import prettier from "prettier";
import {Lang} from "../../interface/Lang";
import ReadContents from "../common/ReadContents";

class Html implements Lang {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {

    // 0. data
    const data = new ReadContents().main();
    if (data instanceof Error) {return data;}

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
    const data = this.data();
    if (data instanceof Error) {return data;}

    const formattedCode = prettier.format(data, {
      parser: "html",
      printWidth: 1000,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      trailingComma: "all",
      bracketSpacing: true,
      jsxBracketSameLine: false,
      arrowParens: "always",
      rangeStart: 0,
      rangeEnd : 10000,
      requirePragma: false,
      insertPragma: false,
      proseWrap: "preserve",
      htmlWhitespaceSensitivity: "css",
      vueIndentScriptAndStyle: true,
      endOfLine: "lf",
      embeddedLanguageFormatting: "auto",
      __embeddedInHtml: true,
      bracketSameLine: false,
      parentParser: "none",
      singleAttributePerLine: false,
    });
    fs.writeFileSync(this.filePath, formattedCode, "utf8");

    return formattedCode;
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

export default Html;