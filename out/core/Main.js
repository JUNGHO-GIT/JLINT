"use strict";
// Main.ts
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
exports.main = void 0;
const fs = __importStar(require("fs"));
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
    fs.writeFileSync(filePath, finalContents, 'utf8');
};
exports.main = main;
