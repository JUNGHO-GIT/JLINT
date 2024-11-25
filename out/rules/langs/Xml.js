"use strict";
// Xml.ts
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellCheck = exports.space = exports.lineBreak = exports.insertLine = exports.prettierFormat = void 0;
const prettier = __importStar(require("prettier"));
const vscode = __importStar(require("vscode"));
// -------------------------------------------------------------------------------------------------
const prettierFormat = async (contentsParam, fileName) => {
    try {
        // 1. parse
        const prettierOptions = {
            parser: "xml",
            parentParser: "xml",
            plugins: [(await import("@prettier/plugin-xml")).default],
            singleQuote: false,
            printWidth: 100,
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
            semi: true,
            singleAttributePerLine: false,
            __embeddedInHtml: true,
            experimentalTernaries: true
        };
        console.log(`_____________________\nprettierFormat Activated! ('${fileName}')`);
        const prettierCode = await prettier.format(contentsParam, prettierOptions);
        return prettierCode;
    }
    catch (err) {
        const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
        const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
        const msgRegexReplace = `[JLINT]\n\nError Line = [ $6 ]\nError Site = $8`;
        const msgResult = msg.replace(msgRegex, msgRegexReplace);
        console.error(`_____________________\nprettierFormat Error! ('${fileName}')\n${msgResult}`);
        vscode.window.showInformationMessage(msgResult, { modal: true });
        return contentsParam;
    }
};
exports.prettierFormat = prettierFormat;
// -------------------------------------------------------------------------------------------------
const insertLine = async (contentsParam, fileName) => {
    try {
        console.log(`_____________________\ninsertLine Not Supported! ('${fileName}')`);
        return contentsParam;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.insertLine = insertLine;
// -------------------------------------------------------------------------------------------------
const lineBreak = async (contentsParam, fileName) => {
    try {
        console.log(`_____________________\nlineBreak Not Supported! ('${fileName}')`);
        return contentsParam;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.lineBreak = lineBreak;
// -------------------------------------------------------------------------------------------------
const space = async (contentsParam, fileName) => {
    try {
        console.log(`_____________________\nspace Not Supported! ('${fileName}')`);
        return contentsParam;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.space = space;
// -------------------------------------------------------------------------------------------------
const spellCheck = async (contentsParam, fileName) => {
    try {
        console.log(`_____________________\nspellCheck Not Supported! ('${fileName}')`);
        return contentsParam;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.spellCheck = spellCheck;
