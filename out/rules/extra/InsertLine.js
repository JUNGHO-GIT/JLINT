"use strict";
// InsertLine.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode = __importStar(require("vscode"));
const Contents_1 = __importDefault(require("../common/Contents"));
// -------------------------------------------------------------------------------------------------
class InsertLine {
    // 0. resource -----------------------------------------------------------------------------------
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    fileExt = vscode.window.activeTextEditor?.document.languageId;
    // 1. output -------------------------------------------------------------------------------------
    output() {
        if (this.fileExt === "javascript" || this.fileExt === "javascriptreact" ||
            this.fileExt === "typescript" || this.fileExt === "typescriptreact" ||
            this.fileExt === "java" ||
            this.fileExt === "html" || this.fileExt === "jsp") {
            return console.log(`_____________________\nActivated! ('${this.activePath}')`);
        }
        else {
            return console.log(`_____________________\nInsertLine not supported ('${this.fileExt}')`);
        }
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return new Contents_1.default().main().trim();
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
        if (this.filePath && this.fileExt === "javascript" || this.fileExt === "javascriptreact" || this.fileExt === "typescript" || this.fileExt === "typescriptreact") {
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
            fs.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
    // 4-2. Java -------------------------------------------------------------------------------------
    Java() {
        const data = this.data();
        if (this.filePath && this.fileExt === "java") {
            const rules1 = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
            let result = lodash_1.default.chain(data);
            for (let i = 1; i <= 1; i++) {
                const rule = eval(`rules${i}`);
                result = result.replace(rule, (match, p1, p2, p3) => {
                    const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
                    const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
                    return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
                });
            }
            const finalResult = result.value();
            fs.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
    // 4-3. HtmlJsp ----------------------------------------------------------------------------------
    HtmlJsp() {
        const data = this.data();
        if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {
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
            fs.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
    // 4-4. Css --------------------------------------------------------------------------------------
    Css() {
        return;
    }
    // 4-6. Xml --------------------------------------------------------------------------------------
    Xml() {
        return;
    }
    // 4-7. Json -------------------------------------------------------------------------------------
    Json() {
        return;
    }
    // 4-8. Sql --------------------------------------------------------------------------------------
    Sql() {
        return;
    }
}
exports.default = InsertLine;
//# sourceMappingURL=InsertLine.js.map