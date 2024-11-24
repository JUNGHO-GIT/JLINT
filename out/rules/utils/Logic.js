"use strict";
// Logic.ts
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
exports.tryCatch = exports.ifElse = void 0;
const lodash = __importStar(require("lodash"));
// -------------------------------------------------------------------------------------------------
const ifElse = async (contentsParam, fileName) => {
    try {
        const rules1 = /(\b)(if)(\()/gm;
        const rules2 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)([\s\S]*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const rules3 = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
        const result = lodash.chain(contentsParam)
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
        console.log(`_____________________\n ifElse Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.ifElse = ifElse;
// -------------------------------------------------------------------------------------------------
const tryCatch = async (contentsParam, fileName) => {
    try {
        const rules1 = /(\s*)(try)(\s*)(\{)(\s*)/gm;
        const rules2 = /(\s*)(.*?)(?<=\})(\s*)(catch)(\s*)/gm;
        const rules3 = /(\s*)(.*?)(?<=\})(\s*)(finally)(\s*)/gm;
        const result = lodash.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3, p4, p5) => (`${p1}try {${p5}`))
            .replace(rules2, (_, p1, p2, p3, p4, p5) => (`${p1}${p2}\n${p1}catch`))
            .replace(rules3, (_, p1, p2, p3, p4, p5) => (`${p1}${p2}\n${p1}${p4}`))
            .value();
        console.log(`_____________________\n tryCatch Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.tryCatch = tryCatch;
