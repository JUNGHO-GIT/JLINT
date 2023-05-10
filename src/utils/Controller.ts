import path from "path";

class Controller {

  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 1. common ------------------------------------------------------------------------------------>
  public common() {
    const commonTitle
    = "common";
    const commonArray = [
      "ReadTitle", "CopyFile", "ReadContents", "Recognize", "RemoveComments"
    ];
    const commonImport = commonArray.map((item) => {
      return require(`../rules/class/${commonTitle}/${item}`).default;
    });
    const commonInit = commonArray.map((item, index) => new commonImport[index]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 2. components -------------------------------------------------------------------------------->
  public components() {
    const componentsTitle
    = "components";
    const componentsArray = [
      "Equal", "Comma", "Quote", "Semicolon", "Brackets", "Operators"
    ];
    const componentsImport = componentsArray.map((item) => {
      return require(`../rules/class/${componentsTitle}/${item}`).default;
    });
    const componentsInit = componentsArray.map((item, index) => new componentsImport[index]());

    return componentsInit.map((item) => item.output()).join("");
  }

  // 3. lang -------------------------------------------------------------------------------------->
  public lang() {
    const langTitle = "lang";
    const langArray = [
      ".java", ".ts", ".js", ".css"
    ];

    const langIndex = langArray.indexOf(this.fileExt);
    if (langIndex !== -1) {
      const langClass = langArray[langIndex].slice(1).toUpperCase();
      const langImport = require(`../rules/class/${langTitle}/${langClass}`).default;
      const langInstance = new langImport();

      return langInstance.output();
    }
    else {
      return "file extension is not supported";
    }
  }

  // 4. syntax  ----------------------------------------------------------------------------------->
  public syntax() {
    const syntaxTitle
    = "syntax";
    const syntaxArray = [
      "If", "Else", "Elseif", "Try", "Catch", "Finally"
    ];
    const syntaxImport = syntaxArray.map((item) => {
      return require(`../rules/class/${syntaxTitle}/${item}`).default;
    });
    const syntaxInit = syntaxArray.map((item, index) => new syntaxImport[index]());

    return syntaxInit.map((item) => item.output()).join("");
  }

  // 5. extra ----------------------------------------------------------------------------------->
  public extra() {
    const extraTitle
    = "extra";
    const extraArray = [
      "Sql",  "Return", "Import", "Line"
    ];
    const extraImport = extraArray.map((item) => {
      return require(`../rules/class/${extraTitle}/${item}`).default;
    });
    const extraInit = extraArray.map((item, index) => new extraImport[index]());

    return extraInit.map((item) => item.output()).join("");
  }

}

export default Controller;