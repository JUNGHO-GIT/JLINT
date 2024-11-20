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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
// -------------------------------------------------------------------------------------------------
class Contents {
    // 0. resource -----------------------------------------------------------------------------------
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. output -------------------------------------------------------------------------------------
    output() {
        return console.log(`_____________________\nActivated! ('${this.activePath}')`);
    }
    // 2. data ---------------------------------------------------------------------------------------
    data() {
        return fs.readFileSync(this.filePath, "utf8");
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
        fs.writeFileSync(this.filePath, updateContent, "utf8");
        return updateContent;
    }
}
exports.default = Contents;
//# sourceMappingURL=Contents.js.map