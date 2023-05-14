"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.Jlint = exports.activate = void 0;
const vscode = require("vscode");
const Controller_1 = require("./core/Controller");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.Jlint', () => {
        Jlint();
    }));
}
exports.activate = activate;
function Jlint() {
    const mainInstance = new Controller_1.default().main();
    console.log(mainInstance);
}
exports.Jlint = Jlint;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map