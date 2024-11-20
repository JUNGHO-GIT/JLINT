"use strict";
// Main.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("./Controller"));
// -------------------------------------------------------------------------------------------------
class Main {
    // 1. common -------------------------------------------------------------------------------------
    async main(confParam) {
        console.log(`--------------------`);
        console.log(`ActivateLint: '${confParam.ActivateLint}'`);
        console.log(`RemoveComments: '${confParam.RemoveComments}'`);
        console.log(`InsertLine: '${confParam.InsertLine}'`);
        const controller = new Controller_1.default();
        const common = controller.common(confParam);
        const lang = controller.lang(confParam);
        const syntax = controller.syntax(confParam);
        const logic = controller.logic(confParam);
        const extra = controller.extra(confParam);
        return common + lang + syntax + logic + extra;
    }
    ;
}
;
exports.default = Main;
//# sourceMappingURL=Main.js.map