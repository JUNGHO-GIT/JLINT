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
      return require(`../rules/${commonTitle}/${item}`).default;
    });
    const commonInit = commonArray.map((_item, index) => new commonImport[index]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 2. components -------------------------------------------------------------------------------->
  public components() {
    const componentsTitle
    = "common";
    const componentsArray = [
      "Equal", "Comma", "Quote", "Semicolon", "Brackets", "Operators"
    ];
    const componentsImport = componentsArray.map((item) => {
      return require(`../rules/${componentsTitle}/${item}`).default;
    });
    const componentsInit = componentsArray.map((item, index) => new componentsImport[index]());

    return componentsInit.map((item) => item.output()).join("");
  }

  // 3. lang -------------------------------------------------------------------------------------->
  public lang() {
    const langTitle = "lang";
    const langArray = [
      ".java", ".ts", ".js"
    ];

    const langIndex = langArray.indexOf(this.fileExt);
    if (langIndex !== -1) {
      const langClass = langArray[langIndex].slice(1).toUpperCase();
      const langImport = require(`../rules/${langTitle}/${langClass}`).default;
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
      return require(`../rules/${syntaxTitle}/${item}`).default;
    });
    const syntaxInit = syntaxArray.map((_item, index) => new syntaxImport[index]());

    return syntaxInit.map((item) => item.output()).join("");
  }

  // 5. special ----------------------------------------------------------------------------------->
  public special() {
    const specialTitle
    = "special";
    const specialArray = [
      "Sql",  "Return", "Import", "Line"
    ];
    const specialImport = specialArray.map((item) => {
      return require(`../rules/${specialTitle}/${item}`).default;
    });
    const specialInit = specialArray.map((_item, index) => new specialImport[index]());

    return specialInit.map((item) => item.output()).join("");
  }

}

export default Controller;