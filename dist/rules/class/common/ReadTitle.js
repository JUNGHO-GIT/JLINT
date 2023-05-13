"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class ReadTitle {
    // 0. resource ---------------------------------------------------------------------------------->
    constructor() { this.main(); }
    filePath = process.argv[2];
    fileName = path_1.default.basename(__filename);
    fileExt = path_1.default.extname(this.filePath);
    copyPath = this.filePath.slice(0, -this.fileExt.length) + "-2" + this.fileExt;
    // 1. data -------------------------------------------------------------------------------------->
    data() {
        try {
            return path_1.default.basename(this.filePath).toString();
        }
        catch (err) {
            return new Error(`파일이름을 읽을 수 없습니다. \n`);
        }
    }
    // 2. main -------------------------------------------------------------------------------------->
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
exports.default = ReadTitle;
