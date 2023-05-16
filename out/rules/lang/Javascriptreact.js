"use strict";
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
const vscode = __importStar(require("vscode"));
const prettier = __importStar(require("prettier"));
const strip_comments_1 = __importDefault(require("strip-comments"));
const Contents_1 = __importDefault(require("../common/Contents"));
class Javascriptreact {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        const data = new Contents_1.default().main().toString();
        // 1. remove comments
        const result = (0, strip_comments_1.default)(data, {
            preserveNewlines: false,
            keepProtected: false,
            block: true,
            line: true,
            language: "javascript",
        });
        fs.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const data = this.data();
        if (this.filePath) {
            const formattedCode = prettier.format(data, {
                parser: "babel-flow",
                printWidth: 1000,
                singleQuote: false,
                tabWidth: 2,
                useTabs: false,
                quoteProps: "as-needed",
                jsxSingleQuote: false,
                trailingComma: "all",
                bracketSpacing: false,
                jsxBracketSameLine: true,
                arrowParens: "always",
                rangeStart: 0,
                rangeEnd: Infinity,
                requirePragma: false,
                insertPragma: false,
                proseWrap: "preserve",
                htmlWhitespaceSensitivity: "css",
                vueIndentScriptAndStyle: true,
                endOfLine: "lf",
                embeddedLanguageFormatting: "auto",
                bracketSameLine: false,
                parentParser: "none",
                singleAttributePerLine: false
            });
            fs.writeFileSync(this.filePath, formattedCode, "utf8");
            return formattedCode;
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Javascriptreact;
//# sourceMappingURL=Javascriptreact.js.map