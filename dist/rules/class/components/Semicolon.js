"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const ReadContents_1 = __importDefault(require("../common/ReadContents"));
class Semicolon {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        try {
            return new ReadContents_1.default().main().toString();
        }
        catch (err) {
            return new Error(`파일내용을 읽을 수 없습니다. \n`);
        }
    }
    // 2. main -------------------------------------------------------------------------------------->
    main() {
        // 0. data
        const data = this.data();
        if (data instanceof Error) {
            return data;
        }
        const rulesOne = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
        const result = lodash_1.default.chain(data)
            .replace(rulesOne, (match, p1, p2, p3, p4, p5) => {
            return `${p1}${p2}${p4}\n${p1}${p5}`;
        })
            .value();
        fs_1.default.writeFileSync(this.filePath, result, "utf8");
        return result;
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
exports.default = Semicolon;
