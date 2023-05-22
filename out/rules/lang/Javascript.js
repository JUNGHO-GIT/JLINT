"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
const prettier_1 = __importDefault(require("prettier"));
const strip_comments_1 = __importDefault(require("strip-comments"));
const Contents_1 = __importDefault(require("../common/Contents"));
class Javascript {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        const data = new Contents_1.default().main().toString();
        // 1. remove comments
        const result = (0, strip_comments_1.default)(data, {
            preserveNewlines: true,
            keepProtected: true,
            block: true,
            line: true
        });
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const data = this.data();
        if (this.filePath) {
            const formattedCode = prettier_1.default.format(data, {
                parser: "babel-flow",
                printWidth: 1000,
                singleQuote: false,
                tabWidth: 2,
                useTabs: false,
                quoteProps: "as-needed",
                jsxSingleQuote: false,
                trailingComma: "all",
                bracketSpacing: false,
                jsxBracketSameLine: true,
                arrowParens: "always",
                rangeStart: 0,
                rangeEnd: Infinity,
                requirePragma: false,
                insertPragma: false,
                proseWrap: "preserve",
                htmlWhitespaceSensitivity: "css",
                vueIndentScriptAndStyle: true,
                endOfLine: "lf",
                embeddedLanguageFormatting: "auto",
                bracketSameLine: true,
                parentParser: "none",
                singleAttributePerLine: false,
            });
            fs_1.default.writeFileSync(this.filePath, formattedCode, "utf8");
            return formattedCode;
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Javascript;
//# sourceMappingURL=Javascript.js.map