import * as fs from "fs";
import * as path from "path";
import stripComments from "strip-comments";
import * as vscode from "vscode";
import Contents from "./Contents";
import lodash from "lodash";

export default class RemoveComments {

  // 0. resource ---------------------------------------------------------------------------------->
  constructor() {this.main();}
  private activePath = path.basename(__filename);
  private filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
  private fileExt = vscode.window.activeTextEditor?.document.languageId || "";

  // 1. data -------------------------------------------------------------------------------------->
  public data() {
    return new Contents().main();
  }

  // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    // 1. language option
    let languageOption: string;
    if (
      this.fileExt === "html" ||
      this.fileExt === "jsp" ||
      this.fileExt === "vue"
    ) {
      languageOption = "html";
    }
    if (
      this.fileExt === "javascriptreact" ||
      this.fileExt === "jsx"
    ) {
      languageOption = "javascript";
    }
    if (
      this.fileExt === "typescriptreact" ||
      this.fileExt === "tsx"
    ) {
      languageOption = "typescript";
    }
    if (
      this.fileExt === "json" ||
      this.fileExt === "jsonc"
    ) {
      languageOption = "javascript";
    }
    if (
      this.fileExt === "xml"
    ) {
      languageOption = "xml";
    }

    // 2-1. `http://` -> `httpp`
    const pattern1 = /("|')(\s*)(http:\/\/)([\n\s\S]*?)("|')/gm;
    const pattern2 = /("|')(\s*)(https:\/\/)([\n\s\S]*?)("|')/gm;
    const pattern3 = /("|')(\s*)(@\{http:\/\/)([\n\s\S]*?)("|')/gm;
    const pattern4 = /("|')(\s*)(@\{https:\/\/)([\n\s\S]*?)("|')/gm;

    // 2-2. `/* Foo.foo */` -> `[[ Foo.foo ]]`
    const pattern5 = /([/][*])(\s*)(.*?[.].*?)(\s*)([*][/])/gm;

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
    .replace(pattern5, (match, p1, p2, p3, p4, p5) => {
      return `[[ ${p3} ]]`;
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

    // 3-1. `httpp` -> `http://`
    const pattern1Re = /("|')(\s*)(httpp)([\n\s\S]*?)("|')/gm;
    const pattern2Re = /("|')(\s*)(httpps)([\n\s\S]*?)("|')/gm;
    const pattern3Re = /("|')(\s*)(@\{httpp)([\n\s\S]*?)("|')/gm;
    const pattern4Re = /("|')(\s*)(@\{httpps)([\n\s\S]*?)("|')/gm;

    // 3-2. `[[ Foo.foo ]]` -> `/* Foo.foo */`
    const pattern5Re = /(\[\[)(\s*)(.*?[.].*?)(\s*)(\]\])/gm;

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
    .replace(pattern5Re, (match, p1, p2, p3, p4, p5) => {
      return `/* ${p3} */`;
    })
    .value();

    // 4. save file
    fs.writeFileSync(this.filePath, result, "utf8");
    return result;
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}