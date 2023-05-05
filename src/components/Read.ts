import fs from "fs";
import {Rules} from "../logic/Rules";

const filePath = process.argv[2];

class Read implements Rules {

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string | Error {

    const data = fs.readFileSync(filePath,"utf8");

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
      console.log(this.main());
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Read;