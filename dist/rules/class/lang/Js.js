"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const prettier_1 = __importDefault(require("prettier"));
const ReadContents_1 = __importDefault(require("../common/ReadContents"));
class Js {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        // 0. data
        const data = new ReadContents_1.default().main();
        if (data instanceof Error) {
            return data;
        }
        const rulesOne = /(?<=[^!-~]|[;]|[(){}<>])(\/\/|\/\*|^\*|\*\/|<!--|<%--)(.*)(?<=[\s\S]*)/gm;
        const rulesTwo = /(?<!([<]|["'].*))(\s*)(===|==|=|!===|!==|!=|&&|<=|>=|=>|\+\+|\+-|\+=|-=|\+|-|[*])(\s*)(?!(.*[\/>]|[>]))/gm;
        // 3. replace
        const result = lodash_1.default.chain(data)
            .replace(rulesOne, (match, p1, p2, p3) => {
            return ``;
        })
            .replace(rulesTwo, (match, p1, p2, p3, p4, p5) => {
            return ` ${p3} `;
        })
            .value();
        // 4. write
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        // 0. data
        const data = this.data();
        if (data instanceof Error) {
            return data;
        }
        const formattedCode = prettier_1.default.format(data, {
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
            embeddedLanguageFormatting: "auto",
            __embeddedInHtml: false,
            bracketSameLine: false,
            parentParser: "none",
            singleAttributePerLine: true,
        });
        fs_1.default.writeFileSync(this.filePath, formattedCode, "utf8");
        return formattedCode;
    }
    // 3. output ------------------------------------------------------------------------------------>
    output() {
        try {
            return console.log("_____________________\n" + this.fileName + "  실행");
        }
        catch (err) {
            return console.log(new Error());
        }
    }
}
exports.default = Js;
