"use strict";
// Contents.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
// -------------------------------------------------------------------------------------------------
class Contents {
    // 0. resource -----------------------------------------------------------------------------------
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. constructor --------------------------------------------------------------------------------
    constructor() {
        this.main();
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return fs_1.default.readFileSync(this.filePath, "utf8");
    }
    // 3. main ---------------------------------------------------------------------------------------
    main() {
        const data = this.data();
        const updateContent = data.split("\n").map(line => {
            const indentMatch = line.match(/^(\s+)/);
            if (indentMatch) {
                const spaces = indentMatch[1].length;
                const newIndent = Math.ceil(spaces / 2) * 2;
                return line.replace(/^(\s+)/, " ".repeat(newIndent));
            }
            return line;
        }).join("\n");
        fs_1.default.writeFileSync(this.filePath, updateContent, "utf8");
        return updateContent;
    }
    // 3. output -------------------------------------------------------------------------------------
    output() {
        console.log(`_____________________\nActivated! ('${this.activePath}')`);
    }
}
exports.default = Contents;
