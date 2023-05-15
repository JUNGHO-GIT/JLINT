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
    fileExt = vscode_1.default.window.activeTextEditor?.document.languageId || "";
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        if (this.filePath) {
            const content = fs_1.default.readFileSync(this.filePath, "utf8");
            let language;
            switch (this.fileExt) {
                case "javascript":
                    language = "javascript";
                    break;
                case "typescript":
                    language = "typescript";
                    break;
                case "html":
                    language = "html";
                    break;
                case "css":
                    language = "css";
                    break;
                case "java":
                    language = "java";
                    break;
                case "xml":
                    language = "xml";
                    break;
                default:
                    console.log("지원되지 않는 파일 형식입니다.");
                    return "";
            }
            const result = (0, strip_comments_1.default)(content, {
                preserveNewlines: false,
                block: true,
                line: true,
                language,
            });
            return result;
        }
        else {
            return "파일이 존재하지 않습니다.";
        }
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        if (this.filePath) {
            const commentsData = this.data();
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