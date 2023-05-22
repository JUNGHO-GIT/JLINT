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
class Line {
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
            // 1-1. front comments regex ---------------------------------------------------------------->
            const rulesTwo = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
            const rulesThree = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
            const rulesFour = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
            const rulesFive = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
            const rulesSix = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
            const rulesSeven = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
            const rulesEight = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
            const rulesNine = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
            const rulesTen = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
            const rulesEleven = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
            const rulesTwelve = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
            const rulesThirteen = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
            const rulesFourteen = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
            const rulesFifteen = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;
            // 1-2. back comments regex ----------------------------------------------------------------->
            const rulesOneDot = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
            const rulesTwoDot = /(\s*?)(ception)(\{)/gm;
            const rulesThreeDot = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
            const rulesFourDot = /(^.\s*?)(@)(.*)(\n+)(\s*)(\/\/.*?>)(\n+)(\s+)(public|private|function)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
            const rulesFiveDot = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
            const rulesSixDot = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
            const rulesSevenDot = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
            const rulesEightDot = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
            // 2-1. front comments replace -------------------------------------------------------------->
            const result = lodash_1.default.chain(data)
                .replace(rulesTwo, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesThree, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesFour, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesFive, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesSix, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`// `) + lodash_1.default.size(`>`));
                const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesSeven, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesEight, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesNine, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesTen, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesEleven, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesTwelve, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesThirteen, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesFourteen, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                .replace(rulesFifteen, (match, p1, p2, p3) => {
                const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
            })
                // 2-2. back comments replace --------------------------------------------------------------->
                .replace(rulesOneDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
                return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
            })
                .replace(rulesTwoDot, (match, p1, p2, p3) => {
                return `${p2} ${p3}`;
            })
                .replace(rulesThreeDot, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
                return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
            })
                .replace(rulesFourDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                return `${p5}${p6}\n${p5}${p2}${p3}\n${p8}${p9}${p10}`;
            })
                .replace(rulesFiveDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                return `${p1}${p2}${p3}${p4}\n`;
            })
                .replace(rulesSixDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
                return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
            })
                .replace(rulesSevenDot, (match, p1, p2, p3, p4) => {
                return `${p1}\n${p3}`;
            })
                .replace(rulesEightDot, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p3}${p4}${p5}`;
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
exports.default = Line;
//# sourceMappingURL=Line.js.map