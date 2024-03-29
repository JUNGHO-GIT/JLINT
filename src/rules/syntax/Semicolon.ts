import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import lodash from "lodash";
import Contents from "../common/Contents";

export default class Semicolon {

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

    const rules1
    = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
    const rules2
    = /(&nbsp;)(\n+)(&nbsp;)/gm;
    const rules3
    = /(&lt;)(\n+)(&lt;)/gm;
    const rules4
    = /(;)(\n*)(\s*)(charset)/gm;

    const result = lodash.chain(data)
    .replace(rules1, (match, p1, p2, p3, p4, p5) => {
      return `${p1}${p2}${p4}\n${p1}${p5}`;
    })
    .replace(rules2, (match, p1, p2, p3) => {
      return `${p1}${p3}`;
    })
    .replace(rules3, (match, p1, p2, p3) => {
      return `${p1}${p3}`;
    })
    .replace(rules4, (match, p1, p2, p3, p4) => {
      return `${p1} ${p4}`;
    })
    .value();

    fs.writeFileSync(this.filePath, result, "utf8");
    return result;
  }

  // 3. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}