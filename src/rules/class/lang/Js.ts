import fs from "fs";
import path from "path";
import lodash from "lodash";
import prettier from "prettier";
import {Lang} from "../../interface/Lang";
import ReadContents from "../common/ReadContents";

class Js implements Lang {

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

    // 1. front, back
    const frontEx = "(?![@!?#$%^&=-_;,'][\"][\\+][\\*][\\/\\/][\\[\\]<>{}])";
    const backEx = "(?<![@!?#$%^&=-_;,'][\"][\\+][\\*][\\/\\/][\\[\\]<>{}])";

    // 2-1. comments, contents
    const javaCmt   = "(\\s*)(?:(\\/\\/).*)(\\s*)";
    const contents = "(\\s*)(===|==|=|!===|!==|!=|&&|<=|>=|\\+\\+|\\+-|\\+=|\\-=)(\\s*)";

    // 2-3. rules
    const commentRules = new RegExp(frontEx + javaCmt + backEx, "gm");
    const contentsRules = new RegExp(frontEx + contents + backEx, "gm");

    // 3. replace
    const result = lodash.chain(data)
    .replace(commentRules, (match, p1, p2, p3) => {return ``;})
    .replace(contentsRules, (match, p1, p2, p3) => {return ` ${p2} `;})
    .value();

    // 4. write
    fs.writeFileSync(this.copyPath, result, "utf8");
    return result;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {

    const data = this.data();
    if (data instanceof Error) {return data;}

    const formattedCode = prettier.format(data, {
      parser: "babel",
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
      rangeEnd: Infinity,
      requirePragma: false,
      insertPragma: false,
      proseWrap: "preserve",
      htmlWhitespaceSensitivity: "css",
      vueIndentScriptAndStyle: true,
      endOfLine: "lf",
      embeddedLanguageFormatting: "auto"
    });
    fs.writeFileSync(this.copyPath, formattedCode, "utf8");

    return formattedCode;
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
