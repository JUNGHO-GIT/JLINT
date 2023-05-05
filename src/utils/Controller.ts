import Recognize from "../components/Recognize";

class Controller {

  public controller() {

    const languageArray = [
      ".js",".ts",".json",".html",".css",".scss",".md",".java",".xml",".yml",".py",".sh",".bat",".c",".cpp",".cs",".go",".kt",".php",".rb",".rs",".scala",".swift",".vb"
    ];

    const recognizeInit = new Recognize();
    const data = recognizeInit.main().toString();
    for(const item of languageArray) {
      if(data === item) {
        const lang = item.replace(".","").replace(/^[a-z]/,(v) => v.toUpperCase()) + "Rules";
        const langRulesModule = await import(`../lang/${lang}`);
        const langRulesInit = new langRulesModule.main();
        const langRulesResult = langRulesInit.outPut();

        result = langRulesResult;
      }
    }

    return result;
  }
}

export default Controller;