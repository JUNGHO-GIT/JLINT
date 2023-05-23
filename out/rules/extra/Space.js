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
class Space {
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
        return this.ts() + this.java() + this.jsp();
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
            const rules1 = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
            const rules2 = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
                return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p3}${p4}${p5}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-3. java ------------------------------------------------------------------------------------>
    java() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(\s*)(\))(\s+)(;)/gm;
            const rules2 = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
            const rules3 = /(^\s*)(public|private)(\s*?)([\s\S]*?)(@?)(\s*)([\s\S]|(\n+)?)(\s*)(\))(\s*)(\{)/gm;
            const rules4 = /(\s*?)(ception)(\{)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4) => {
                return `${p1}${p2}${p4}`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5, p6) => {
                return `${p1}${p2}${p4} ${p6}`;
            })
                .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
                return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p10} ${p12}`;
            })
                .replace(rules4, (match, p1, p2, p3) => {
                return `${p2} ${p3}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-4. jsp ------------------------------------------------------------------------------------->
    jsp() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(<%@)(\s*)(page)/gm;
            const rules2 = /(<%@)(\s*)(taglib)/gm;
            let result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3) => {
                return `${p1} ${p3}`;
            })
                .replace(rules2, (match, p1, p2, p3) => {
                return `${p1} ${p3}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-5. html ------------------------------------------------------------------------------------>
    html() { }
    // 4-6. css ------------------------------------------------------------------------------------->
    css() { }
    // 4-7. xml ------------------------------------------------------------------------------------->
    xml() { }
    // 4-8. json ------------------------------------------------------------------------------------>
    json() { }
    // 4-9. sql ------------------------------------------------------------------------------------->
    sql() { }
}
exports.default = Space;
//# sourceMappingURL=Space.js.map