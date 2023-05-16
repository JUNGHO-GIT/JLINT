/* // 2. main -------------------------------------------------------------------------------------->
  public main() {
    const data = this.data();

    if (this.filePath) {

      const frontComments = () => {
        const rulesZero
        = /^(\s*\/\/ --.*){2}(\n*)(^\s*)(public|private|function)(.*)/gm;
        const result = lodash.chain(data)
        .replace(rulesZero, (match, p1, p2, p3, p4, p5) => {
          return `${p2}${p3}${p4}${p5}`;
        })
        .value();
        return result;
      };
      const backComments = () => {
        const rulesTwo
        = /(\s*?)(public|private|function)(\s*)([\s\S]*?)(\s*)(\()(\s*)([\s\S]*?)(\s*)(\))(\s*)(([\s\S]*?))(\s*?)(\{)/gm;
        const result = lodash.chain(data)
        .replace(rulesTwo, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) => {
          return `${p1}${p2} ${p4} ${p6}${p8}${p10} ${p12} ${p15}`;
        })
        .value();
        return result;
      };

      fs.writeFileSync(this.filePath, result, "utf8");
      return result;
    }
    else {
      return new Error("파일 경로를 찾을 수 없습니다.");
    }
  } */