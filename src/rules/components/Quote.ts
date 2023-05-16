import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import Contents from "../common/Contents";

class Quote {

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

      const rulesOne = /(?<!["])(')(?!["])/gm;
      const rulesTwo = /"window\.location\.href="/gm;
      const rulesThree = /"location\.href="/gm;
      const rulesFour = /"location="/gm;
      const rulesFive = /"href="/gm;
      const rulesSix = /(\b)(")(")/gm;
      const rulesSeven = /(")(")(\b)/gm;
      const rulesEight = /(\}|\)|\])(")(")/gm;

      const result =lodash.chain(data)
      .replace(rulesOne, (match, p1) => {
        return `"`;
      })
      .replace(rulesTwo, (match, p1) => {
        return `"window.location.href='`;
      })
      .replace(rulesThree, (match, p1) => {
        return `"location.href='`;
      })
      .replace(rulesFour, (match, p1) => {
        return `"location='`;
      })
      .replace(rulesFive, (match, p1) => {
        return `"href='`;
      })
      .replace(rulesSix, (match, p1, p2, p3) => {
        return `${p1}'${p3}`;
      })
      .replace(rulesSeven, (match, p1, p2, p3) => {
        return `${p1}'${p3}`;
      })
      .replace(rulesEight, (match, p1, p2, p3) => {
        return `${p1}'${p3}`;
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

export default Quote;