"use strict";
// IfElse.ts
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
class IfElse {
    // 0. resource -----------------------------------------------------------------------------------
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. output -------------------------------------------------------------------------------------
    output() {
        return console.log(`_____________________\nActivated! ('${this.activePath}')`);
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return new Contents_1.default().main().trim();
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        const data = this.data();
        if (this.filePath) {
            const rules1 = /(\b)(if)(\()/gm;
            const rules2 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)([\s\S]*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
            const rules3 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
            const result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3) => {
                return `${p2} (`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
                const indentSize1 = p1.length - `}`.length;
                const indentSize2 = p13.length - `}`.length;
                const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
                const insertSize = " ".repeat(spaceSize);
                return `${p1}\n${insertSize}else if (${p8}) {\n${insertSize}\t${p12}\n${insertSize}}`;
            })
                .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
                const indentSize1 = p1.length - `}`.length;
                const indentSize2 = p9.length - `}`.length;
                const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
                const insertSize = " ".repeat(spaceSize);
                return `${p1}\n${insertSize}else {\n${insertSize}\t${p8}\n${insertSize}}`;
            })
                .value();
            fs.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
}
exports.default = IfElse;
//# sourceMappingURL=IfElse.js.map