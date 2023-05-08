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
      "Equal","Comma","Quote","Semicolon","If","Else","Try","Catch","Finally","Brackets","Operators"
    ];
    const commonImport = commonArray.map((item) => require(`../rules/common/${item}`).default);
    const commonInit = commonArray.map((item) => new commonImport[commonArray.indexOf(item)]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 2. special ----------------------------------------------------------------------------------->
  public special() {
    const specialArray = [
      "Sql","Test"
    ];
    const specialImport = specialArray.map((item) => require(`../rules/special/${item}`).default);
    const specialInit = specialArray.map((item) => new specialImport[specialArray.indexOf(item)]());
    return specialInit.map((item) => item.output()).join("");
  }

  // 3. lang -------------------------------------------------------------------------------------->
  public lang() {

    const lang: string[] = [
      ".java",".js"
    ];

    const langArray: string[] = [];

    if (lang.includes(this.fileExt)) {
      langArray.push(this.fileExt.slice(1).toUpperCase());
      const langImport = langArray.map((item) => require(`../rules/lang/${item}`).default);
      const langInit = langArray.map((item) => new langImport[langArray.indexOf(item)]());
      return langInit.map((item) => item.output()).join("");
    }
    else {
      return [`해당 언어(${this.fileExt})는 지원하지 않습니다.`];
    }
  }

  // 4. output ----------------------------------------------------------------------------------->
  public output() {
    try {
      return `${this.common()} ${this.special()} ${this.lang()}`;
    }
    catch(err) {
      return new Error();
    }
  }
}

export default Controller;
