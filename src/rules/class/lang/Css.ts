import fs from "fs";
import path from "path";
import lodash from "lodash";
import prettier from "prettier";
import {Lang} from "../../interface/Lang";
import ReadContents from "../common/ReadContents";

class Css implements Lang {

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
    if (data instanceof Error) {
      return data;
    }

    // 1. remove comments
    const rules1 = /(\/\/)(.*?)((-)|(=))(.*)/gm;
    const rules2 = /(\/\/)(.*)(end)/gm;
    const rules3 = /(\/\/)(\s*?)(\*)(.*)(\*)/gm;

    // 2. equal sign
    const rules4 = /(?<!((=)|(\/)).*?)(\s*)(===)(\s*)(?!((=)|(>)).*?)/gm;
    const rules5 = /(?<!((=)|(\/)).*?)(\s*)(==)(\s*)(?!((=)|(>)).*?)/gm;
    const rules6 = /(?<!((=)|(\/)).*?)(\s*)(=)(\s*)(?!((=)|(>)).*?)/gm;
    const rules7 = /(?<!((=)|(\/)).*?)(\s*)(\s*)(! =)(\s*)(?!((=)|(>)).*?)/gm;

    // 3. operators
    const rules8 = /(?<!=|\/)(\s*)(\+)(\s*)/gm;
    const rules9 = /(?!((<)|(=)|(\/))|(-))(\s*)(-)(\s*)(?!((-)|(>)))/gm;
    const rules10 = /(?<!=|\/)(\s*)(\*)(?!;|\/)/gm;
    const rules11 = /(?<!=|\/)(\s*)(%)(\s*)/gm;
    const rules12 = /(?<!=|\/)(\s*)(&&)(\s*)/gm;
    const rules13 = /(?<!=|\/)(\s*)(\|\|)(\s*)/gm;

    // 3. replace
    const result = lodash.chain(data)
    /* .replace(rules1, (match, p1, p2, p3, p4) =>  ``)
    .replace(rules2, (match, p1, p2, p3) =>  ``)
    .replace(rules3, (match, p1, p2, p3, p4, p5) =>  ``)
    .replace(rules4, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules5, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules6, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules7, (match, p1, p2, p3) =>  ` != `)
    .replace(rules8, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules9, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) =>  ` ${p7} `)
    .replace(rules10, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules11, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules12, (match, p1, p2, p3) =>  ` ${p2} `)
    .replace(rules13, (match, p1, p2, p3) =>  ` ${p2} `) */
    .value();

    // 4. write
    fs.writeFileSync(this.copyPath, result);
    return result;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {

    const data = this.data();
    if (data instanceof Error) {
      return data;
    }

    const formattedCode = prettier.format(data, {
      parser: "css",
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

export default Css;
