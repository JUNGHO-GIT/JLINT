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
class Sql {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().data();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        if (this.filePath) {
            const data = this.data();
            const rulesOne = /(\s*)(\s*)(=)(\s*)(\?)(\s*)/gm;
            const rulesTwo = /(\s*)(\s*)(=)(\s*)(NOW)(\s*)/gm;
            const rulesThree = /(\s*)(\s*)(=)(\s*)(now)(\s*)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p4}${p5}`;
            })
                .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p4}${p5}`;
            })
                .replace(rulesThree, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p4}${p5}`;
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
        console.log("_____________________\n" + this.activePath + "  실행");
        return this.main();
    }
}
exports.default = Sql;
//# sourceMappingURL=Sql.js.map