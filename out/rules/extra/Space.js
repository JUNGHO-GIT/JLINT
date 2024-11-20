"use strict";
// Space.ts
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
class Space {
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
            return console.log(`_____________________\nSpace not supported ('${this.fileExt}')`);
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
            const rules1 = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
            const rules2 = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
                return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5) => {
                return `${p2}${p3}${p4}${p5}`;
            })
                .value();
            fs.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-2. Java -------------------------------------------------------------------------------------
    Java() {
        const data = this.data();
        if (this.filePath && this.fileExt === "java") {
            const rules1 = /(\s*)(\))(\s+)(;)/gm;
            const rules2 = /(\s*)(@)(\s*)([\s\S]*?)(\s*)(\()/gm;
            const rules3 = /(\s*?)(ception)(\{)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3, p4) => {
                return `${p1}${p2}${p4}`;
            })
                .replace(rules2, (match, p1, p2, p3, p4, p5, p6) => {
                return `${p1}${p2}${p4} ${p6}`;
            })
                .replace(rules3, (match, p1, p2, p3) => {
                return `${p2} ${p3}`;
            })
                .value();
            fs.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
    }
    // 4-3. HtmlJsp ----------------------------------------------------------------------------------
    HtmlJsp() {
        const data = this.data();
        if (this.filePath && this.fileExt === "html" || this.fileExt === "jsp") {
            const rules1 = /(<%@)(\s*)(page)/gm;
            const rules2 = /(<%@)(\s*)(taglib)/gm;
            const result = lodash_1.default.chain(data)
                .replace(rules1, (match, p1, p2, p3) => {
                return `${p1} ${p3}`;
            })
                .replace(rules2, (match, p1, p2, p3) => {
                return `${p1} ${p3}`;
            })
                .value();
            fs.writeFileSync(this.filePath, result, "utf8");
            return result;
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
exports.default = Space;
//# sourceMappingURL=Space.js.map