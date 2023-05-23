"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
const Contents_1 = __importDefault(require("../common/Contents"));
class LineBreak {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    fileExt = vscode_1.default.window.activeTextEditor?.document.languageId || "";
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().main().toString();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        return this.js() + this.ts() + this.java() + this.html();
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
    // 4-1. js -------------------------------------------------------------------------------------->
    js() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3) => {
                return `${p1}\n${p3}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-2. ts -------------------------------------------------------------------------------------->
    ts() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(^.\s*?)(@)(.*)(\n+)(\s*)(\/\/.*?>)(\n+)(\s+)(public|private|function)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                return `${p5}${p6}\n${p5}${p2}${p3}\n${p8}${p9}${p10}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-3. java ------------------------------------------------------------------------------------>
    java() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
            const rules2 = /(\s*)(package)(\s*)([\s\S]*?)(;)(\n)(\s*)(import)/gm;
            const rules3 = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
            const rules4 = /(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
            const rules5 = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
            const rules6 = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
            const rules7 = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
            const rules8 = /(^\s*)(public|private)(\s*)([\s\S]*?)(\s*)(\{)(\n*)(\s*)(.*)/gm;
            const rules9 = /(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4, p5, p6) => {
                return `${p2}\n${p6}`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p2} ${p4}${p5}${p6}\n${p8}`;
            })
                .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7) => {
                return `${p1} ${p3}\n${p6}${p7}`;
            })
                .replace(rules4, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p2}\n${p7}${p8}`;
            })
                .replace(rules5, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
            })
                .replace(rules6, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                return `${p1}${p2}${p3}${p4}\n`;
            })
                .replace(rules7, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
                return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
            })
                .replace(rules8, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                return `${p1}${p2}${p3}${p4}${p5}${p6}\n\n${p8}${p9}`;
            })
                .replace(rules9, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
                return `${p1}\n\n${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-4. jsp ------------------------------------------------------------------------------------->
    jsp() { }
    // 4-5. html ------------------------------------------------------------------------------------>
    html() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(?:\n*)(\s*)(<\/body>)(\s*?)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3) => {
                return `\n\n${p1}${p2}${p3}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-6. css ------------------------------------------------------------------------------------->
    css() { }
    // 4-7. xml ------------------------------------------------------------------------------------->
    xml() { }
    // 4-8. json ------------------------------------------------------------------------------------>
    json() { }
    // 4-9. sql ------------------------------------------------------------------------------------->
    sql() { }
}
exports.default = LineBreak;
//# sourceMappingURL=LineBreak.js.map