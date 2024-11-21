"use strict";
// Logic.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = exports.ifElse = void 0;
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
// 0. resource -----------------------------------------------------------------------------------
const activePath = path_1.default.basename(__filename);
const fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
const filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
// -------------------------------------------------------------------------------------------------
const ifElse = (contentsParam) => {
    try {
        const rules1 = /(\b)(if)(\()/gm;
        const rules2 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)([\s\S]*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const rules3 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p2} (`;
        })
            .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
            const indentSize1 = p1.length - `}`.length;
            const indentSize2 = p13.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}else if (${p8}) {\n${insertSize}\t${p12}\n${insertSize}}`;
        })
            .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
            const indentSize1 = p1.length - `}`.length;
            const indentSize2 = p9.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}else {\n${insertSize}\t${p8}\n${insertSize}}`;
        })
            .value();
        console.log(`_____________________\n ifElse Activated! ('${activePath}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.ifElse = ifElse;
// -------------------------------------------------------------------------------------------------
const tryCatch = (contentsParam) => {
    try {
        const rules1 = /(\b)(try)(?:\s*)(\{)/gm;
        const rules2 = /(.*?)(?<=\})(\s*)(catch)/gm;
        const rules3 = /(.*?)(?<=\})(\s*)(finally)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p2} {`;
        })
            .replace(rules2, (_, p1, p2, p3) => {
            const indentSize1 = p1.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? 0 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}catch`;
        })
            .replace(rules3, (_, p1, p2, p3) => {
            const indentSize1 = p1.length - `}`.length;
            const spaceSize = indentSize1 == -1 ? 0 : indentSize1;
            const insertSize = " ".repeat(spaceSize);
            return `${p1}\n${insertSize}finally`;
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
exports.tryCatch = tryCatch;
