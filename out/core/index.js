"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("./Controller"));
class Main {
    main() {
        new Controller_1.default().components()
            + new Controller_1.default().lang()
            + new Controller_1.default().syntax()
            + new Controller_1.default().extra();
    }
}
new Main().main();
exports.default = Main;
//# sourceMappingURL=index.js.map