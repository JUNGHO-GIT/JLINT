import fs from "fs";
import path from "path";
import {Components} from "../interface/Components";
import ReadContents from "./ReadContents";

class Detector implements Components {

  // constructor ---------------------------------------------------------------------------------->
  constructor() {
    this.main();
  }

  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0,-this.fileExt.length) + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {
    try {
      return new ReadContents().main().toString();
    }
    catch(err) {
      return new Error(`파일이름을 읽을 수 없습니다. \n`);
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {
    if(this.data() instanceof Error) {
      return this.data();
    }
    const lang = [".java", ".js", ".ts", ".py", ".sql"];
    const langArray = lang.map((item) => this[item]()).flat();
    const langImport = langArray.map((item) => {
      return require(`../lang/${item}`).default;
    });
    const langInit = langArray.map((_item, index) => new langImport[index]());
    return langInit.map((item) => item.output()).join("");
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

export default Detector;