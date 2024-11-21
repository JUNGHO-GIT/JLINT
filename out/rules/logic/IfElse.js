"use strict";
// IfElse.ts
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
class IfElse {
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
        const rules1 = /(\b)(if)(\()/gm;
        const rules2 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)([\s\S]*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const rules3 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p2} (`;
        })
            .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
            const indentSize1 = p1.length - `}`.length;
            const indentSize2 = p13.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}else if (${p8}) {\n${insertSize}\t${p12}\n${insertSize}}`;
        })
            .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
            const indentSize1 = p1.length - `}`.length;
            const indentSize2 = p9.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}else {\n${insertSize}\t${p8}\n${insertSize}}`;
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
exports.default = IfElse;
