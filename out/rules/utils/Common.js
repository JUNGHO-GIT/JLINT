"use strict";
// Common.ts
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
exports.singleTags = exports.removeComments = void 0;
const lodash = __importStar(require("lodash"));
const stripComments = __importStar(require("strip-comments"));
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
        const httpResult1 = lodash.chain(contentsParam)
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
        const httpResult2 = stripComments.default(httpResult1, {
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
        const httpResult3 = lodash.chain(httpResult2)
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
        const result = lodash.chain(httpResult3)
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
        const result = lodash.chain(contentsParam)
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
