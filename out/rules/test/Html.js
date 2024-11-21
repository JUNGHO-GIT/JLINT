"use strict";
// Html.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettierFormat = void 0;
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
const cheerio_1 = require("cheerio");
const prettier_1 = __importDefault(require("prettier"));
// 0. resource -----------------------------------------------------------------------------------
const activePath = path_1.default.basename(__filename);
const fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
const filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
// -------------------------------------------------------------------------------------------------
const prettierFormat = async (contentsParam) => {
    try {
        // 1. check if head tags exist
        const headStartIndex = contentsParam.indexOf("<head>");
        const headEndIndex = contentsParam.indexOf("</head>");
        let headContent = "";
        let withoutHead = contentsParam;
        // if <head> tag exists
        if (headStartIndex !== -1 && headEndIndex !== -1) {
            // head tags exist, extract head content
            const headStart = headStartIndex + "<head>".length;
            const headEnd = headEndIndex;
            headContent = contentsParam.slice(headStart, headEnd);
            // remove head content
            withoutHead = contentsParam.replace(headContent, "");
        }
        // 2. cheerio
        let $ = (0, cheerio_1.load)(withoutHead);
        let html = $.html();
        // 3. replace head content
        if (headContent.length > 0) {
            $("head").html(headContent);
            html = $.html();
            contentsParam = html;
        }
        const prettierOptions = {
            parser: "html",
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
        console.log(`_____________________\nprettierFormat Activated! ('${activePath}')`);
        const prettierCode = await prettier_1.default.format(contentsParam, prettierOptions);
        return prettierCode;
    }
    catch (err) {
        const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
        const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
        const msgRegexReplace = `[JLINT]\n\n Error Line : $5$6$7\n$8`;
        const msgResult = msg.replace(msgRegex, msgRegexReplace);
        console.error(`_____________________\nprettierFormat Error! ('${activePath}')\n${msgResult}`);
        vscode_1.default.window.showInformationMessage(msgResult, { modal: true });
        return msgResult;
    }
};
exports.prettierFormat = prettierFormat;