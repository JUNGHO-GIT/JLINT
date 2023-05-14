"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const Controller_1 = require("./core/Controller");
function activate(context) {
    const controller = new Controller_1.default();
    context.subscriptions.push(vscode.commands.registerCommand("extension.JLINT", () => {
        controller.main();
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map