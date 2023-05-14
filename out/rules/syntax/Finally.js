"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const vscode = require("vscode");
const Contents_1 = require("../../core/Contents");
class Finally {
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
            const rulesOne = /(^.*)(.*)(\})(\n)(\s*)(finally)(\s*)(\{)(\})/gm;
            const rulesTwo = /(^.*)(.*)(\})(\n)(\s*)(finally)(\s*)(\{)/gm;
            const rulesThree = /(^.*)(.*)(\})(\s*)(finally)(\s*)(\{)/gm;
            const result = lodash.chain(data)
                .replace(new RegExp(rulesOne, "gm"), (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                return `${p1}${p2}${p3}${p4}${p5}${p6} ${p8}\n${p1}${p9}`;
            })
                .replace(new RegExp(rulesTwo, "gm"), (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p1}${p3}\n${p1}${p6} ${p8}`;
            })
                .replace(new RegExp(rulesThree, "gm"), (match, p1, p2, p3, p4, p5, p6, p7) => {
                return `${p1}${p3}\n${p1}${p5} ${p7}`;
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
exports.default = Finally;
//# sourceMappingURL=Finally.js.map