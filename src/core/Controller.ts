import vscode from "vscode";

class Controller {

  // 0. resource ---------------------------------------------------------------------------------->
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. common ------------------------------------------------------------------------------------>
  public common(paramArray: string[]) {

    const commonTitle
    = "common";

    const commonArray1 = [
      "Contents", "SingleTags", "RemoveComments"
    ];

    const commonArray2 = commonArray1.filter((item) => !paramArray.includes(item));

    const commonImport = commonArray2.map((item) => {
      return require(`../rules/${commonTitle}/${item}`).default;
    });
    const commonInit = commonArray2.map((item, index) => new commonImport[index]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 2. lang -------------------------------------------------------------------------------------->
  public lang(paramArray: string[]) {

    const langTitle
    = "lang";

    const langArray1 = [
      "javascript", "javascriptreact", "typescript", "typescriptreact", "java", "jsp",  "html", "css", "xml", "json"
    ];

    const langArray2 = langArray1.filter((item) => !paramArray.includes(item));

    if(this.fileExt) {
      const langIndex = langArray2.indexOf(this.fileExt);
      if (langIndex !== -1) {

        const langClass = langArray2[langIndex].charAt(0).toUpperCase() + langArray2[langIndex].slice(1);
        const langImport = require(`../rules/${langTitle}/${langClass}`).default;
        console.log("_____________________\n" + this.fileExt + " 파일 지원 가능 ");
        return new langImport().output();
      }
      else {
        return console.log("_____________________\n" + this.fileExt + " 파일 지원 불가능 ");
      }
    }
  }

  // 2. syntax  ----------------------------------------------------------------------------------->
  public syntax(paramArray: string[]) {

    const syntaxTitle
    = "syntax";

    const syntaxArray1 = [
      "Brackets"
    ];

    const syntaxArray2 = syntaxArray1.filter((item) => !paramArray.includes(item));

    const syntaxImport = syntaxArray2.map((item) => {
      return require(`../rules/${syntaxTitle}/${item}`).default;
    });
    const syntaxInit = syntaxArray2.map((item, index) => new syntaxImport[index]());

    return syntaxInit.map((item) => item.output()).join("");
  }

  // 3. logic ------------------------------------------------------------------------------------->
  public logic(paramArray: string[]) {

    const logicTitle
    = "logic";

    const logicArray1 = [
      "IfElse", "TryCatch"
    ];

    const logicArray2 = logicArray1.filter((item) => !paramArray.includes(item));

    const logicImport = logicArray2.map((item) => {
      return require(`../rules/${logicTitle}/${item}`).default;
    });
    const logicInit = logicArray2.map((item, index) => new logicImport[index]());

    return logicInit.map((item) => item.output()).join("");
  }

  // 4. extra ------------------------------------------------------------------------------------->
  public extra(paramArray: string[]) {

    const extraTitle
    = "extra";

    const extraArray1 = [
      "InsertLine", "SpellCheck", "LineBreak", "Space",
    ];

    const extraArray2 = extraArray1.filter((item) => !paramArray.includes(item));

    const extraImport = extraArray2.map((item) => {
      return require(`../rules/${extraTitle}/${item}`).default;
    });
    const extraInit = extraArray2.map((item, index) => new extraImport[index]());

    return extraInit.map((item) => item.output()).join("");
  }
}

export default Controller;