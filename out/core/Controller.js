"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __importDefault(require("vscode"));
class Controller {
    // 0. resource ---------------------------------------------------------------------------------->
    fileExt = vscode_1.default.window.activeTextEditor?.document.languageId || "";
    // 1. common ------------------------------------------------------------------------------------>
    common() {
        const commonTitle = "common";
        const commonArray = [
            "Contents", "Tags"
        ];
        const commonImport = commonArray.map((item) => {
            return require(`../rules/${commonTitle}/${item}`).default;
        });
        const commonInit = commonArray.map((item, index) => new commonImport[index]());
        return commonInit.map((item) => item.output()).join("");
    }
    // 2. lang -------------------------------------------------------------------------------------->
    lang() {
        const langTitle = "lang";
        const langArray = [
            "java", "javascript", "typescript", "html", "css", "xml", "jsp"
        ];
        if (this.fileExt) {
            const langIndex = langArray.indexOf(this.fileExt);
            if (langIndex !== -1) {
                const langClass = langArray[langIndex].charAt(0).toUpperCase() + langArray[langIndex].slice(1);
                const langImport = require(`../rules/${langTitle}/${langClass}`).default;
                console.log("_____________________\n" + this.fileExt + " 파일 지원 가능 !!! ");
                return new langImport().output();
            }
            else {
                return console.log("_____________________\n" + this.fileExt + " 파일 지원 불가능 !!! ");
            }
        }
    }
    // 2. syntax  ----------------------------------------------------------------------------------->
    syntax() {
        const syntaxTitle = "syntax";
        const syntaxArray = [
            "Brackets", /*"Quote", "Comma", "Semicolon" */
        ];
        const syntaxImport = syntaxArray.map((item) => {
            return require(`../rules/${syntaxTitle}/${item}`).default;
        });
        const syntaxInit = syntaxArray.map((item, index) => new syntaxImport[index]());
        return syntaxInit.map((item) => item.output()).join("");
    }
    // 3. logic ------------------------------------------------------------------------------------->
    logic() {
        const logicTitle = "logic";
        const logicArray = [
            "If", "Else", "Elseif", "Try", "Catch", "Finally"
        ];
        const logicImport = logicArray.map((item) => {
            return require(`../rules/${logicTitle}/${item}`).default;
        });
        const logicInit = logicArray.map((item, index) => new logicImport[index]());
        return logicInit.map((item) => item.output()).join("");
    }
    // 4. extra ------------------------------------------------------------------------------------->
    extra() {
        const extraTitle = "extra";
        const extraArray = [
            "Line", "LineBreak", "Space", "Spell",
        ];
        const extraImport = extraArray.map((item) => {
            return require(`../rules/${extraTitle}/${item}`).default;
        });
        const extraInit = extraArray.map((item, index) => new extraImport[index]());
        return extraInit.map((item) => item.output()).join("");
    }
}
exports.default = Controller;
//# sourceMappingURL=Controller.js.map