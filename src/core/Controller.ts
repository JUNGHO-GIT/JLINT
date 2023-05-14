import * as lodash from "lodash";
import * as vscode from "vscode";

class Controller {

  // 0. resource ---------------------------------------------------------------------------------->
  private fileExt = vscode.window.activeTextEditor?.document.languageId;

  // 1. lang -------------------------------------------------------------------------------------->
  public lang() {
    const langTitle
    = "lang";
    const langArray = [
      "java", "javascript", "typescript", "html", "css", "xml", "jsp"
    ];

    if(this.fileExt) {
      const langIndex = langArray.indexOf(this.fileExt);
      if (langIndex !== -1) {
        const langClass = lodash.capitalize(langArray[langIndex]);
        const langImport = require(`../rules/${langTitle}/${langClass}`).default;
        const langInstance = new langImport();
        return langInstance.output();
      }
      else {
        return console.log("_____________________\n" + this.fileExt + " is not supported.");
      }
    }
  }

  // 2. components -------------------------------------------------------------------------------->
  public components() {
    const componentsTitle
    = "components";
    const componentsArray = [
      "Comma", "Quote", "Semicolon", "Brackets"
    ];
    const componentsImport = componentsArray.map((item) => {
      return require(`../rules/${componentsTitle}/${item}`).default;
    });
    const componentsInit = componentsArray.map((item, index) => new componentsImport[index]());

    return componentsInit.map((item) => item.output()).join("");
  }


  // 3. syntax  ----------------------------------------------------------------------------------->
  public syntax() {
    const syntaxTitle
    = "syntax";
    const syntaxArray = [
      "If", "Else", "Elseif", "Try", "Catch", "Finally"
    ];
    const syntaxImport = syntaxArray.map((item) => {
      return require(`../rules/${syntaxTitle}/${item}`).default;
    });
    const syntaxInit = syntaxArray.map((item, index) => new syntaxImport[index]());

    return syntaxInit.map((item) => item.output()).join("");
  }

  // 4. extra ------------------------------------------------------------------------------------->
  public extra() {
    const extraTitle
    = "extra";
    const extraArray = [
      "Sql",  "Return", "Import", "Line"
    ];
    const extraImport = extraArray.map((item) => {
      return require(`../rules/${extraTitle}/${item}`).default;
    });
    const extraInit = extraArray.map((item, index) => new extraImport[index]());

    return extraInit.map((item) => item.output()).join("");
  }

  // 5. main -------------------------------------------------------------------------------------->
  public main() {
    return this.lang() + this.components() + this.syntax() + this.extra();
  }
}

export default Controller;