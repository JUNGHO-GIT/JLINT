"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
class Contents {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.data(); }
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    fileName = vscode.window.activeTextEditor?.document.fileName;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        if (this.filePath) {
            // 1. 파일 내용 읽기
            const content = fs.readFileSync(this.filePath, "utf8");
            // 2. 들여쓰기 변경
            const updateContent = content.split("\n").map(line => {
                const indentMatch = line.match(/^(\s+)/);
                if (indentMatch) {
                    const spaces = indentMatch[1].length;
                    const newIndent = Math.ceil(spaces / 2) * 2;
                    return line.replace(/^(\s+)/, " ".repeat(newIndent));
                }
                return line;
            }).join("\n");
            if (this.filePath) {
                fs.writeFileSync(this.filePath, updateContent, "utf8");
            }
            return updateContent;
        }
    }
    // 2. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.fileName + "  실행");
    }
}
exports.default = Contents;
//# sourceMappingURL=Contents.js.map