const fs = require("fs");
const path = require("path");
const abcd = require("./rules/lint/Js.ts");

const filePath = process.argv[2];

class Reader {
  
  public readFile() {
    const data = fs.readFileSync(filePath, "utf8");
    try {
      console.log("_____________________");
      console.log(data);
      console.log("_____________________");
      for (let i = 0; i < abcd.length; i++) {
        const char = abcd[i];
        const count = (data.match(new RegExp(char, "gi")) || []).length;
        if (count > 0) {
          console.log(`${char}가 ${count}번 포함됨`);
        }
      }
      return data;
    } 
    catch (err) {
      console.error(err);
      return err;
    }
  }

  public copyFile() {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const destinationFile = `${basename}-2${ext}`;
    const data = fs.copyFileSync(filePath, destinationFile);
    try {
      console.log("_____________________");
      console.log(`파일이 성공적으로 복사되었습니다: ${destinationFile}`);
      console.log("_____________________");
      return data;
    }
    catch (err) {
      console.log("_____________________");
      console.error("복사 중 오류 발생:", err);
      console.log("_____________________");
      return err;
    }
  }

  static main() {
    const reader = new Reader();
    reader.readFile();
    reader.copyFile();
  }
  
}

Reader.main();
