import vscode from "vscode";

class Controller {

  // 0. resource ---------------------------------------------------------------------------------->
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. common ------------------------------------------------------------------------------------>
  public common(paramArray: string[]) {

    const commonTitle
    = "common";

    let commonArray2 = [];
    // RemoveComments 가 true인 경우
    if (paramArray.includes("RemoveComments")) {
      commonArray2 = ["Contents", "SingleTags", "RemoveComments"];
    }
    // RemoveComments 가 false인 경우
    else {
      commonArray2 = ["Contents", "SingleTags"];
    }

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

    const langArray2 = [
      "javascript", "javascriptreact", "typescript", "typescriptreact", "java", "jsp",  "html", "css", "xml", "json"
    ];

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

    const syntaxArray2 = [
      "Brackets"
    ];

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

    const logicArray2 = [
      "IfElse", "TryCatch"
    ];

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

    let extraArray2 = [];
    // InsertLine 가 true인 경우
    if (paramArray.includes("InsertLine")) {
      extraArray2 = ["InsertLine", "SpellCheck", "LineBreak", "Space"];
    }
    // InsertLine 가 false인 경우
    else {
      extraArray2 = ["SpellCheck", "LineBreak", "Space"];
    }

    const extraImport = extraArray2.map((item) => {
      return require(`../rules/${extraTitle}/${item}`).default;
    });
    const extraInit = extraArray2.map((item, index) => new extraImport[index]());

    return extraInit.map((item) => item.output()).join("");
  }
}

export default Controller;