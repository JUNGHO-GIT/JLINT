// rules/Logic.ts

import { lodash } from "@exportLibs";
import { logger } from "@exportScripts";

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

    // 3. } 뒤의 여러 줄바꿈을 하나로 통합 (CRLF 대응, 다음 줄 들여쓰기 보존)
    const rules3 = (
      /\}\r?\n+([^\S\r\n]*)/gm
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

    // 8. { 뒤의 불필요한 빈 줄 제거 (CRLF 대응)
    const rules8 = (
      /\{[^\S\r\n]*\r?\n+/gm
    );

    // 9. } 앞의 불필요한 빈 줄 제거 (CRLF 대응, 이전 줄 들여쓰기 보존)
    const rules9 = (
      /(\r?\n)+([^\S\r\n]*)\}/gm
    );

    // 10. } 다음 else 줄나눔 1개로 통합 (CRLF 대응)
    const rules10 = (
      /(^\s*)(\})(\s*)(\r?\n*)(\s*)(else.*)(\s*)(\{)/gm
    );

    // 11. } 와 else 사이의 과도한 빈 줄 제거 (CRLF 대응, else if 제외)
    const rules11 = (
      /(^([\s]*)\})(?:\r?\n){2,}[^\S\r\n]*(else)([^\S\r\n]*)\{/gm
    );

    const finalResult = lodash.chain(contentsParam)
      .replace(rules1, (...p: any[]) => (
        'if ('
      ))
      .replace(rules2, (...p: any[]) => (
        'else if ('
      ))
      .replace(rules3, (...p: any[]) => (
        `}\n${p[1]}`
      ))
      .replace(rules4, (...p: any[]) => {
        const indent = p[1];
        const keyword = p[2];
        const condition = p[3];
        return `${indent}}\n${indent}${keyword} (${condition}) {`;
      })
      .replace(rules5, (...p: any[]) => {
        const indent = p[1];
        return `${indent}}\n${indent}else {`;
      })
      .replace(rules6, (...p: any[]) => {
        const indent = p[1];
        const keyword = p[2];
        const condition = p[3];
        const content = p[4].trim();
        return `${indent}${keyword} (${condition}) {\n${indent}\t${content}\n${indent}}`;
      })
      .replace(rules7, (...p: any[]) => {
        const indent = p[1];
        const content = p[2].trim();
        return `${indent}}\n${indent}else {\n${indent}\t${content}\n${indent}}`;
      })
      .replace(rules8, (...p: any[]) => (
        '{\n'
      ))
      .replace(rules9, (...p: any[]) => (
        `\n${p[2]}}`
      ))
      .replace(rules10, (...p: any[]) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}${p[7]}${p[8]}`
      ))
      .replace(rules11, (...p: any[]) => (
        `${p[2]}}\n${p[2]}else {`
      ))
      .value();

    return (
      fileExt === "xml" || fileExt === "json" || fileExt === "sql"
      ? (logger("debug", `${fileExt}:ifElse - N`), contentsParam)
      : (logger("debug", `${fileExt}:ifElse - Y`), finalResult)
    );
  }
  catch (err: any) {
    logger("error", `${fileExt}:ifElse - ${err.message}`);
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

    // 5. { 뒤의 불필요한 빈 줄 제거 (CRLF 대응)
    const rules5 = (
      /\{[^\S\r\n]*\r?\n+/gm
    );

    // 6. } 앞의 불필요한 빈 줄 제거 (CRLF 대응, 이전 줄 들여쓰기 보존)
    const rules6 = (
      /(\r?\n)+([^\S\r\n]*)\}/gm
    );

    // 7. } 다음 catch 줄나눔 1개로 통합 (CRLF 대응)
    const rules7 = (
      /(^\s*)(\})(\s*)(\r?\n+)(\s*)(catch)/gm
    );

    // 8. } 다음 finally 줄나눔 1개로 통합 (CRLF 대응)
    const rules8 = (
      /(^\s*)(\})(\s*)(\r?\n+)(\s*)(finally)/gm
    );

    // 9. } 뒤의 여러 줄바꿈을 하나로 통합 (CRLF 대응, catch/finally 제외 의도)
    const rules9 = (
      /\}\r?\n\r?\n+/gm
    );

    const finalResult = lodash.chain(contentsParam)
      .replace(rules1, (...p: any[]) => (
        'try {'
      ))
      .replace(rules2, (...p: any[]) => (
        'catch ('
      ))
      .replace(rules3, (...p: any[]) => {
        const indent = p[1];
        return `${indent}}\n${indent}catch (`;
      })
      .replace(rules4, (...p: any[]) => {
        const indent = p[1];
        return `${indent}}\n${indent}finally {`;
      })
      .replace(rules5, (...p: any[]) => (
        '{\n'
      ))
      .replace(rules6, (...p: any[]) => (
        `\n${p[2]}}`
      ))
      .replace(rules7, (...p: any[]) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}`
      ))
      .replace(rules8, (...p: any[]) => (
        `${p[1]}${p[2]}\n${p[1]}${p[6]}`
      ))
      .replace(rules9, (...p: any[]) => (
        '}\n'
      ))
      .value();

    return (
      fileExt === "xml" || fileExt === "json" || fileExt === "sql"
      ? (logger("debug", `${fileExt}:tryCatch - N`), contentsParam)
      : (logger("debug", `${fileExt}:tryCatch - Y`), finalResult)
    );
  }
  catch (err: any) {
    logger("error", `${fileExt}:tryCatch - ${err.message}`);
    return contentsParam;
  }
};