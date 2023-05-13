"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ReadContents {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        try {
            // 1. 파일 내용 읽기
            const content = fs_1.default.readFileSync(this.filePath, "utf8").toString();
            // 2. 들여쓰기 변경
            const updateContent = content.split("\n").map(line => {
                const indentMatch = line.match(/^(\s+)/);
                if (indentMatch) {
                    const spaces = indentMatch[1].length;
                    const newIndent = Math.ceil(spaces / 2) * 2;
                    return line.replace(/^(\s+)/, " ".repeat(newIndent));
                }
                return line;
            }).join("\n");
            // 3. 파일 내용 쓰기
            fs_1.default.writeFileSync(this.filePath, updateContent, "utf8");
            // 4. 결과 반환
            return updateContent;
        }
        catch (err) {
            return new Error(`파일내용을 읽을 수 없습니다. \n`);
        }
    }
    // 2. lang -------------------------------------------------------------------------------------->
    main() {
        try {
            return this.data();
        }
        catch (err) {
            return new Error();
        }
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
exports.default = ReadContents;
