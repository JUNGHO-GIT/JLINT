"use strict";
// Contents.ts
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
exports.getContents = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// -------------------------------------------------------------------------------------------------
const getContents = (filePath) => {
    const data = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);
    try {
        const updateContent = data.split("\n").map((line) => {
            const indentMatch = line.match(/^(\s+)/);
            if (indentMatch) {
                const spaces = indentMatch[1].length;
                const newIndent = Math.ceil(spaces / 2) * 2;
                return line.replace(/^(\s+)/, " ".repeat(newIndent));
            }
            return line;
        })
            .join("\n")
            .trim();
        console.log(`_____________________\n getContents Activated! ('${fileName}')`);
        return updateContent;
    }
    catch (err) {
        console.error(err);
        return data;
    }
};
exports.getContents = getContents;
