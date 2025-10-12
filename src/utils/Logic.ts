// Logic.ts

import lodash from "lodash";
import { fnLogger } from "../assets/scripts/utils";

// -------------------------------------------------------------------------------------------------
export const ifElse = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    // 1. if( => if (
    const rules1 = (
      /\bif\(/gm
    );

    // 2. else if( => else if (
    const rules2 = (
      /\belse\s+if\(/gm
    );

    // 3. } 뒤의 여러 줄바꿈을 하나로 통합
    const rules3 = (
      /\}\n+(\s*)/gm
    );

    // 4. } else if (...) { => }\nelse if (...) {
    const rules4 = (
      /^(\s*)\}\s*(else\s+if)\s*\((.*?)\)\s*\{/gm
    );

    // 5. } else { => }\nelse {
    const rules5 = (
      /^(\s*)\}\s*(else)(?!\s+if)\s*\{/gm
    );

    // 6. 한 줄 if 블록을 여러 줄로 변환
    const rules6 = (
      /^(\s*)(if|else\s+if)\s*\((.*?)\)\s*\{\s*([^{}]+?)\s*\}$/gm
    );

    // 7. 한 줄 else 블록을 여러 줄로 변환
    const rules7 = (
      /^(\s*)\}\s*else(?!\s+if)\s*\{\s*([^{}]+?)\s*\}$/gm
    );

    // 8. { 뒤의 불필요한 빈 줄 제거
    const rules8 = (
      /\{\s*\n+/gm
    );

    // 9. } 앞의 불필요한 빈 줄 제거
    const rules9 = (
      /\n+(\s*)\}/gm
    );

    // 10. } 다음 else 줄나눔 1개로 통합
    const rules10 = (
      /(^\s*)(\})(\s*)(\n*)(\s*)(else.*)(\s*)(\{)/gm
    );

    const finalResult = lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        'if ('
      ))
      .replace(rules2, (...p) => (
        'else if ('
      ))
      .replace(rules3, (...p) => (
        `}\n${p[1]}`
      ))
      .replace(rules4, (...p) => {
        const indent = p[1];
        const keyword = p[2];
        const condition = p[3];
        return `${indent}}\n${indent}${keyword} (${condition}) {`;
      })
      .replace(rules5, (...p) => {
        const indent = p[1];
        return `${indent}}\n${indent}else {`;
      })
      .replace(rules6, (...p) => {
        const indent = p[1];
        const keyword = p[2];
        const condition = p[3];
        const content = p[4].trim();
        return `${indent}${keyword} (${condition}) {\n${indent}\t${content}\n${indent}}`;
      })
      .replace(rules7, (...p) => {
        const indent = p[1];
        const content = p[2].trim();
        return `${indent}}\n${indent}else {\n${indent}\t${content}\n${indent}}`;
      })
      .replace(rules8, (...p) => (
        '{\n'
      ))
      .replace(rules9, (...p) => (
        `\n${p[1]}}`
      ))
      .replace(rules10, (...p) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}${p[7]}${p[8]}`
      ))
      .value();

    return (
      fileExt === "xml" || fileExt === "json" || fileExt === "sql"
        ? (fnLogger(fileExt, "ifElse", "N"), contentsParam)
        : (fnLogger(fileExt, "ifElse", "Y"), finalResult)
    );
  }
  catch (err: any) {
    fnLogger(fileExt, "ifElse", "E", err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const tryCatch = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    // 1. try { 포맷
    const rules1 = (
      /\btry\s*\{/gm
    );

    // 2. catch( => catch (
    const rules2 = (
      /\bcatch\s*\(/gm
    );

    // 3. } catch => }\ncatch (같은 줄에 있는 경우)
    const rules3 = (
      /^(\s*)\}\s*(catch)\s*\(/gm
    );

    // 4. } finally => }\nfinally (같은 줄에 있는 경우)
    const rules4 = (
      /^(\s*)\}\s*(finally)\s*\{/gm
    );

    // 5. { 뒤의 불필요한 빈 줄 제거
    const rules5 = (
      /\{\s*\n+/gm
    );

    // 6. } 앞의 불필요한 빈 줄 제거
    const rules6 = (
      /\n+(\s*)\}/gm
    );

    // 7. } 다음 catch 줄나눔 1개로 통합
    const rules7 = (
      /(^\s*)(\})(\s*)(\n+)(\s*)(catch)/gm
    );

    // 8. } 다음 finally 줄나눔 1개로 통합
    const rules8 = (
      /(^\s*)(\})(\s*)(\n+)(\s*)(finally)/gm
    );

    // 9. } 뒤의 여러 줄바꿈을 하나로 통합 (catch, finally 제외)
    const rules9 = (
      /\}\n\n+/gm
    );

    const finalResult = lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        'try {'
      ))
      .replace(rules2, (...p) => (
        'catch ('
      ))
      .replace(rules3, (...p) => {
        const indent = p[1];
        return `${indent}}\n${indent}catch (`;
      })
      .replace(rules4, (...p) => {
        const indent = p[1];
        return `${indent}}\n${indent}finally {`;
      })
      .replace(rules5, (...p) => (
        '{\n'
      ))
      .replace(rules6, (...p) => (
        `\n${p[1]}}`
      ))
      .replace(rules7, (...p) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}`
      ))
      .replace(rules8, (...p) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}`
      ))
      .replace(rules9, (...p) => (
        '}\n'
      ))
      .value();

    return (
      fileExt === "xml" || fileExt === "json" || fileExt === "sql"
        ? (fnLogger(fileExt, "tryCatch", "N"), contentsParam)
        : (fnLogger(fileExt, "tryCatch", "Y"), finalResult)
    );
  }
  catch (err: any) {
    fnLogger(fileExt, "tryCatch", "E", err.message);
    return contentsParam;
  }
};