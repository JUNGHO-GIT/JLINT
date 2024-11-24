"use strict";
// extension.ts
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
exports.activate = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const Main_js_1 = require("./core/Main.js");
// -------------------------------------------------------------------------------------------------
const activate = (context) => {
    // 1. Get Configuration
    const config = vscode.workspace.getConfiguration("JLINT");
    // 2. Output
    console.log(`"JLINT" is now active!`);
    // 3. Register Command
    context.subscriptions.push(vscode.commands.registerCommand("extension.JLINT", async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            const filePath = editor.document.uri.fsPath;
            const fileExt = editor.document.languageId;
            const fileName = path.basename(filePath);
            const confParam = {
                ActivateLint: config.get("ActivateLint") || false,
                RemoveComments: config.get("RemoveComments") || false,
                InsertLine: config.get("InsertLine") || false
            };
            await (0, Main_js_1.main)(confParam, filePath, fileName, fileExt);
        }
        catch (err) {
            console.error(err.message);
        }
    }));
};
exports.activate = activate;
