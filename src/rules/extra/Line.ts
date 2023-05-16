import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Line {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {

      // 1-1. front comments regex ---------------------------------------------------------------->
      const rulesTwo
      = /^(?!\/\/--)(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
      const rulesThree
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rulesFour
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
      const rulesFive
      = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*\(\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rulesSix
      = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;

      // 1-2. back comments regex ----------------------------------------------------------------->
      const rulesOneDot
      = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
      const rulesTwoDot
      = /(\s*?)(ception)(\{)/gm;
      const rulesThreeDot
      = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
      const rulesFourDot
      = /(^.\s*?)(@)(.*)(\n+)(\s*)(\/\/.*?>)(\n+)(\s+)(public|private|function)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
      const rulesFiveDot
      = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
      const rulesSixDot
      = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
      const rulesSevenDot
      = /(>)(\n*)(?:\})(?:\n*)(function)/gm;
      const rulesEightDot
      = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;

      // 2-1. front comments replace -------------------------------------------------------------->
      const result = lodash.chain(data)
      .replace(rulesTwo, (match, p1, p2, p3) => {
        const spaceSize = 100 - (lodash.size(p1) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rulesThree, (match, p1, p2, p3) => {
        const spaceSize = 100 - (lodash.size(p1) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rulesFour, (match, p1, p2, p3) => {
        const spaceSize = 100 - (lodash.size(p1) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rulesFive, (match, p1, p2, p3) => {
        const spaceSize = 100 - (lodash.size(p1) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })
      .replace(rulesSix, (match, p1, p2, p3) => {
        const spaceSize = 100 - (lodash.size(p1) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
      })

      // 2-2. back comments replace --------------------------------------------------------------->
      .replace(rulesOneDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
        return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
      })
      .replace(rulesTwoDot, (match, p1, p2, p3) => {
        return `${p2} ${p3}`;
      })
      .replace(rulesThreeDot, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
      })
      .replace(rulesFourDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
        return `${p5}${p6}\n${p5}${p2}${p3}\n${p8}${p9}${p10}`;
      })
      .replace(rulesFiveDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}${p2}${p3}${p4}\n`;
      })
      .replace(rulesSixDot, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
      })
      .replace(rulesSevenDot, (match, p1, p2, p3, p4) => {
        return `${p1}\n${p3}`;
      })
      .replace(rulesEightDot, (match, p1, p2, p3, p4, p5) => {
        return `${p2}${p3}${p4}${p5}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}

export default Line;
