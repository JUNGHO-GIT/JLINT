"use strict";
// LineBreak.ts
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
class LineBreak {
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
        const rules1 = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p1}\n${p3}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
}
