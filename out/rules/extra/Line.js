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
        return this.ts() + this.html();
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
    // 4-1. js -------------------------------------------------------------------------------------->
    js() { }
    // 4-2. ts -------------------------------------------------------------------------------------->
    ts() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
            const rules2 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
            const rules3 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
            const rules4 = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
            const rules5 = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
            let result = lodash_1.default.chain(data);
            for (let i = 1; i <= 5; i++) {
                const rule = eval(`rules${i}`);
                result = result.replace(rule, (match, p1, p2, p3) => {
                    const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
                    const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
                    return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
                });
            }
            const finalResult = result.value();
            fs_1.default.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
    // 4-3. java ------------------------------------------------------------------------------------>
    java() { }
    // 4-4. jsp ------------------------------------------------------------------------------------->
    jsp() { }
    // 4-5. html ------------------------------------------------------------------------------------>
    html() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
            const rules2 = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
            const rules3 = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
            const rules4 = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
            const rules5 = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
            const rules6 = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
            const rules7 = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
            const rules8 = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
            const rules9 = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;
            let result = lodash_1.default.chain(data);
            for (let i = 1; i <= 9; i++) {
                const rule = eval(`rules${i}`);
                result = result.replace(rule, (match, p1, p2, p3) => {
                    const spaceSize = 100 - (lodash_1.default.size(p1) + lodash_1.default.size(`<!--`) + lodash_1.default.size(`-->`));
                    const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
                    return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
                });
            }
            const finalResult = result.value();
            fs_1.default.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
    // 4-6. css ------------------------------------------------------------------------------------->
    css() { }
    // 4-7. xml ------------------------------------------------------------------------------------->
    xml() { }
    // 4-8. json ------------------------------------------------------------------------------------>
    json() { }
    // 4-9. sql ------------------------------------------------------------------------------------->
    sql() { }
}
exports.default = Line;
//# sourceMappingURL=Line.js.map