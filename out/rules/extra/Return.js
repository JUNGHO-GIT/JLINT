"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const vscode = require("vscode");
const Contents_1 = require("../../core/Contents");
class Return {
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
            const rulesOne = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
            const rulesTwo = /(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
            const rulesThree = /(^\s*)(public|private)(\s*?)([\s\S]*?)(@?)(\s*)([\s\S]|(\n+)?)(\s*)(\))(\s*)(\{)/gm;
            const result = lodash.chain(data)
                .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6, p7) => {
                return `${p1} ${p3}\n${p6}${p7}`;
            })
                .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p2}\n${p7}${p8}`;
            })
                .replace(rulesThree, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p10} ${p12}`;
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
exports.default = Return;
//# sourceMappingURL=Return.js.map