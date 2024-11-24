"use strict";
// Syntax.ts
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
exports.quotes = exports.semicolon = exports.comma = exports.brackets = void 0;
const lodash = __importStar(require("lodash"));
// -------------------------------------------------------------------------------------------------
const brackets = async (contentsParam, fileName) => {
    try {
        const rules1 = /(\))(\{)/gm;
        const result = lodash.chain(contentsParam)
            .replace(rules1, (_, p1, p2) => {
            return `${p1} ${p2}`;
        })
            .value();
        console.log(`_____________________\n brackets Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.brackets = brackets;
// -------------------------------------------------------------------------------------------------
const comma = async (contentsParam, fileName) => {
    try {
        const rules1 = /(\s*)(,)(\s*)/gm;
        const result = lodash.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p2} `;
        })
            .value();
        console.log(`_____________________\n comma Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.comma = comma;
// -------------------------------------------------------------------------------------------------
const semicolon = async (contentsParam, fileName) => {
    try {
        const rules1 = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
        const rules2 = /(&nbsp;)(\n+)(&nbsp;)/gm;
        const rules3 = /(&lt;)(\n+)(&lt;)/gm;
        const rules4 = /(;)(\n*)(\s*)(charset)/gm;
        const result = lodash.chain(contentsParam)
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
        console.log(`_____________________\n semicolon Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.semicolon = semicolon;
// -------------------------------------------------------------------------------------------------
const quotes = async (contentsParam, fileName) => {
    try {
        const rules1 = /(?<!(?:(?:\\['])|(?:['"'])|(?:["'"])))(\s*)(')(\s*)(?!(?:(?:\\['])|(?:['"'])|(?:["'"])))/gm;
        const result = lodash.chain(contentsParam)
            .replace(rules1, (_, p1, p2, p3) => {
            return `${p1}"${p3}`;
        })
            .value();
        console.log(`_____________________\n quote Activated! ('${fileName}')`);
        return result;
    }
    catch (err) {
        console.error(err.message);
        return contentsParam;
    }
};
exports.quotes = quotes;
