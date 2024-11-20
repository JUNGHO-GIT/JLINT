"use strict";
// Jsp.ts
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
class Jsp {
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
        const jspRegex1 = /(&lt; %|&lt;%)/gm;
        const jspRegex2 = /(%& gt;|%&gt;)/gm;
        /*
        * <head> is existed.
        */
        if (headStartIndex !== -1 && headEndIndex !== -1) {
            const headStart = headStartIndex + "<head>".length;
            const headEnd = headEndIndex;
            headContent = data.slice(headStart, headEnd);
            withoutHead = data.replace(headContent, "");
            // 1. cheerio
            let $ = (0, cheerio_1.load)(withoutHead);
            let html = $.html();
            // 2. replace head content
            if (headContent.length > 0) {
                $("head").html(headContent);
                html = $.html();
            }
            // 3. replace html tag to jsp
            const replaceData = html
                .replace(jspRegex1, "<%")
                .replace(jspRegex2, "%>")
                .valueOf();
            fs.writeFileSync(this.filePath, replaceData, "utf8");
            return replaceData;
        }
        /*
        * <head> is not existed.
        */
        else if (headStartIndex <= 0 && headEndIndex <= 0) {
            // 3. replace html tag to jsp
            const replaceData = data
                .replace(jspRegex1, "<%")
                .replace(jspRegex2, "%>")
                .valueOf();
            fs.writeFileSync(this.filePath, replaceData, "utf8");
            return replaceData;
        }
        return data;
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        const data = this.data();
        const prettierOptions = {
            parser: "jsp",
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
            const msgRegexReplace = `[JLINT]\n\n[  Error Line : $5$6$7 ]\n\n$8`;
            const msgResult = msg.replace(msgRegex, msgRegexReplace);
            vscode.window.showInformationMessage(msgResult, { modal: true });
            throw new Error(msgResult);
        }
    }
}
exports.default = Jsp;
//# sourceMappingURL=Jsp.js.map