"use strict";
// extension.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
const Main_js_1 = require("./core/Main.js");
// -------------------------------------------------------------------------------------------------
const activate = (context) => {
    // 1. Get Configuration
    const config = vscode_1.default.workspace.getConfiguration("JLINT");
    // 2. Output
    console.log(`"JLINT" is now active!`);
    // 3. Register Command
    context.subscriptions.push(vscode_1.default.commands.registerCommand("extension.JLINT", async () => {
        const editor = vscode_1.default.window.activeTextEditor;
        const filePath = editor.document.uri.fsPath;
        const fileExt = editor.document.languageId;
        const fileName = path_1.default.basename(filePath);
        const confParam = {
            ActivateLint: config.get("ActivateLint") || false,
            RemoveComments: config.get("RemoveComments") || false,
            InsertLine: config.get("InsertLine") || false
        };
        console.log(`--------------------`);
        console.log(`fileName: ('${fileName}')`);
        console.log(`ActivateLint: ('${confParam.ActivateLint}')`);
        console.log(`RemoveComments: ('${confParam.RemoveComments}')`);
        console.log(`InsertLine: ('${confParam.InsertLine}')`);
        await (0, Main_js_1.main)(confParam, filePath, fileName, fileExt);
    }));
};
exports.activate = activate;
