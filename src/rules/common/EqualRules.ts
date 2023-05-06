import ReadContents from "../../components/ReadContents";
import { Common } from "../interface/Common";
import fs from "fs";

class EqualRules implements Common {

  // 0. path -------------------------------------------------------------------------------------->
  private filePath = process.argv[2];

  private copyPath(): string {
    const fileName = this.filePath.split(".")[0];
    const fileExt = this.filePath.split(".")[1];

    const copyPath = fileName + "-2." + fileExt;

    return copyPath;
  }

  // 1. data -------------------------------------------------------------------------------------->
  public data(): string[] | Error {

    try {
      const data = new ReadContents().main().toString().split("\n")
      return data;
    }
    catch(err) {
      return new Error();
    }
  }

  // 2. find() ------------------------------------------------------------------------------------>
  public find(): string[] | Error {

    const falseResult = [
      /(?<=[a-zA-Z0-9])=(?=[a-zA-Z0-9])/,
      /(?<=[a-zA-Z0-9]) =(?=[a-zA-Z0-9])/,
      /(?<=[a-zA-Z0-9])= (?=[a-zA-Z0-9])/
    ];

    const result: string[] = [];

    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }

    try {
      Array.from(data).forEach((param) => {
        if(falseResult.some((regex) => regex.test(param))) {
          result.push("False : " + param);
        }
      });
      return result;
    }
    catch(err) {
      return new Error();
    }
  }

  // 3. update() ---------------------------------------------------------------------------------->
  public update(): string[] | Error {

    const falseResult = [
      /(?<=[a-zA-Z0-9])=(?=[a-zA-Z0-9])/,
      /(?<=[a-zA-Z0-9]) =(?=[a-zA-Z0-9])/,
      /(?<=[a-zA-Z0-9])= (?=[a-zA-Z0-9])/
    ];

    const result:string[] = [];
    const data = this.data();
    if(data instanceof Error) {
      return new Error();
    }

    try {
      Array.from(data).forEach((param) => {
        let updatedParam = param;
        falseResult.forEach((regex) => {
          if(regex.test(updatedParam)) {
            updatedParam = updatedParam.replace(regex, " = ");
          }
        });
        result.push(updatedParam);
      });
      fs.writeFileSync(this.copyPath(), result.join("\n"), "utf-8");
      return result;
    }
    catch(err) {
      return new Error();
    }
  }

  // 4. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      const results = this.find();
      if(results instanceof Error) {
        throw results;
      }
      results.forEach((result) => {
        console.log(result);
      });

      console.log("_____________________");
      console.log("Updated data:");
      const updatedData = this.update();
      if(updatedData instanceof Error) {
        throw updatedData;
      }
      updatedData.forEach((line) => {
        console.log(line);
      });
    }
    catch(err) {
      console.log("_____________________");
      console.log("Error:", err);
    }
  }
}

export default EqualRules;