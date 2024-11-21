"use strict";
// Syntax.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quote = exports.semicolon = exports.comma = exports.brackets = void 0;
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
// 0. resource -----------------------------------------------------------------------------------
const activePath = path_1.default.basename(__filename);
const fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
const filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
// -------------------------------------------------------------------------------------------------
const brackets = (contentsParam) => {
    try {
        const rules1 = /(\))(\{)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2) => {
            return `${p1} ${p2}`;
        })
            .value();
        console.log(`_____________________\n brackets Activated! ('${activePath}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.brackets = brackets;
// -------------------------------------------------------------------------------------------------
const comma = (contentsParam) => {
    try {
        const rules1 = /(\s*)(,)(\s*)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p2} `;
        })
            .value();
        console.log(`_____________________\n comma Activated! ('${activePath}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.comma = comma;
// -------------------------------------------------------------------------------------------------
const semicolon = (contentsParam) => {
    try {
        const rules1 = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
        const rules2 = /(&nbsp;)(\n+)(&nbsp;)/gm;
        const rules3 = /(&lt;)(\n+)(&lt;)/gm;
        const rules4 = /(;)(\n*)(\s*)(charset)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5) => {
            return `${p1}${p2}${p4}\n${p1}${p5}`;
        })
            .replace(rules2, (_, p1, p2, p3) => {
            return `${p1}${p3}`;
        })
            .replace(rules3, (_, p1, p2, p3) => {
            return `${p1}${p3}`;
        })
            .replace(rules4, (_, p1, p2, p3, p4) => {
            return `${p1} ${p4}`;
        })
            .value();
        console.log(`_____________________\n semicolon Activated! ('${activePath}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.semicolon = semicolon;
// -------------------------------------------------------------------------------------------------
const quote = (contentsParam) => {
    try {
        const rules1 = /(?<!(?:(?:\\['])|(?:['"'])|(?:["'"])))(\s*)(')(\s*)(?!(?:(?:\\['])|(?:['"'])|(?:["'"])))/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p1}"${p3}`;
        })
            .value();
        console.log(`_____________________\n quote Activated! ('${activePath}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.quote = quote;
