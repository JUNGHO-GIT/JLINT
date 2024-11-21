"use strict";
// Semicolon.ts
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
class Semicolon {
    // 0. resource -----------------------------------------------------------------------------------
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
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
        const data = this.data();
        const rules1 = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
        const rules2 = /(&nbsp;)(\n+)(&nbsp;)/gm;
        const rules3 = /(&lt;)(\n+)(&lt;)/gm;
        const rules4 = /(;)(\n*)(\s*)(charset)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5) => {
            return `${p1}${p2}${p4}\n${p1}${p5}`;
        })
            .replace(rules2, (_, p1, p2, p3) => {
            return `${p1}${p3}`;
        })
            .replace(rules3, (_, p1, p2, p3) => {
            return `${p1}${p3}`;
        })
            .replace(rules4, (_, p1, p2, p3, p4) => {
            return `${p1} ${p4}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 4. output -------------------------------------------------------------------------------------
    output() {
        console.log(`_____________________\nActivated! ('${this.activePath}')`);
    }
}
exports.default = Semicolon;
