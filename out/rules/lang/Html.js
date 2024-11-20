"use strict";
// Html.ts
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
const cheerio_1 = require("cheerio");
const prettier_1 = __importDefault(require("prettier"));
const Contents_1 = __importDefault(require("../common/Contents"));
// -------------------------------------------------------------------------------------------------
class Html {
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
        const data = new Contents_1.default().main().trim();
        // 1. check if head tags exist
        const headStartIndex = data.indexOf("<head>");
        const headEndIndex = data.indexOf("</head>");
        let headContent = "";
        let withoutHead = data;
        if (headStartIndex !== -1 && headEndIndex !== -1) {
            // head tags exist, extract head content
            const headStart = headStartIndex + "<head>".length;
            const headEnd = headEndIndex;
            headContent = data.slice(headStart, headEnd);
            // remove head content
            withoutHead = data.replace(headContent, "");
        }
        // 2. cheerio
        const $ = (0, cheerio_1.load)(withoutHead);
        let html = $.html();
        // 3. replace head content
        if (headContent.length > 0) {
            $("head").html(headContent);
            html = $.html();
        }
        fs.writeFileSync(this.filePath, html, "utf8");
        return html;
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        const data = this.data();
        const prettierOptions = {
            parser: "vue",
            singleQuote: false,
            printWidth: 1000,
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
            bracketSameLine: true,
            parentParser: "none",
            semi: true,
            singleAttributePerLine: false,
        };
        try {
            const prettierCode = prettier_1.default.format(data, prettierOptions);
            fs.writeFileSync(this.filePath, prettierCode, "utf8");
            return prettierCode;
        }
        catch (err) {
            const msg = err.message.toString();
            const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
            const msgRegexReplace = `[JLINT]\n\n Error Line : $5$6$7 \n$8`;
            const msgResult = msg.replace(msgRegex, msgRegexReplace);
            vscode.window.showInformationMessage(msgResult, { modal: true });
            throw new Error(msgResult);
        }
    }
}
exports.default = Html;
//# sourceMappingURL=Html.js.map