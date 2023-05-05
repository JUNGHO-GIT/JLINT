import readFile from "../components/Read";

class JsRules {

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const readInit = new readFile();
    const dataFile = readInit.readFile();
    const data = dataFile.toString().split("\n");

    return data;
  }

  // 2. main -------------------------------------------------------------------------------------->
  public jsRules() {
    const data = this.data();

    const trueResult = [" = "];
    const falseResult = ["= "," =","="];
    const result: string[] = [];

    data.forEach((param) => {
      if(trueResult.some((item) => param.includes(item))) {
        result.push("True : " + param);
      } else if(falseResult.some((item) => param.includes(item))) {
        result.push("False : " + param);
      }
    });

    return result;
  }

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      console.log("_____________________");
      const results = this.jsRules();
      results.forEach((result) => {
        console.log(result);
      });
    }
    catch(err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }
}

export default JsRules;
