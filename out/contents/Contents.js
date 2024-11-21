"use strict";
// Contents.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContents = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// -------------------------------------------------------------------------------------------------
const getContents = (filePath) => {
    const data = fs_1.default.readFileSync(filePath, "utf8");
    const fileName = path_1.default.basename(filePath);
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
