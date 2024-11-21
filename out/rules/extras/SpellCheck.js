"use strict";
// SpellCheck.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
const Contents_js_1 = __importDefault(require("../../contents/Contents.js"));
// -------------------------------------------------------------------------------------------------
class SpellCheck {
    // 0. resource -----------------------------------------------------------------------------------
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
    // 1. constructor --------------------------------------------------------------------------------
    constructor() {
        this.main();
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return new Contents_js_1.default().main();
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        if (this.fileExt === "javascript" || this.fileExt === "javascriptreact") {
            return this.JsTs();
        }
        if (this.fileExt === "typescript" || this.fileExt === "typescriptreact") {
            return this.JsTs();
        }
        if (this.fileExt === "java") {
            return this.Java();
        }
        if (this.fileExt === "html" || this.fileExt === "jsp") {
            return this.HtmlJsp();
        }
        if (this.fileExt === "css") {
            return this.Css();
        }
        if (this.fileExt === "xml") {
            return this.Xml();
        }
        if (this.fileExt === "json") {
            return this.Json();
        }
        if (this.fileExt === "sql") {
            return this.Sql();
        }
        return this.output();
    }
    // 4-1. JsTs -------------------------------------------------------------------------------------
    JsTs() {
        const data = this.data();
        const rules1 = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
            return `${p1}${p2}${p3}${p4}${p5}${p13}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-2. Java -------------------------------------------------------------------------------------
    Java() {
        const data = this.data();
        const rules1 = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
        const rules2 = /(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm;
        const rules3 = /(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
            return `${p1}${p2}${p3}${p4}${p5}${p13}`;
        })
            .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7, p8) => {
            return `${p4}${p5}\n${p2}${p3}\n${p7}${p8}`;
        })
            .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8) => {
            return `${p1}${p2}${p3}${p4}${p5}\n${p7}${p8}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-3. HtmlJsp ----------------------------------------------------------------------------------
    HtmlJsp() {
        const data = this.data();
        const rules1 = /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
            return `${p1}${p2}${p3}${p4}${p11}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-4. Css --------------------------------------------------------------------------------------
    Css() { }
    // 4-6. Xml --------------------------------------------------------------------------------------
    Xml() { }
    // 4-7. Json -------------------------------------------------------------------------------------
    Json() { }
    // 4-8. Sql --------------------------------------------------------------------------------------
    Sql() { }
    // 5. output -------------------------------------------------------------------------------------
    output() {
        if (this.fileExt === "javascript" ||
            this.fileExt === "javascriptreact" ||
            this.fileExt === "typescript" ||
            this.fileExt === "typescriptreact" ||
            this.fileExt === "java" ||
            this.fileExt === "html" ||
            this.fileExt === "jsp") {
            console.log(`_____________________\nActivated! ('${this.activePath}')`);
        }
        else {
            console.log(`_____________________\nSpellCheck not supported ('${this.fileExt}')`);
        }
    }
}
exports.default = SpellCheck;
