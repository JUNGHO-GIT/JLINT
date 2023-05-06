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
      "Equal","Comma"
    ];
    const commonImport = commonArray.map((item) => require(`../common/${item}Rules`).default);
    const commonInit = commonArray.map((item) => new commonImport[commonArray.indexOf(item)]());
    const commonResult = commonInit.map((item) => item.output());
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {

    const langArray = [
      ".java", ".js"
    ];

    if(langArray.includes(this.fileExt)) {
      const langUpper = langArray.map((item) => item.slice(1).toUpperCase());
      const langImport = langArray.map((item) => require(`../main/${item.slice(1)}Rules`).default);
      const langInit = langArray.map((item) => new langImport[langArray.indexOf(item)]());
      const langResult = langInit.map((item) => item.output());

      return langResult;
    }
    else {
      return console.log("file type is not supported");
    }

  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      console.log("_____________________\n" + this.fileName + "실행 \n :",this.main());
      return this.main();
    }
    catch(err) {
      console.log("_____________________\n" + this.fileName + "에서 에러 발생  \n :",new Error());
      return new Error();
    }
  }

}

export default Controller;