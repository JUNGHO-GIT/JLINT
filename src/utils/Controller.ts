import path from "path";

class Controller {

  // 0. path -------------------------------------------------------------------------------------->
  [index: string]: any;
  private filePath = process.argv[2];
  private fileName = path.basename(__filename);
  private fileExt = path.extname(this.filePath);
  private copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;

  // 2. components -------------------------------------------------------------------------------->
  public components() {
    const componentsTitle
    = "components";
    const componentsArray = [
      "ReadTitle", "Copy", "ReadContents", "Recognize"
    ];
    const componentsImport = componentsArray.map((item) => {
      return require(`../rules/${componentsTitle}/${item}`).default;
    });
    const componentsInit = componentsArray.map((_item, index) => new componentsImport[index]());

    return componentsInit.map((item) => item.output()).join("");
  }

  // 5. lang -------------------------------------------------------------------------------------->
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

  // 3. common ------------------------------------------------------------------------------------>
  public common() {
    const commonTitle
    = "common";
    const commonArray = [
      "Equal", "Comma", "Quote", /* "Semicolon" */, "Brackets", "Operators"
    ];
    const commonImport = commonArray.map((item) => {
      return require(`../rules/${commonTitle}/${item}`).default;
    });
    const commonInit = commonArray.map((_item, index) => new commonImport[index]());

    return commonInit.map((item) => item.output()).join("");
  }

  // 4. special ----------------------------------------------------------------------------------->
  public special() {
    const specialTitle
    = "special";
    const specialArray = [
      "Sql", "Line", "Import"
    ];
    const specialImport = specialArray.map((item) => {
      return require(`../rules/${specialTitle}/${item}`).default;
    });
    const specialInit = specialArray.map((_item, index) => new specialImport[index]());

    return specialInit.map((item) => item.output()).join("");
  }

  // 6. syntex  ----------------------------------------------------------------------------------->
  public syntex() {
    const syntexTitle
    = "syntex";
    const syntexArray = [
      "If", "Else", "Elseif", "Try", "Catch", "Finally"
    ];
    const syntexImport = syntexArray.map((item) => {
      return require(`../rules/${syntexTitle}/${item}`).default;
    });
    const syntexInit = syntexArray.map((_item, index) => new syntexImport[index]());

    return syntexInit.map((item) => item.output()).join("");
  }
}

export default Controller;