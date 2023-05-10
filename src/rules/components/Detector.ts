/* import fs from "fs";
import path from "path";
import {Components} from "../interface/Components";
import Recognize from "./Recognize";

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
      return new Recognize().main().toString();
    }
    catch(err) {
      return new Error(`파일이름을 읽을 수 없습니다. \n`);
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {
    const data = this.data();
    if (data instanceof Error) {
      return data;
    }
    const lang = [".java", ".js", ".ts"];
    const langArray = ["Java", "Js", "Ts"];

    const langIndex = lang.findIndex((item) => item === data);

    if (langIndex !== -1) {
      const langImport = langArray.map((item) => {
        return require(`../lang/${item}`).default;
      });
      const langLogic = new langImport[langIndex]();
      return langLogic.main();
    }
    else {
      return new Error("지원하지 않는 파일 형식입니다.");
    }
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

export default Detector; */