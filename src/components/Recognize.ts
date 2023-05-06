import path from "path";
import {Components} from "../rules/interface/Components";

class Recognize implements Components {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];

  private copyPath(): string {
    const fileName = this.filePath.split(".")[0];
    const fileExt = this.filePath.split(".")[1];

    const copyPath = fileName + "-2." + fileExt;

    return copyPath;
  }

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = path.extname(this.filePath);

    return data;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main(): string | Error {
    try {
      return this.data();
    }
    catch (err) {
      return new Error();
    }
  }

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      console.log("확장자는",this.main(),"입니다.");
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Recognize;