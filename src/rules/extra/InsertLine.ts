import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import lodash from "lodash";
import Contents from "../common/Contents";

export default class InsertLine {

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
  public JsTs() {
    const data = this.data();

    if (
      this.fileExt === "javascript" ||
      this.fileExt === "javascriptreact" ||
      this.fileExt === "typescript" ||
      this.fileExt === "typescriptreact"
    ) {

      const rules1
      = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
      const rules2
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules3
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
      const rules4
      = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules5
      = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
      const rules6
      = /^(?!\/\/--)(?:\n*)(\s*)(var\s*\S+\s*=\s*function)(?:\n*)(?:(\s*.*))(\s*?)/gm;
      const rules7
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(document\)[.]ready\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules8
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]load\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules9
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]resize\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules10
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]scroll\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules11
      = /^(?!\/\/--)(?:\n*)(\s*)(var|let|const)(\s*\S+\s*=\s*\[)(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 11; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
          const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 3-2. Java ------------------------------------------------------------------------------------>
  public Java() {
    const data = this.data();

    if (this.fileExt === "java") {

      const rules1
      = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(?!(?:private String gUserNm;)|(?:private String gFileDir;)|(?:private String gWarDir;)|(?:private SqlSession sqlSession;)|(?:public void setTemplate\(JdbcTemplate template\) \{)|(?:private JdbcTemplate template;)|(?:private Utils utils = new Utils\(\);)|(?:private Gson gson = new Gson\(\);))(public|private|function|class)(?:(\s*.*))(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 1; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
          const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 3-3. HtmlJsp --------------------------------------------------------------------------------->
  public HtmlJsp() {
    const data = this.data();

    if (this.fileExt === "html" || this.fileExt === "jsp") {

      const rules1
      = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
      const rules2
      = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
      const rules3
      = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
      const rules4
      = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
      const rules5
      = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
      const rules6
      = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
      const rules7
      = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
      const rules8
      = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
      const rules9
      = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;

      let result = lodash.chain(data);

      for (let i = 1; i <= 9; i++) {
        const rule = eval(`rules${i}`);
        result = result.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (lodash.size(p1) + lodash.size(`<!--`) + lodash.size(`-->`));
          const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 3-4. Css ------------------------------------------------------------------------------------->
  public Css() {}

  // 3-5. Xml ------------------------------------------------------------------------------------->
  public Xml() {}

  // 3-6. Json ------------------------------------------------------------------------------------>
  public Json() {}

  // 3-7. Sql ------------------------------------------------------------------------------------->
  public Sql() {}

  // 3-8. Php ------------------------------------------------------------------------------------->
  public Php() {
    const data = this.data();

    if (this.fileExt === "php") {

      const rules1
      = /^(?!\/\/--)(?!(?:.*\bclassName\b)|(?:.*class=".*"))(?:\n*)(\s*)(public|private|function|class)(?:(\s*.*))(\s*?)/gm;
      const rules2
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules3
      = /^(?!\/\/--)(?:\n*)(\s*)(const\s+\w+\s*=\s*\[)(\s*?)/gm;
      const rules4
      = /^(?!\/\/--)(?:\n*)(\s*)(useEffect\s*\(\s*\(\s*.*?\)\s*=>\s*\{)(\s*?)/gm;
      const rules5
      = /^(?!\/\/--)(?:\n*)(\s*)(return\s*.*?\s*[<])(\s*?)/gm;
      const rules6
      = /^(?!\/\/--)(?:\n*)(\s*)(var\s*\S+\s*=\s*function)(?:\n*)(?:(\s*.*))(\s*?)/gm;
      const rules7
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(document\)[.]ready\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules8
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]load\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules9
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]resize\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules10
      = /^(?!\/\/--)(?:\n*)(\s*)([$]\(window\)[.]scroll\(\s*function\s*\(\s*\)\s*\{)(\s*?)/gm;
      const rules11
      = /^(?!\/\/--)(?:\n*)(\s*)(var|let|const)(\s*\S+\s*=\s*\[)(\s*?)/gm;

      let result1 = lodash.chain(data);

      for (let i = 1; i <= 11; i++) {
        const rule = eval(`rules${i}`);
        result1 = result1.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (p1.length + `// `.length + `>`.length);
          const insetLine = `// ` + '-'.repeat(spaceSize) + `>`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const rules21
      = /^(?!\/\/--)(?:\n*)(\s*)([<]head\s*.*\s*[>])(\s*?)/gm;
      const rules22
      = /^(?!\/\/--)(?:\n*)(\s*)([<]body\s*.*\s*[>])(\s*?)/gm;
      const rules23
      = /^(?!\/\/--)(?:\n*)(\s*)([<]header\s*.*\s*[>])(\s*?)/gm;
      const rules24
      = /^(?!\/\/--)(?:\n*)(\s*)([<]main\s*.*\s*[>])(\s*?)/gm;
      const rules25
      = /^(?!\/\/--)(?:\n*)(\s*)([<]footer\s*.*\s*[>])(\s*?)/gm;
      const rules26
      = /^(?!\/\/--)(?:\n*)(\s*)([<]section\s*.*\s*[>])(\s*?)/gm;
      const rules27
      = /^(?!\/\/--)(?:\n*)(\s*)([<]table\s*.*\s*[>])(\s*?)/gm;
      const rules28
      = /^(?!\/\/--)(?:\n*)(\s*)([<]form\s*.*\s*[>])(\s*?)/gm;
      const rules29
      = /^(?!\/\/--)(?:\n*)(\s*)([<]div class="row\s*.*\s*[>])(\s*?)/gm;

      let result2 = lodash.chain(data);

      for (let i = 21; i <= 29; i++) {
        const rule = eval(`rules${i}`);
        result2 = result2.replace(rule, (match, p1, p2, p3) => {
          const spaceSize = 100 - (lodash.size(p1) + lodash.size(`<!--`) + lodash.size(`-->`));
          const insetLine = `<!--` + `-`.repeat(spaceSize) + `-->`;
          return `\n${p1}${insetLine}\n${p1}${p2}${p3}`;
        });
      }

      const finalResult = result1.value() + result2.value();

      fs.writeFileSync(this.filePath, finalResult, "utf8");
      return finalResult;
    }
  }

  // 3-9. All ------------------------------------------------------------------------------------->
  public All () {}

  // 4. output ------------------------------------------------------------------------------------>
  public output() {
    return console.log("_____________________\n" + this.activePath + "  실행");
  }
}