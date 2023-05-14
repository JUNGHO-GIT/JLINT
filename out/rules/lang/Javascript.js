"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const prettier = require("prettier");
const Contents_1 = require("../../core/Contents");
class Javascript {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        if (this.filePath) {
            return new Contents_1.default().data();
        }
        else {
            return new Error("파일 경로를 찾을 수 없습니다.");
        }
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const data = this.data();
        if (data instanceof Error) {
            return data;
        }
        else {
            const formattedCode = prettier.format(data, {
                parser: "babel",
                printWidth: 1000,
                tabWidth: 2,
                useTabs: false,
                semi: true,
                singleQuote: false,
                quoteProps: "as-needed",
                jsxSingleQuote: false,
                trailingComma: "all",
                bracketSpacing: true,
                jsxBracketSameLine: false,
                arrowParens: "always",
                rangeStart: 0,
                rangeEnd: 10000,
                requirePragma: false,
                insertPragma: false,
                proseWrap: "preserve",
                htmlWhitespaceSensitivity: "css",
                vueIndentScriptAndStyle: true,
                endOfLine: "lf",
                embeddedLanguageFormatting: "off",
                bracketSameLine: false,
                parentParser: "none",
                singleAttributePerLine: false,
            });
            if (this.filePath) {
                fs.writeFileSync(this.filePath, formattedCode, "utf8");
            }
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