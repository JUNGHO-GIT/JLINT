"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const vscode_1 = __importDefault(require("vscode"));
const strip_comments_1 = __importDefault(require("strip-comments"));
class Contents {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.data(); }
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    fileName = vscode_1.default.window.activeTextEditor?.document.fileName;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        if (this.filePath) {
            // 1. 파일 내용 읽기
            const content = fs_1.default.readFileSync(this.filePath, "utf8");
            // 2. 주석제거하고 동기화 하기
            const commentsData = (0, strip_comments_1.default)(content).toString();
            // 2. 들여쓰기 변경
            const updateContent = commentsData.split("\n").map(line => {
                const indentMatch = line.match(/^(\s+)/);
                if (indentMatch) {
                    const spaces = indentMatch[1].length;
                    const newIndent = Math.ceil(spaces / 2) * 2;
                    return line.replace(/^(\s+)/, " ".repeat(newIndent));
                }
                return line;
            }).join("\n");
            if (this.filePath) {
                fs_1.default.writeFileSync(this.filePath, updateContent, "utf8");
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