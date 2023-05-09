import ReadContents from "../rules/components/ReadContents";
import { Lang } from "../rules/interface/Lang";3
import fs from "fs";
import path from "path";
import prettier from "prettier";

class Controller {

  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. main -------------------------------------------------------------------------------------->
  public main() {
    const mainTitle = [
      "components", "common", "special"
    ];
    const mainArray = mainTitle.map((item) => this[item]()).flat();

    const mainImport = mainArray.map((item) => {
      const title = mainTitle.find((title) => this[title]().includes(item));
      return require(`../rules/${title}/${item}`).default;
    });
    const mainInit = mainArray.map((_item, index) => new mainImport[index]());

    return mainInit.map((item) => item.output()).join("");
  }

  // 2. components -------------------------------------------------------------------------------->
  public components() {
    const array = [
      "ReadTitle", "Copy", "ReadContents", "Recognize"
    ];
    return array;
  }

  // 4. common ------------------------------------------------------------------------------------>
  public common() {
    const array = [
      "Equal", "Comma", "Quote", "Semicolon", "If", "Else", "Elseif", "Try", "Catch", "Finally",
      "Brackets", "Operators"
    ];
    return array;
  }

  // 5. special ----------------------------------------------------------------------------------->
  public special() {
    const array = [
      "Sql", "Line", "Import"
    ];
    return array;
  }
}

export default Controller;
