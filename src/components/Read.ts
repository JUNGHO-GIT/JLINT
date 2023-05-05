import fs from "fs";

const filePath = process.argv[2];

class Read {

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = fs.readFileSync(filePath,"utf8");

    return data;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public readFile(): string | Error {
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
      console.log(this.readFile());
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Read;