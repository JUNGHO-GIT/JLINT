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
class Semicolon {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().main().toString();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const data = this.data();
        if (this.filePath) {
            const rulesOne = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
            const rulesTwo = /(&nbsp;)(\n+)(&nbsp;)/gm;
            const rulesThree = /(&lt;)(\n+)(&lt;)/gm;
            const rulesFour = /(;)(\n*)(\s*)(charset)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
                return `${p1}${p2}${p4}\n${p1}${p5}`;
            })
                .replace(rulesTwo, (match, p1, p2, p3) => {
                return `${p1}${p3}`;
            })
                .replace(rulesThree, (match, p1, p2, p3) => {
                return `${p1}${p3}`;
            })
                .replace(rulesFour, (match, p1, p2, p3, p4) => {
                return `${p1} ${p4}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Semicolon;
//# sourceMappingURL=Semicolon.js.map