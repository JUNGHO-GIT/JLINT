"use strict";
// InsertLine.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
const Contents_js_1 = __importDefault(require("../../contents/Contents.js"));
// -------------------------------------------------------------------------------------------------
class InsertLine {
    // 0. resource -----------------------------------------------------------------------------------
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
    // 1. constructor --------------------------------------------------------------------------------
    constructor() {
        this.main();
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return new Contents_js_1.default().main();
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        if (this.fileExt === "javascript" || this.fileExt === "javascriptreact") {
            return this.JsTs();
        }
        if (this.fileExt === "typescript" || this.fileExt === "typescriptreact") {
            return this.JsTs();
        }
        if (this.fileExt === "java") {
            return this.Java();
        }
        if (this.fileExt === "html" || this.fileExt === "jsp") {
            return this.HtmlJsp();
        }
        if (this.fileExt === "css") {
            return this.Css();
        }
        if (this.fileExt === "xml") {
            return this.Xml();
        }
        if (this.fileExt === "json") {
            return this.Json();
        }
        if (this.fileExt === "sql") {
            return this.Sql();
        }
        return this.output();
    }
    // 4-1. JsTs -------------------------------------------------------------------------------------
    JsTs() {
        const data = this.data();
        const rules1 = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
        const rules2 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
        const rules3 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
        const rules4 = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
        const rules5 = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules2, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules3, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules4, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules5, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    ;
}