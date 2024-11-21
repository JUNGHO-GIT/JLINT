"use strict";
// Space.ts
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
class Space {
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
        return new Contents_js_1.default();
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
        const rules1 = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
        const rules2 = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => (`${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`))
            .replace(rules2, (_, p1, p2, p3, p4, p5) => (`${p2}${p3}${p4}${p5}`))
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-2. Java -------------------------------------------------------------------------------------
    Java() {
        const data = this.data();
        const rules1 = /(\s*)(\))(\s+)(;)/gm;
        const rules2 = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
        const rules3 = /(\s*?)(ception)(\{)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4) => (`${p1}${p2}${p4}`))
            .replace(rules2, (_, p1, p2, p3, p4, p5, p6) => (`${p1}${p2}${p4} ${p6}`))
            .replace(rules3, (_, p1, p2, p3) => (`${p2} ${p3}`))
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    ;
    // 4-3. HtmlJsp ----------------------------------------------------------------------------------
    HtmlJsp() {
        const data = this.data();
        const rules1 = /(<%@)(\s*)(page|include|taglib|directive)(\s*)/gm;
        const rules2 = /(\s*)(["])(\s*)(%>)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4) => (`${p1} ${p3}${p4}`))
            .replace(rules2, (_, p1, p2, p3, p4) => (`${p1}${p2} ${p4}`))
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
            console.log(`_____________________\nfileExt: '${this.fileExt}'`);
        }
    }
}
exports.default = Space;
