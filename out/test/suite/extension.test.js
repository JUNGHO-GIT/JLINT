"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const vscode_1 = __importDefault(require("vscode"));
suite('Extension Test Suite', () => {
    vscode_1.default.window.showInformationMessage('Start all tests.');
    test('Sample test', () => {
        assert_1.default.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert_1.default.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});
