import Recognize from "../../components/Recognize";

class Controller {

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    const data = new Recognize().main().toString();

    try {
      if(data) {
        return data;
      }
      else {
        throw new Error();
      }
    }
    catch(err) {
      console.log("_____________________");
      console.log(new Error());
    }
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {

    const data = this.data();
    const languageArray = [".java", ".js", ".ts"];
    let result: string[] = [];

    const EqualRules = require(`../common/EqualRules`).default;
    const equalRulesInit = new EqualRules();
    const equalRulesResult = equalRulesInit.outPut();

    for(const item of languageArray) {
      if(data === item) {
        const lang = item.replace(".","").replace(/^[a-z]/,(v) => v.toUpperCase()) + "Rules";
        let langRulesResult: string[] = [];
        try {
          const langRulesModule = require(`../lang/${lang}`).default;
          const langRulesInit = new langRulesModule();
          langRulesResult = langRulesInit.outPut();
        }
        catch(err) {
          console.warn("_____________________");
          console.warn(`${lang} 모듈이 없거나, 파일내용이 없습니다.`);
        }

        if(Array.isArray(equalRulesResult)) {
          result = [...equalRulesResult,...langRulesResult];
        }
        else {
          result = langRulesResult;
        }
        break;
      }
    }

    return result || [];
  };

  // 3. outPut ------------------------------------------------------------------------------------>
  public outPut() {
    try {
      const results = this.main();
      results.forEach((result) => {
        console.log(result);
      });
    }
    catch(err) {
      console.log(err);
    }
  }

}

export default Controller;