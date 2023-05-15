"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
const Contents_1 = __importDefault(require("../../core/Contents"));
class Return {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().main();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        if (this.filePath) {
            const data = this.data();
            const rulesOne = /(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm;
            const rulesTwo = /(\s*)(;)(\s*)(\n+)(\s*)(\n+)(\s*)(^.*?)/gm;
            const rulesThree = /(^\s*)(public|private)(\s*?)([\s\S]*?)(@?)(\s*)([\s\S]|(\n+)?)(\s*)(\))(\s*)(\{)/gm;
            const result = lodash_1.default.chain(data)
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
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
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