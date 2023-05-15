"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
const prettier_1 = __importDefault(require("prettier"));
const cheerio_1 = require("cheerio");
const Contents_1 = __importDefault(require("../../core/Contents"));
class Html {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data(tags) {
        if (this.filePath) {
            const data = new Contents_1.default().main();
            const $ = (0, cheerio_1.load)(data, {
                decodeEntities: true,
                xmlMode: true,
            });
            tags.forEach((tag) => {
                $(tag).each((_index, element) => {
                    const tagName = $(element).prop("tagName").toLowerCase();
                    const startComment = `<!-- ${tagName} -->`;
                    const endComment = `<!-- /.${tagName} -->`;
                    $(element).before(startComment);
                    $(element).after(endComment);
                });
            });
            return $.html();
        }
        else {
            return new Error("파일 경로를 찾을 수 없습니다.");
        }
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const tagsToComment = ["section", "main", "header", "footer"];
        const updatedHtml = this.data(tagsToComment);
        if (updatedHtml instanceof Error) {
            return updatedHtml;
        }
        else {
            const formattedCode = prettier_1.default.format(updatedHtml, {
                parser: "html",
                printWidth: 300,
                tabWidth: 2,
                useTabs: false,
                quoteProps: "as-needed",
                jsxSingleQuote: false,
                trailingComma: "all",
                bracketSpacing: true,
                jsxBracketSameLine: false,
                arrowParens: "always",
                rangeStart: 0,
                rangeEnd: Infinity,
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
                fs_1.default.writeFileSync(this.filePath, formattedCode, "utf8");
            }
            return formattedCode;
        }
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        return console.log("_____________________\n" + this.activePath + "  실행");
    }
}
exports.default = Html;
//# sourceMappingURL=Html.js.map