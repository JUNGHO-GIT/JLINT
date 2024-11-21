"use strict";
// Contents.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contents = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
// -------------------------------------------------------------------------------------------------
const contents = () => {
    // 0. resource -----------------------------------------------------------------------------------
    const activePath = path_1.default.basename(__filename);
    const filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. console ------------------------------------------------------------------------------------
    console.log(`_____________________\nActivated! ('${activePath}')`);
    // 2. data ---------------------------------------------------------------------------------------
    const data = fs_1.default.readFileSync(filePath, "utf8");
    const updateContent = data.split("\n").map(line => {
        const indentMatch = line.match(/^(\s+)/);
        if (indentMatch) {
            const spaces = indentMatch[1].length;
            const newIndent = Math.ceil(spaces / 2) * 2;
            return line.replace(/^(\s+)/, " ".repeat(newIndent));
        }
        return line;
    }).join("\n");
    return updateContent;
};
exports.contents = contents;
