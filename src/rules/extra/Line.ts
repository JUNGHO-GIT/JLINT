import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../../core/Contents";

class Line {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().data();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    if (this.filePath) {
      const data = this.data();

      const rulesOne
      = /(\n*)(\s*)(?=\n*)(^\s*)(public|private|function)(([\s\S](?!;|class))*?)(\s*)(?<=\{)/gm;
      const rulesTwo
      = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
      const rulesThree
      = /(\s*?)(ception)(\{)/gm;
      const rulesFour
      = /(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm;
      const rulesFive
      = /(^.\s*?)(@)(.*)(\n+)(\s*)(\/\/.*?>)(\n+)(\s+)(public|private|function)((([\s\S](?!;|class))*?))(\s*)(?<=\{)/gm;
      const rulesSix
      = /(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm;
      const rulesSeven
      = /(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm;
      const rulesEight
      = /(>)(\n*)(?:\})(?:\n*)(function)/gm;

      const result = lodash.chain(data)
      .replace(rulesOne, (match, p1, p2, p3, p4, p5, p6) => {
        const spaceSize = 100 - (lodash.size(p3) + lodash.size(`// `) + lodash.size(`>`));
        const insetLine = `// ` + `-`.repeat(spaceSize) + `>`;
        return `\n${p3}${insetLine}\n${p3}${p4}${p5}`;
      })
      .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
        return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
      })
      .replace(rulesThree, (match, p1, p2, p3) => {
        return `${p2} ${p3}`;
      })
      .replace(rulesFour, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p2}${p3}${p4}\n\n${p7}${p8}`;
      })
      .replace(rulesFive, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) => {
        return `${p5}${p6}\n${p5}${p2}${p3}\n${p8}${p9}${p10}`;
      })
      .replace(rulesSix, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}${p2}${p3}${p4}\n`;
      })
      .replace(rulesSeven, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}${p3}${p4}\n\n${p8}${p10}`;
      })
      .replace(rulesEight, (match, p1, p2, p3, p4) => {
        return `${p1}\n${p3}`;
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
    console.log("_____________________\n" + this.activePath + "  실행");
    return this.main();
  }
}

export default Line;
