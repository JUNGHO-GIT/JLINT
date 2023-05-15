/* import fs from "fs";
import path from "path";
import lodash from "lodash";
import vscode from "vscode";
import { Parser } from "htmlparser2";
import Contents from "../../core/Contents";

class Test {
  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {
    this.main();
  }
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().data();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    if (this.filePath || this.fileExt === "html") {
      const data = this.data();
      const result = this.addCommentsToTags(data);

      console.log(result);
    } else {
      console.error("파일 경로를 찾을 수 없습니다.");
    }
  }

  // 2.1. addCommentsToTags ----------------------------------------------------------------------->
  private addCommentsToTags(html: string): string {
    let result = "";

    const parser = new Parser(
      {
        onopentag: (name, attribs) => {
          result += `<!-- Start ${name} -->`;
          result += `<${name}`;

          for (const [key, value] of Object.entries(attribs)) {
            result += ` ${key}="${value}"`;
          }
          result += ">";
        },
        ontext: (text) => {
          result += text;
        },
        onclosetag: (name) => {
          result += `<!-- End ${name} -->`;
          result += `</${name}>`;
        },
      },
      { decodeEntities: true }
    );

    parser.write(html);
    parser.end();

    return result;
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    console.log("_____________________\n" + this.activePath + "  실행");
    this.main();
  }
}

export default Test;
 */ 
//# sourceMappingURL=Test.js.map