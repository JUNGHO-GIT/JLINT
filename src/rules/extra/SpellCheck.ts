import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import lodash from "lodash";
import Contents from "../common/Contents";

export default class SpellCheck {

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
    return this.JsTs()
    + this.Java()
    + this.HtmlJsp()
    + this.Css()
    + this.Xml()
    + this.Json()
    + this.Sql()
    + this.All();
  }

  // 3-1. JsTs ------------------------------------------------------------------------------------>
  public JsTs () {
    const data = this.data();

    if (
      this.fileExt === "javascript" ||
      this.fileExt === "javascriptreact" ||
      this.fileExt === "typescript" ||
      this.fileExt === "typescriptreact"
    ) {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
      const rules2
      = /(^\s*)(type)(\s*?)(:)(\s*?)('|")(post|POST)('|")(\s*?)(,)/gm;
      const rules3
      = /(^\s*)(type)(\s*?)(:)(\s*?)('|")(get|GET)('|")(\s*?)(,)/gm;
      const rules4
      = /(^\s*)(dataType)(\s*?)(:)(\s*?)('|")(json|JSON)('|")(\s*?)(,)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "POST",`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "GET",`;
      })
      .replace(rules4, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "JSON",`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-2. Java ------------------------------------------------------------------------------------>
  public Java () {
    const data = this.data();

    if (this.fileExt === "java") {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
      const rules2
      = /(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm;
      const rules3
      = /(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm;
      const rules4
      = /(^\s*)([@]RequestMapping)(\s*?)(\()(\s*?)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p4}${p5}\n${p2}${p3}\n${p7}${p8}`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
        return `${p1}${p2}${p3}${p4}${p5}\n${p7}${p8}`;
      })
      .replace(rules4, (match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}\n${p1}${p4}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-3. HtmlJsp --------------------------------------------------------------------------------->
  public HtmlJsp () {
    const data = this.data();

    if (this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
        return `${p1}${p2}${p3}${p4}${p11}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-4. Css ------------------------------------------------------------------------------------->
  public Css () {}

  // 3-5. Xml ------------------------------------------------------------------------------------->
  public Xml () {
    const data = this.data();

    if (this.fileExt === "xml") {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
      const rules2
      = /(^\s*)([<]select|[<]update)([\s\S]*?)(?<=[>])(\s*)([/][*])(\s*)(.*?[.].*?)(\s*)([*][/])(\s*)([\n\s\S]*?)(\s*)([<][/]select[>]|[<][/]update[>])/gm;
      const rules3
      = /(\n+)(^\s*)(select|from|update|set|where|order by|group by|left join|right join)(\s*)/gmi;
      const rules4
      = /(,)(\s*)(\n+)(\s*)(case when|ISNULL|IFNULL)/gmi;
      const rules5
      = /(^\s*)([<]select|[<]update|[<]insert)(\s*)(id=)(\S*)(\s*)(resultType=)(\S*)(\s*)(parameterType=)(\S*)(\s*)([>])/gm;

      const rules6
      = /(\S*)(\s*)(\n)(^\s*)([,])/gm;
      const rules7
      = /(\S*)(\s+)([,])(\s+)(\S*)/gm;
      const rules8
      = /(\S(?<!version|namespace|id|Type|test))([,])(\S)/gm;
      const rules9
      = /(\S(?<!version|namespace|id|Type|test))([=])(\S)/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}\n${p1}\t${p5} ${p7} ${p9}\n${p1}\t${p11}\n${p1}${p13}`;
      })
      .replace(rules3, (match, p1, p2, p3, p4) => {
        return `\n\t\t${p3}\n\t\t\t`;
      })
      .replace(rules4, (match, p1, p2, p3, p4, p5) => {
        return `, ${p5}`;
      })
      .replace(rules5, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5} ${p10}${p11} ${p7}${p8}${p13}`;
      })
      .replace(rules6, (match, p1, p2, p3, p4, p5) => {
        return `${p1},`;
      })
      .replace(rules7, (match, p1, p2, p3, p4, p5) => {
        return `${p1}, ${p5}`;
      })
      .replace(rules8, (match, p1, p2, p3) => {
        return `${p1}, ${p3}`;
      })
      .replace(rules9, (match, p1, p2, p3) => {
        return `${p1} = ${p3}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-6. Json ------------------------------------------------------------------------------------>
  public Json() {}

  // 3-7. Sql ------------------------------------------------------------------------------------->
  public Sql() {}

  // 3-8. Php ------------------------------------------------------------------------------------->
  public Php() {
    const data = this.data();

    if (this.fileExt === "php") {

      const rules1
      = /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm;
      const rules2
      = /(^\s*)(type)(\s*?)(:)(\s*?)('|")(post|POST)('|")(\s*?)(,)/gm;
      const rules3
      = /(^\s*)(type)(\s*?)(:)(\s*?)('|")(get|GET)('|")(\s*?)(,)/gm;
      const rules4
      = /(^\s*)(dataType)(\s*?)(:)(\s*?)('|")(json|JSON)('|")(\s*?)(,)/gm;
      const rules5
      = /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm;

      const result = lodash.chain(data)
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
        return `${p1}${p2}${p3}${p4}${p5}${p13}`;
      })
      .replace(rules2, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "POST",`;
      })
      .replace(rules3, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "GET",`;
      })
      .replace(rules4, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
        return `${p1}${p2}: "JSON",`;
      })
      .replace(rules1, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11) => {
        return `${p1}${p2}${p3}${p4}${p11}`;
      })
      .value();

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
  }

  // 3-9. All ------------------------------------------------------------------------------------->
  public All () {}

  // 4. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}