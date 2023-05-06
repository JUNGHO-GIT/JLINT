import fs from "fs";
import path from "path";

class Controller {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0,-this.fileExt.length) + "-2" + this.fileExt;

  // 1. common ------------------------------------------------------------------------------------>
  public common() {
    const commonArray = [
      "Equal", "Comma", "Quote", "SemiColon"
    ];
    const commonImport = commonArray.map((item) => require(`../common/${item}Rules`).default);
    const commonInit = commonArray.map((item) => new commonImport[commonArray.indexOf(item)]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {

    const langArray = [
      ".java", ".js"
    ];

    const langUpper = langArray.map((item) => item.slice(1).toUpperCase());

    if(langArray.includes(this.fileExt)) {
      const langImport = langUpper.map((item) => require(`../main/${item.slice(1)}Rules`).default);
      const langInit = langUpper.map((item) => new langImport[langUpper.indexOf(item)]());
      const langResult = langInit.map((item) => item.output()).join("");
      return [langResult];
    }
    else {
      return [`해당 언어(${this.fileExt})는 지원하지 않습니다.`];
    }
  }

  // 3. output ----------------------------------------------------------------------------------->
  public output() {
    return console.log(`${this.common()} \n_____________________\n ${this.main()}`);
  }
}

export default Controller;
