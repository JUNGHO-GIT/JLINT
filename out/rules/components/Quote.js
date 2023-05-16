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
class Quote {
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
        const data = this.data();
        if (this.filePath) {
            const rulesOne = /(?<!["])(')(?!["])/gm;
            const rulesTwo = /"window\.location\.href="/gm;
            const rulesThree = /"location\.href="/gm;
            const rulesFour = /"location="/gm;
            const rulesFive = /"href="/gm;
            const rulesSix = /(\b)(")(")/gm;
            const rulesSeven = /(")(")(\b)/gm;
            const rulesEight = /(\}|\)|\])(")(")/gm;
            const result = lodash_1.default.chain(data)
                .replace(rulesOne, (match, p1) => {
                return `"`;
            })
                .replace(rulesTwo, (match, p1) => {
                return `"window.location.href='`;
            })
                .replace(rulesThree, (match, p1) => {
                return `"location.href='`;
            })
                .replace(rulesFour, (match, p1) => {
                return `"location='`;
            })
                .replace(rulesFive, (match, p1) => {
                return `"href='`;
            })
                .replace(rulesSix, (match, p1, p2, p3) => {
                return `${p1}'${p3}`;
            })
                .replace(rulesSeven, (match, p1, p2, p3) => {
                return `${p1}'${p3}`;
            })
                .replace(rulesEight, (match, p1, p2, p3) => {
                return `${p1}'${p3}`;
            })
                .value();
            fs_1.default.writeFileSync(this.filePath, result, "utf8");
            return result;
        }
        else {
            return new Error("파일 경로를 찾을 수 없습니다.");
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Quote;
//# sourceMappingURL=Quote.js.map