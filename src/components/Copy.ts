import fs from "fs";
import path from "path";

const filePath = process.argv[2];

class Copy {

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath,ext);
    const destinationFile = `${basename}-2${ext}`;
    fs.copyFileSync(filePath,destinationFile);

    return destinationFile;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public copyFile(): string | Error {
    try {
      const destinationFile = this.data();
      return destinationFile;
    } catch(err) {
      return new Error();
    }
  }

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      console.log("파일이 복사되었습니다 : ", this.copyFile());
    }
    catch (err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default Copy;