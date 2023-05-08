import fs from "fs";
import path from "path";

class Controller {


  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0,-this.fileExt.length) + "-2" + this.fileExt;

  // 1. main -------------------------------------------------------------------------------------->
  public main() {
    const mainTitle = ["components", "common", "special", "lang"];
    const mainArray = mainTitle.map((item) => this[item]()).flat();

    const mainImport = mainArray.map((item) => {
      const title = mainTitle.find((title) => this[title]().includes(item));
      return require(`../rules/${title}/${item}`).default;
    });
    const mainInit = mainArray.map((_item, index) => new mainImport[index]());

    return mainInit.map((item) => item.output()).join("");
  }

  // 2. components -------------------------------------------------------------------------------->
  public components () {
    const array = [
      "ReadTitle","Copy","ReadContents","Recognize"
    ];
    return array;
  }

  // 3. common ------------------------------------------------------------------------------------>
  public common() {
    const array = [
      "Equal","Comma","Quote","Semicolon","If","Else","Try","Catch","Finally","Brackets",
      "Operators"
    ];
    return array;
  }

  // 4. special ----------------------------------------------------------------------------------->
  public special() {
    const array = [
      "Sql","Line"
    ];
    return array;
  }

  // 5. lang -------------------------------------------------------------------------------------->
  public lang() {
    const lang = [
      ".java",".js"
    ];
    const array: string[] = [
      this.fileExt.slice(1).toUpperCase()
    ];
    return lang.includes(this.fileExt) ? array : [];
  }

}

export default Controller;