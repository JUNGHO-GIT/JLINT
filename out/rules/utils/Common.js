"use strict";
// Common.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleTags = exports.removeComments = void 0;
const lodash_1 = __importDefault(require("lodash"));
const strip_comments_1 = __importDefault(require("strip-comments"));
// -------------------------------------------------------------------------------------------------
const removeComments = async (contentsParam, fileName, fileExt) => {
    try {
        // 1. rules
        let languageExt;
        if (fileExt === "html" || fileExt === "jsp" || fileExt === "vue") {
            languageExt = "html";
        }
        else if (fileExt === "javascriptreact" || fileExt === "jsx") {
            languageExt = "javascript";
        }
        else if (fileExt === "typescriptreact" || fileExt === "tsx") {
            languageExt = "typescript";
        }
        else if (fileExt === "json" || fileExt === "jsonc") {
            languageExt = "json";
        }
        else {
            languageExt = fileExt;
        }
        // 2. `http://` -> `httpp`
        const pattern1 = /("|')(\s*)(http:\/\/)([\n\s\S]*?)("|')/gm;
        const pattern2 = /("|')(\s*)(https:\/\/)([\n\s\S]*?)("|')/gm;
        const pattern3 = /("|')(\s*)(@\{http:\/\/)([\n\s\S]*?)("|')/gm;
        const pattern4 = /("|')(\s*)(@\{https:\/\/)([\n\s\S]*?)("|')/gm;
        const httpResult1 = lodash_1.default.chain(contentsParam)
            .replace(pattern1, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}httpp${p4}${p5}`;
        })
            .replace(pattern2, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}httpps${p4}${p5}`;
        })
            .replace(pattern3, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}@{httpp${p4}${p5}`;
        })
            .replace(pattern4, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}@{httpps${p4}${p5}`;
        })
            .value();
        // 2. remove comments
        const httpResult2 = (0, strip_comments_1.default)(httpResult1, {
            language: languageExt,
            preserveNewlines: true,
            keepProtected: true,
            block: true,
            line: true,
        });
        // 3. `httpp` -> `http://`
        const pattern1Re = /("|')(\s*)(httpp)([\n\s\S]*?)("|')/gm;
        const pattern2Re = /("|')(\s*)(httpps)([\n\s\S]*?)("|')/gm;
        const pattern3Re = /("|')(\s*)(@\{httpp)([\n\s\S]*?)("|')/gm;
        const pattern4Re = /("|')(\s*)(@\{httpps)([\n\s\S]*?)("|')/gm;
        const httpResult3 = lodash_1.default.chain(httpResult2)
            .replace(pattern1Re, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}http://${p4}${p5}`;
        })
            .replace(pattern2Re, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}https://${p4}${p5}`;
        })
            .replace(pattern3Re, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}@{http://${p4}${p5}`;
        })
            .replace(pattern4Re, (_, p1, p2, __, p4, p5) => {
            return `${p1}${p2}@{https://${p4}${p5}`;
        })
            .value();
        // 4. 빈 줄나눔 공백 제거
        const pattern5 = /(\n)(\s*)(\n)/gm;
        const result = lodash_1.default.chain(httpResult3)
            .replace(pattern5, (_, p1, p2, p3) => (`${p1}`))
            .value();
        console.log(`_____________________\n removeComments Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.removeComments = removeComments;
// -------------------------------------------------------------------------------------------------
const singleTags = async (contentsParam, fileName, fileExt) => {
    try {
        if (fileExt === "xml") {
            return contentsParam;
        }
        const rules1 = /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)([\n\s\S]*?)(\s*)(?<!=)(\/>)/gm;
        const result = lodash_1.default.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5, p6) => (`${p1}${p2}${p3}${p4}${p5}/>`))
            .value();
        console.log(`_____________________\n singleTags Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.singleTags = singleTags;
