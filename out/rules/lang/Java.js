"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const vscode = require("vscode");
const prettier = require("prettier");
const Contents_1 = require("../../core/Contents");
class Java {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path.basename(__filename);
    filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        if (this.filePath) {
            const data = new Contents_1.default().data();
            const rulesOne = /(?<=[^!-~]|[;]|[(){}<>])(\/\/|\/\*|^\*|\*\/|<!--|<%--)(.*)(?<=[\s\S]*)/gm;
            const rulesTwo = /(?<!([<]|["'].*))(\s*)(===|==|=|!===|!==|!=|&&|<=|>=|=>|\+\+|\+-|\+=|-=|\+|-|[*])(\s*)(?!(.*[\/>]|[>]))/gm;
            // 3. replace
            const result = lodash.chain(data)
                .replace(rulesOne, (match, p1, p2, p3) => {
                return ``;
            })
                .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
                return ` ${p3} `;
            })
                .value();
            fs.writeFileSync(this.filePath, result);
            return result;
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
                parser: "java",
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
                embeddedLanguageFormatting: "auto"
            });
            if (this.filePath) {
                fs.writeFileSync(this.filePath, formattedCode);
            }
            return formattedCode;
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Java;
//# sourceMappingURL=Java.js.map