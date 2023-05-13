"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const ReadContents_1 = __importDefault(require("../common/ReadContents"));
class Xml {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        // 0. data
        const data = new ReadContents_1.default().main().toString();
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
        // xml format
        const format = (0, xml_formatter_1.default)(data, {
            indentation: "  ",
            collapseContent: false,
            lineSeparator: "\n",
            whiteSpaceAtEndOfSelfclosingTag: false,
            filter: (node) => node.type !== "Comment",
            throwOnFailure: false,
        });
        // 1. write
        fs_1.default.writeFileSync(this.filePath, format, "utf8");
        return format;
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
exports.default = Xml;
