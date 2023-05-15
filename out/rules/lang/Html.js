"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
const cheerio_1 = require("cheerio");
const prettier_1 = __importDefault(require("prettier"));
const strip_comments_1 = __importDefault(require("strip-comments"));
const Contents_1 = __importDefault(require("../common/Contents"));
class Html {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    activePath = path_1.default.basename(__filename);
    filePath = vscode_1.default.window.activeTextEditor?.document.uri.fsPath;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        const data = new Contents_1.default().main().toString();
        // 1. remove comments
        const result = (0, strip_comments_1.default)(data, {
            preserveNewlines: false,
            keepProtected: false,
            block: true,
            line: true,
            language: "html"
        });
        // 2. cheerio setting
        const $ = (0, cheerio_1.load)(result, {
            decodeEntities: true,
            xmlMode: false,
            quirksMode: false,
            lowerCaseTags: false,
            lowerCaseAttributeNames: false,
            recognizeCDATA: true,
            recognizeSelfClosing: false,
        });
        // 2-1. comments list
        const tagsArray = [
            "section", "main", "header", "footer", "nav", "table", "form",
            "div[class*=container]", "div[class*=row]", "div[class*=col]"
        ];
        // 2-2. insert comments
        tagsArray.forEach((tag) => {
            let tagParam = tag;
            if (tag === "div[class*=container]") {
                tagParam = "container";
            }
            if (tag === "div[class*=row]") {
                tagParam = "row";
            }
            if (tag === "div[class*=col]") {
                tagParam = "col";
            }
            $(tag).each(function () {
                if (!$(this).prev().is(`:contains(<!-- ${tagParam} -->)`) && !$(this).next().is(`:contains(<!-- /.${tagParam} -->)`)) {
                    $(this).before(`<!-- ${tagParam} -->`);
                    $(this).after(`<!-- /.${tagParam} -->`);
                }
            });
        });
        fs_1.default.writeFileSync(this.filePath, $.html(), "utf8");
        return $.html();
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        const data = this.data();
        if (this.filePath) {
            const formattedCode = prettier_1.default.format(data, {
                parser: "vue",
                singleQuote: false,
                printWidth: 1000,
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
                bracketSameLine: false,
                parentParser: "none",
                singleAttributePerLine: false
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
exports.default = Html;
//# sourceMappingURL=Html.js.map