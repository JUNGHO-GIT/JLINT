"use strict";
// Main.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const fs_1 = __importDefault(require("fs"));
const Contents_js_1 = require("../contents/Contents.js");
const Controller_js_1 = require("../core/Controller.js");
// -------------------------------------------------------------------------------------------------
const main = async (confParam, filePath, fileName, fileExt) => {
    let initContents = (0, Contents_js_1.getContents)(filePath);
    let finalContents = "";
    finalContents = await (0, Controller_js_1.getCommon)(confParam, initContents, fileName, fileExt);
    finalContents = await (0, Controller_js_1.getLanguage)(confParam, finalContents, fileName, fileExt);
    finalContents = await (0, Controller_js_1.getSyntax)(confParam, finalContents, fileName);
    finalContents = await (0, Controller_js_1.getLogic)(confParam, finalContents, fileName);
    fs_1.default.writeFileSync(filePath, finalContents, 'utf8');
};
exports.main = main;
