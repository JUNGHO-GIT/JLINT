import fs from "fs";
import path from "path";
import lodash from "lodash";
import * as vscode from "vscode";
import Contents from "../common/Contents";

export default class IfElse {

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

    const rules1
    = /(\b)(if)(\()/gm;
    const rules2
    = /(\s*)([\s\S]*)(\s*)([;])(\s*)(else(?!\s*if))/gm;

    const rules33
    = /(?!\n)(^\s*)(else(?!\s*if))(\s*)((?!{)(.*?))[^}](?<=;)/gm;
    const rules3
    = /(?!\n)(^\s*)[}](\s*)(else(?!\s*if))(\s*)((?!{)(.*?))[^}](?<=;)/gm;
    const rules4
    = /(?!\n)(^\s*)(if|else if)(\s*)[(]((?:[^()]|[(](?:[^()]|[(][^()]*[)])*[)])*)[)]((?!{)(.*?))[^}](?<=;)/gm;

    const rules5
    = /(.*?)(?<=[}])(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)([{]\s*)(.*?;)(\s*[}])/gm;
    const rules55
    = /(?!\n)(^\s*)[}](\s*)(else(?!\s*if))(\s*)/gm;

    const rules6
    = /(.*?)(?<=[}])(\s*)(\n*)(\s*)(else if)(\s*)([(]\s*)([\s\S]*?)(\s*[)])(\s*)([{]\s*)([\s\S]*?;)(\s*[}])/gm;
    const rules66
    = /(?!\n)(^\s*)[}](\s*)(else if)(\s*)/gm;

    const result = lodash.chain(data)
    .replace(rules1, (match, p1, p2, p3) => {
      return `${p2} (`;
    })
    .replace(rules2, (match, p1, p2, p3, p4, p5, p6) => {
      return `${p1}${p2}${p3}${p4}\n${p1}${p6}`;
    })

    .replace(rules33, (match, p1, p2, p3, p4) => {
      return `${p1}${p2} {\n${p1}\t${p4};\n${p1}}`;
    })
    .replace(rules3, (match, p1, p2, p3, p4, p5) => {
      return `${p1}}\n${p1}${p3} {\n${p1}\t${p5};\n${p1}}`;
    })
    .replace(rules4, (match, p1, p2, p3, p4, p5) => {
      return `${p1}${p2} (${p4}) {\n${p1}\t${p5};\n${p1}}`;
    })

    .replace(rules5, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
      const indentSize1 = p1.length - `}`.length;
      const indentSize2 = p9.length - `}`.length;
      const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
      const insertSize = " ".repeat(spaceSize);
      return `${p1}\n${insertSize}${p5} {\n${insertSize}\t${p8}\n${insertSize}}`;
    })
    .replace(rules55, (match, p1, p2, p3, p4) => {
      return `${p1}}\n${p1}${p3} `;
    })

    .replace(rules6, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
      const indentSize1 = p1.length - `}`.length;
      const indentSize2 = p13.length - `}`.length;
      const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
      const insertSize = " ".repeat(spaceSize);
      return `${p1}\n${insertSize}${p5} (${p8}) {\n${insertSize}\t${p12}\n${insertSize}}`;
    })
    .replace(rules66, (match, p1, p2, p3, p4) => {
      return `${p1}}\n${p1}${p3} `;
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