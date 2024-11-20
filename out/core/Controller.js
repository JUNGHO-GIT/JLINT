"use strict";
// Controller.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
// -------------------------------------------------------------------------------------------------
class Controller {
    // 0. resource ---------------------------------------------------------------------------------->
    fileExt = vscode.window.activeTextEditor?.document.languageId;
    // 1. common ------------------------------------------------------------------------------------>
    common(conf) {
        let commonTitle = "common";
        let commonArray2 = [];
        // RemoveComments 가 true인 경우
        if (conf.RemoveComments) {
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
    lang(conf) {
        let langTitle = "lang";
        let langArray2 = [
            "javascript", "javascriptreact", "typescript", "typescriptreact", "java", "jsp", "html", "css", "xml", "json"
        ];
        // ActivateLint 가 true인 경우
        if (conf.ActivateLint) {
            const langIndex = langArray2.indexOf(this.fileExt);
            const langClass = langArray2[langIndex].charAt(0).toUpperCase() + langArray2[langIndex].slice(1);
            const langImport = require(`../rules/${langTitle}/${langClass}`).default;
            return new langImport().output();
        }
        // ActivateLint 가 false인 경우
        else {
            return console.log(`_____________________\nActivateLint is false ('lang')`);
        }
    }
    // 2. syntax  ----------------------------------------------------------------------------------->
    syntax(conf) {
        let syntaxTitle = "syntax";
        let syntaxArray2 = [
            "Brackets"
        ];
        // ActivateLint 가 true인 경우
        if (conf.ActivateLint) {
            const syntaxImport = syntaxArray2.map((item) => {
                return require(`../rules/${syntaxTitle}/${item}`).default;
            });
            const syntaxInit = syntaxArray2.map((item, index) => new syntaxImport[index]());
            return syntaxInit.map((item) => item.output()).join("");
        }
        // ActivateLint 가 false인 경우
        else {
            return console.log(`_____________________\nActivateLint is false ('syntax')`);
        }
    }
    // 3. logic ------------------------------------------------------------------------------------->
    logic(conf) {
        let logicTitle = "logic";
        let logicArray2 = [
            "IfElse", "TryCatch"
        ];
        // ActivateLint 가 true인 경우
        if (conf.ActivateLint) {
            const logicImport = logicArray2.map((item) => {
                return require(`../rules/${logicTitle}/${item}`).default;
            });
            const logicInit = logicArray2.map((item, index) => new logicImport[index]());
            return logicInit.map((item) => item.output()).join("");
        }
        // ActivateLint 가 false인 경우
        else {
            return console.log(`_____________________\nActivateLint is false ('logic')`);
        }
    }
    // 4. extra ------------------------------------------------------------------------------------->
    extra(conf) {
        let extraTitle = "extra";
        let extraArray2 = [];
        // InsertLine 가 true인 경우
        if (conf.InsertLine) {
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
exports.default = Controller;
//# sourceMappingURL=Controller.js.map