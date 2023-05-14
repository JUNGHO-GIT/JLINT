"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const vscode = require("vscode");
const Contents_1 = require("../../core/Contents");
class Semicolon {
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
            const rulesOne = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
            const result = lodash.chain(data)
                .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
                return `${p1}${p2}${p4}\n${p1}${p5}`;
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
exports.default = Semicolon;
//# sourceMappingURL=Semicolon.js.map