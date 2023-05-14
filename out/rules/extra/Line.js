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
class Line {
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
            // general tags
            const rulesOne1 = /(\n*)(\s*)(?=\n*)(^\s*)(public|private|function)(([\s\S](?!;|class))*?)(\s*)(?<=\{)/gm;
            // XML tags
            const rulesOne2 = /(?<=\n|^)(\s*)(<(?!\/|(\?xml)|(!DOC)|[^>]*--)[^>]*>)/gm;
            const rulesTwo = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
            const rulesThree = /(\s*?)(ception)(\{)/gm;
            const rulesFour = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
            const rulesFive = /(^.\s*?)(@)(.*)(\n+)(\s*)(\/\/.*?>)(\n+)(\s+)(public|private|function)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
            const rulesSix = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
            const rulesSeven = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
            const rulesEight = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rulesOne1, (match, p1, p2, p3, p4, p5, p6) => {
                const spaceSize = 100 - (lodash_1.default.size(p3) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p3}${insetLine}\n${p3}${p4}${p5}`;
            })
                .replace(rulesOne2, (match, p1, p2) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!-- `) + lodash_1.default.size(` -->`));
                const insetLine = `<!-- ` + `=`.repeat(spaceSize) + ` -->`;
                return `\n${p1}${insetLine}\n${p1}${p2}`;
            })
                .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
                return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
            })
                .replace(rulesThree, (match, p1, p2, p3) => {
                return `${p2} ${p3}`;
            })
                .replace(rulesFour, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
            })
                .replace(rulesFive, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                return `${p5}${p6}\n${p5}${p2}${p3}\n${p8}${p9}${p10}`;
            })
                .replace(rulesSix, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                return `${p1}${p2}${p3}${p4}\n`;
            })
                .replace(rulesSeven, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
                return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
            })
                .replace(rulesEight, (match, p1, p2, p3, p4) => {
                return `${p1}\n${p3}`;
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
exports.default = Line;
//# sourceMappingURL=Line.js.map