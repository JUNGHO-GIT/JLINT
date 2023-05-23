"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const vscode_1 = __importDefault(require("vscode"));
const Contents_1 = __importDefault(require("../common/Contents"));
class Spell {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        return new Contents_1.default().main().toString();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        return this.sql();
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
    // 4-1. js -------------------------------------------------------------------------------------->
    js() { }
    // 4-2. ts -------------------------------------------------------------------------------------->
    ts() { }
    // 4-3. java ------------------------------------------------------------------------------------>
    java() { }
    // 4-4. jsp ------------------------------------------------------------------------------------->
    jsp() { }
    // 4-5. html ------------------------------------------------------------------------------------>
    html() { }
    // 4-6. css ------------------------------------------------------------------------------------->
    css() { }
    // 4-7. xml ------------------------------------------------------------------------------------->
    xml() { }
    // 4-8. json ------------------------------------------------------------------------------------>
    json() { }
    // 4-9. sql ------------------------------------------------------------------------------------->
    sql() {
        let data = this.data();
        if (this.filePath) {
            const rules1 = /(\s*)(\s*)(=)(\s*)(\?)(\s*)/gm;
            const rules2 = /(\s*)(\s*)(=)(\s*)(NOW)(\s*)/gm;
            const rules3 = /(\s*)(\s*)(=)(\s*)(now)(\s*)/gm;
            let result = lodash_1.default.chain(data);
            for (let i = 1; i <= 3; i++) {
                const rule = eval(`rules${i}`);
                result = result.replace(rule, (match, p1, p2, p3, p4, p5, p6) => {
                    return `${p2}${p4}${p5}`;
                });
            }
            const finalResult = result.value();
            fs_1.default.writeFileSync(this.filePath, finalResult, "utf8");
            return finalResult;
        }
    }
}
exports.default = Spell;
//# sourceMappingURL=Spell.js.map