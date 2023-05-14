"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const vscode = require("vscode");
const Contents_1 = require("../../core/Contents");
class Import {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().data();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        if (this.filePath) {
            const data = this.data();
            const rulesOne = /(\s*)(;)(\s*)(\n?)(\s*)(import)/gm;
            const rulesTwo = /(\s*)(package)(\s*)([\s\S]*?)(;)(\n)(\s*)(import)/gm;
            const rulesThree = /(\s*)(\))(\s+)(;)/gm;
            const rulesFour = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
            const result = lodash.chain(data)
                .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6) => {
                return `${p2}\n${p6}`;
            })
                .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p2} ${p4}${p5}${p6}\n${p8}`;
            })
                .replace(rulesThree, (match, p1, p2, p3, p4) => {
                return `${p1}${p2}${p4}`;
            })
                .replace(rulesFour, (match, p1, p2, p3, p4, p5, p6) => {
                return `${p1}${p2}${p4} ${p6}`;
            })
                .value();
            fs.writeFileSync(this.filePath, result);
            return result;
        }
        else {
            return new Error("파일 경로를 찾을 수 없습니다.");
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Import;
//# sourceMappingURL=Import.js.map