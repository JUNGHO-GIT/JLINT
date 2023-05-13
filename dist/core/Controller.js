"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class Controller {
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. common ------------------------------------------------------------------------------------>
    common() {
        const commonTitle = "common";
        const commonArray = [
            "ReadTitle", "CopyFile", "ReadContents"
        ];
        const commonImport = commonArray.map((item) => {
            return require(`../rules/class/${commonTitle}/${item}`).default;
        });
        const commonInit = commonArray.map((item, index) => new commonImport[index]());
        return commonInit.map((item) => item.output()).join("");
    }
    // 2. lang -------------------------------------------------------------------------------------->
    lang() {
        const langTitle = "lang";
        const langArray = [
            ".java", ".ts", ".js", ".css", ".html", ".jsp", ".xml"
        ];
        const langIndex = langArray.indexOf(this.fileExt);
        if (langIndex !== -1) {
            const langClass = langArray[langIndex].slice(1, 2).toUpperCase() + langArray[langIndex].slice(2).toLowerCase();
            const langImport = require(`../rules/class/${langTitle}/${langClass}`).default;
            const langInstance = new langImport();
            return langInstance.output();
        }
        else {
            return console.log("_____________________\n" + this.fileExt + " is not supported.\n_____________________\n");
        }
    }
    // 3. components -------------------------------------------------------------------------------->
    components() {
        const componentsTitle = "components";
        const componentsArray = [
            "Comma", "Quote", "Semicolon", "Brackets"
        ];
        const componentsImport = componentsArray.map((item) => {
            return require(`../rules/class/${componentsTitle}/${item}`).default;
        });
        const componentsInit = componentsArray.map((item, index) => new componentsImport[index]());
        return componentsInit.map((item) => item.output()).join("");
    }
    // 4. syntax  ----------------------------------------------------------------------------------->
    syntax() {
        const syntaxTitle = "syntax";
        const syntaxArray = [
            "If", "Else", "Elseif", "Try", "Catch", "Finally"
        ];
        const syntaxImport = syntaxArray.map((item) => {
            return require(`../rules/class/${syntaxTitle}/${item}`).default;
        });
        const syntaxInit = syntaxArray.map((item, index) => new syntaxImport[index]());
        return syntaxInit.map((item) => item.output()).join("");
    }
    // 5. extra ------------------------------------------------------------------------------------->
    extra() {
        const extraTitle = "extra";
        const extraArray = [
            "Sql", "Return", "Import", "Line"
        ];
        const extraImport = extraArray.map((item) => {
            return require(`../rules/class/${extraTitle}/${item}`).default;
        });
        const extraInit = extraArray.map((item, index) => new extraImport[index]());
        return extraInit.map((item) => item.output()).join("");
    }
}
exports.default = Controller;
