import path from "path";

const filePath = process.argv[2];

class Recognize {

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = path.extname(filePath);

    return data;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public recognizeFile(): string | Error {
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
      console.log("확장자는",this.recognizeFile(),"입니다.");
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Recognize;