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
    if (data instanceof Error) {
      return data;
    }

    // 1. remove comments
    const rules1 = /((?<=(\s*)).*?)(.*(\/\/)|(\/).*)((?=((-)|(=)|(\*)|(end))).*)/gm;

    // 2-1. equal sign
    const rules4 = /(?![=]|[/]|[>]|[<]|[+]|[-]|[=])(\s*)(===)(\s*)(?![=]|[>])/gm;
    const rules5 = /(?![=]|[/]|[>]|[<]|[+]|[-]|[=])(\s*)(==)(\s*)(?![=]|[>])/gm;
    const rules6 = /(?![=]|[/]|[>]|[<]|[+]|[-]|[=])(\s*)(=)(\s*)(?![=]|[>])/gm;

    /* // 2-2. unequal sign
    const rules7 = /(?<!((=)|(\/)|(>)|(<)|(\+)|(-)).*?)(\s*)(! ===)(\s*)(?!((=)|(>)).*?)/gm;
    const rules8 = /(?<!((=)|(\/)|(>)|(<)|(\+)|(-)).*?)(\s*)(! ==)(\s*)(?!((=)|(>)).*?)/gm;
    const rules9 = /(?<!((=)|(\/)|(>)|(<)|(\+)|(-)).*?)(\s*)(! =)(\s*)(?!((=)|(>)).*?)/gm; */

    /* // 3. operators
    const rules10 = /(?<!=|\/)(\s*)(\+)(\s*)/gm;
    const rules11 = /(?!((<)|(=)|(\/))|(-))(\s*)(-)(\s*)(?!((-)|(>)))/gm;
    const rules12 = /(?<!=|\/)(\s*)(\*)(?!;|\/)/gm;
    const rules13 = /(?<!=|\/)(\s*)(%)(\s*)/gm;
    const rules14 = /(?<!=|\/)(\s*)(&&)(\s*)/gm;
    const rules15 = /(?<!=|\/)(\s*)(\|\|)(\s*)/gm;
    */

    // 3. replace
    const result = lodash.chain(data)
    .replace(rules1, (match, ...groups) => {
      return ``;
    })
    .replace(rules4, (match, p1, p2) => {
      return ` ${p2} `;
    })
    .replace(rules5, (match, p1, p2) => {
      return ` ${p2} `;
    })
    .replace(rules6, (match, p1, p2) => {
      return ` ${p2} `;
    })
    /*
    .replace(rules7, (match, ...groups) => {
      const { p9 } = (groups as any).pop();
      return ` ${p9} `;
    })
    .replace(rules8, (match, ...groups) => {
      const { p9 } = (groups as any).pop();
      return ` ${p9} `;
    })
    .replace(rules9, (match, ...groups) => {
      const { p9 } = (groups as any).pop();
      return ` ${p9} `;
    }) */

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
