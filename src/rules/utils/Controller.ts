import fs from "fs";
import path from "path";
import Recognize from "../../components/Recognize";

class Controller {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath + "-2" + this.fileExt;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Recognize().main().toString();

    try {
      return data;
    }
    catch(err) {
      return new Error();
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {

    // 0. data
    const data = this.data();

    const yesRecognize
    = console.log(`\n_____________________\n "${data}" 파일의 언어를 인식할 수 있습니다.`);
    const noRecognize
    = console.log(`\n_____________________\n "${data}" 파일의 언어를 인식할 수 없습니다.`);

    // 1. common rules
    const commonArray = ["Equal","Comma"];
    let commonImport = commonArray.map((item) => require(`../common/${item}Rules`).default);
    let commonInit = commonArray.map((item) => new commonImport[commonArray.indexOf(item)]());
    let commonResult = commonInit.map((item) => item.output());

    // 2. lang rules
    const lang = [".java",".js"];
    const langArray = lang.map((item) => item.replace(".","").replace(/^[a-z]/,(v) => v.toUpperCase()));
    let langIndex = lang.indexOf(path.extname(this.filePath));
    let langResult = [];

    // 3. result
    if(langIndex !== -1) {
      let langImport = langArray.map((item) => require(`../lang/${item}Rules`).default);
      let langInit = langArray.map((item) => new langImport[lang.indexOf(item)]());
      langResult = langInit.map((item) => item.output());
      console.log(yesRecognize);
      return [...commonResult, ...langResult];
    }
    else {
      return [...commonResult, noRecognize];
    }
  }


  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    try {
      console.log(this.main());
    }
    catch(err) {
      console.log(new Error());
    }
  }

}

export default Controller;