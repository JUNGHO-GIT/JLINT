"use strict";
// extensions.ts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const Main_1 = __importDefault(require("./core/Main"));
// -------------------------------------------------------------------------------------------------
const activate = (context) => {
    // 0. check if the extension is activated
    console.log(`"JLINT" is now active!`);
    // 1. access configuration parameters
    const config = vscode.workspace.getConfiguration("JLINT");
    // 0. configuration Parameters
    const confParam = {
        ActivateLint: false,
        RemoveComments: false,
        InsertLine: false
    };
    Object.assign(confParam, {
        ActivateLint: config.get("ActivateLint") === true ? true : false,
        RemoveComments: config.get("RemoveComments") === true ? true : false,
        InsertLine: config.get("InsertLine") === true ? true : false
    });
    // 4. register command
    context.subscriptions.push(vscode.commands.registerCommand("extension.JLINT", () => {
        const main = new Main_1.default();
        main.main(confParam);
    }));
};
exports.activate = activate;
//# sourceMappingURL=extension.js.map