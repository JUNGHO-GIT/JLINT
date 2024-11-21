"use strict";
// LineBreak.ts
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
class LineBreak {
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
        const rules1 = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p1}\n${p3}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-2. Java -------------------------------------------------------------------------------------
    Java() {
        const data = this.data();
        const rules1 = /(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
        const rules2 = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
        const rules3 = /(?<!package.*)(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
        const rules4 = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
        const rules5 = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
        const rules6 = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
        const rules7 = /(^\s*)(public|private)(\s*)([\s\S]*?)(\s*)(\{)(\n*)(\s*)(.*)/gm;
        const rules8 = /(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
        const rules9 = /(import.*)(;)(\n*)(\/\/ --)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6) => {
            return `${p2}\n${p6}`;
        })
            .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7) => {
            return `${p1} ${p3}\n${p6}${p7}`;
        })
            .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8) => {
            return `${p2}\n${p7}${p8}`;
        })
            .replace(rules4, (_, p1, p2, p3, p4, p5, p6, p7, p8) => {
            return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
        })
            .replace(rules5, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
            return `${p1}${p2}${p3}${p4}\n`;
        })
            .replace(rules6, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
            return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
        })
            .replace(rules7, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
            return `${p1}${p2}${p3}${p4}${p5}${p6}\n\n${p8}${p9}`;
        })
            .replace(rules8, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
            return `${p1}\n\n${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}`;
        })
            .replace(rules9, (_, p1, p2, p3, p4) => {
            return `${p1}${p2}\n\n${p4}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4-3. HtmlJsp ----------------------------------------------------------------------------------
    HtmlJsp() {
        const data = this.data();
        const rules1 = /(?:\n*)(\s*)(<\/body>)(\s*?)/gm;
        const rules2 = /(.*?)(\n*)(\s*)(\/\/ -.*>)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `\n\n${p1}${p2}${p3}`;
        })
            .replace(rules2, (_, p1, p2, p3, p4) => {
            return `${p1}\n\n${p3}${p4}`;
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
            console.log(`_____________________\nLineBreak not supported ('${this.fileExt}')`);
        }
    }
}
exports.default = LineBreak;
