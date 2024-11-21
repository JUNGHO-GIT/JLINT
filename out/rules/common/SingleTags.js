"use strict";
// SingleTags.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleTags = void 0;
const lodash_1 = __importDefault(require("lodash"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
// -------------------------------------------------------------------------------------------------
const singleTags = (contentsParam) => {
    // 0. resource -----------------------------------------------------------------------------------
    const activePath = path_1.default.basename(__filename);
    const fileExt = vscode_1.default.window.activeTextEditor?.document.languageId;
    // 1. console ------------------------------------------------------------------------------------
    console.log(`_____________________\nActivated! ('${activePath}')`);
    // 2. rules --------------------------------------------------------------------------------------
    if (fileExt === "xml") {
        return contentsParam.data;
    }
    const rules1 = /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)([\n\s\S]*?)(\s*)(?<!=)(\/>)/gm;
    const result = lodash_1.default.chain(contentsParam.data)
        .replace(rules1, (_, p1, p2, p3, p4, p5, p6) => (`${p1}${p2}${p3}${p4}${p5}/>`))
        .value();
    return result;
};
exports.singleTags = singleTags;
