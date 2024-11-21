"use strict";
// Javascript.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellCheck = exports.space = exports.lineBreak = exports.insertLine = exports.prettierFormat = void 0;
const lodash_1 = __importDefault(require("lodash"));
const prettier_1 = __importDefault(require("prettier"));
const vscode_1 = __importDefault(require("vscode"));
// -------------------------------------------------------------------------------------------------
const prettierFormat = async (contentsParam, fileName) => {
    try {
        // 1. parse
        const prettierOptions = {
            parser: "babel-flow",
            singleQuote: false,
            printWidth: 100,
            tabWidth: 2,
            useTabs: true,
            quoteProps: "as-needed",
            jsxSingleQuote: false,
            trailingComma: "all",
            bracketSpacing: false,
            jsxBracketSameLine: false,
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
            semi: true,
            singleAttributePerLine: false,
            experimentalTernaries: true,
            __embeddedInHtml: true,
        };
        console.log(`_____________________\nprettierFormat Activated! ('${fileName}')`);
        const prettierCode = await prettier_1.default.format(contentsParam, prettierOptions);
        return prettierCode;
    }
    catch (err) {
        const msg = err.message.toString().trim().replace(/\x1B\[[0-9;]*[mGKF]/g, "");
        const msgRegex = /([\n\s\S]*)(\s*)(https)(.*?)([(])(.*?)([)])([\n\s\S]*)/gm;
        const msgRegexReplace = `[JLINT]\n\n Error Line : $5$6$7\n$8`;
        const msgResult = msg.replace(msgRegex, msgRegexReplace);
        console.error(`_____________________\nprettierFormat Error! ('${fileName}')\n${msgResult}`);
        vscode_1.default.window.showInformationMessage(msgResult, { modal: true });
        return contentsParam;
    }
};
exports.prettierFormat = prettierFormat;
// -------------------------------------------------------------------------------------------------
const insertLine = async (contentsParam, fileName) => {
    try {
        const rules1 = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
        const rules2 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
        const rules3 = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
        const rules4 = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
        const rules5 = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules2, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules3, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules4, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .replace(rules5, (_, p1, p2, p3) => {
            const spaceSize = 100 - (p1.length + `// `.length + `-`.length);
            const insetLine = `// ` + '-'.repeat(spaceSize) + `-`;
            return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        })
            .value();
        console.log(`_____________________\ninsertLine Activated! ('${fileName}')`);
        return result;
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
        const rules1 = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p1}\n${p3}`;
        })
            .value();
        console.log(`_____________________\nlineBreak Activated! ('${fileName}')`);
        return result;
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
        const rules1 = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
        const rules2 = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => (`${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`))
            .replace(rules2, (_, p1, p2, p3, p4, p5) => (`${p2}${p3}${p4}${p5}`))
            .value();
        console.log(`_____________________\nspace Activated! ('${fileName}')`);
        return result;
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
        const rules1 = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
            return `${p1}${p2}${p3}${p4}${p5}${p13}`;
        })
            .value();
        console.log(`_____________________\nspellCheck Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.spellCheck = spellCheck;
