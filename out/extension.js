"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = __importDefault(require("vscode"));
const index_1 = __importDefault(require("./core/index"));
function activate(context) {
    const main = new index_1.default();
    context.subscriptions.push(vscode_1.default.commands.registerCommand("extension.JLINT", () => {
        main.main();
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map