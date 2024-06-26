import fs from "fs";
import path from "path";
import stripComments from "strip-comments";
import vscode from "vscode";
import Contents from "./Contents";
import lodash from "lodash";

class RemoveComments {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main()}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }

  // 2. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main().toString();
  }

  // 3. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {

      // 1. language option
      let languageOption: string;
      if (this.fileExt == "jsp") {
        languageOption = "html";
      }
      else if (this.fileExt == "javascriptreact" || "jsx") {
        languageOption = "javascript";
      }
      else if (this.fileExt == "typescriptreact" || "tsx") {
        languageOption = "typescript";
      }
      else if (this.fileExt == "vue") {
        languageOption = "html";
      }
      else if (this.fileExt == "json" || "jsonc") {
        languageOption = "javascript";
      }
      else {
        languageOption = this.fileExt;
      }

      // 2. `http://` -> `httpp`
      const pattern1 = /("|')(\s*)(http:\/\/)([\n\s\S]*?)("|')/gm;
      const pattern2 = /("|')(\s*)(https:\/\/)([\n\s\S]*?)("|')/gm;
      const pattern3 = /("|')(\s*)(@\{http:\/\/)([\n\s\S]*?)("|')/gm;
      const pattern4 = /("|')(\s*)(@\{https:\/\/)([\n\s\S]*?)("|')/gm;

      const tmpResult1 = lodash.chain(data)
      .replace(pattern1, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}httpp${p4}${p5}`;
      })
      .replace(pattern2, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}httpps${p4}${p5}`;
      })
      .replace(pattern3, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}@{httpp${p4}${p5}`;
      })
      .replace(pattern4, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}@{httpps${p4}${p5}`;
      })
      .value();

      // 2. remove comments
      const tmpResult2 = stripComments(tmpResult1, {
        preserveNewlines: true,
        keepProtected: true,
        block: true,
        line: true,
        language: languageOption
      });

      // 3. `httpp` -> `http://`
      const pattern1Re = /("|')(\s*)(httpp)([\n\s\S]*?)("|')/gm;
      const pattern2Re = /("|')(\s*)(httpps)([\n\s\S]*?)("|')/gm;
      const pattern3Re = /("|')(\s*)(@\{httpp)([\n\s\S]*?)("|')/gm;
      const pattern4Re = /("|')(\s*)(@\{httpps)([\n\s\S]*?)("|')/gm;

      const result = lodash.chain(tmpResult2)
      .replace(pattern1Re, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}http://${p4}${p5}`;
      })
      .replace(pattern2Re, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}https://${p4}${p5}`;
      })
      .replace(pattern3Re, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}@{http://${p4}${p5}`;
      })
      .replace(pattern4Re, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}@{https://${p4}${p5}`;
      })
      .value();

      // 4. save file
      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }
}

export default RemoveComments;