/**
 * @file FinalCheck.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { logger } from "@exportScripts";

// 0. langSpecificRules ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const langSpecificRules = async (
  contents: string,
  fileExt: string,
) => {
  let result = contents;

  try {
    const rules1 = (
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\S\s])/gm
    );
    const rules2 = (
      /(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\S\s])/gm
    );
    const rules3 = (
      /(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\S\s])/gm
    );
    const rules4 = (
      /(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm
    );
    const rules5 = (
      /(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm
    );
    const rules6 = (
      /(^\s*)(\/{2} -+)([>-]\s*)(\s*)(\/{2} -+)([>-]\s)/gm
    );
    const rules7 = (
      /(-{27})(\n+)(\s*)(\w+)/m
    );
    const rules8 = (
      /( , )/gm
    );
    const rules9 = (
      /(\s*)(\n+)(\s*)(,)(\s*)/gm
    );
    const rules10 = (
      /([\d#$A-Za-z]+)(\s*)(=)(\s*)([\d#$A-Za-z]+)/gm
    );

    const isJsLike = (
      fileExt === `js`
			|| fileExt === `jsx`
			|| fileExt === `ts`
			|| fileExt === `tsx`
    );
    const isHtmlLike = (
      fileExt === `html`
			|| fileExt === `jsp`
    );
    const isJava = fileExt === `java`;
    const isXml = fileExt === `xml`;

    result = isJsLike ? (
			result
			.replaceAll(rules1, (...p: unknown[]) => (
			  `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
			))
		) : isHtmlLike ? (
			result
			.replaceAll(rules2, (...p: unknown[]) => (
			  `${p[1]}${p[2]}${p[3]}${p[4]}${p[11]}`
			))
		) : isJava ? (
			result
			.replaceAll(rules3, (...p: unknown[]) => (
			  `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
			))
			.replaceAll(rules4, (...p: unknown[]) => (
			  `${p[4]}${p[5]}\n${p[2]}${p[3]}\n${p[7]}${p[8]}`
			))
			.replaceAll(rules5, (...p: unknown[]) => (
			  `${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}\n${p[7]}${p[8]}`
			))
			.replaceAll(rules6, (...p: unknown[]) => (
			  `${p[1]}${p[2]}-\n`
			))
			.replace(rules7, (...p: unknown[]) => (
			  `${p[1]}\n${p[3]}${p[4]}`
			))
		) : isXml ? (
			result
			.replaceAll(rules8, () => (
			  `, `
			))
			.replaceAll(rules9, (...p: unknown[]) => (
			  `${p[1]}, `
			))
			.replaceAll(rules10, (...p: unknown[]) => (
			  `${p[1]} = ${p[5]}`
			))
		) : (
			result
		);

    logger(`debug`, `${fileExt}:langSpecificRules - Y`);
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:langSpecificRules - ${(error as Error).message}`);
    result = contents;
  }

  return result;
};

// 1. globalRules ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const globalRules = async (
  contents: string,
  fileExt: string,
) => {
  let result = contents;

  try {
    const hasGlobalTarget = /[=&|?-]/.test(result);
    const rules1 = (
      /^([^\S\n\r]*)(.*\S)[^\S\n\r]*\n[^\S\n\r]*(=)\s*(.+\S)$/gm
    );
    const rules2 = (
      /(&{2}|\|{2}|\?\?|=(?![=>]))[\t ]*\n\s*/gm
    );
    const rules3 = (
      /(\s*)(&&|\|\||\?\?|\?)(\n+)(\s*)(.*)/gm
    );
    const rules4 = (
      /(\s*)(-+)(\s*)(\n)(^\s*)(public|private|function|class)/gm
    );

    const applyGlobalRules = (
      source: string,
    ) => {
      const maxIterations = 100;
      let current = source;
      const hasGlobalRuleTarget = (
        value: string,
      ) => /\n[^\S\n\r]*=|(?:&&|\|\||\?\?|=(?![=>]))[\t ]*\n|\n\s*(?:&&|\|\||\?\?|\?)|-+\s*\n\s*(?:public|private|function|class)/m.test(value);

      for (let iter = 0; iter < maxIterations; iter += 1) {
        const prev = current;
        current = current
        .replaceAll(rules1, (...p: unknown[]) => (
          `${p[1]}${p[2]} ${p[3]} ${p[4]}`
        ))
        .replaceAll(rules2, (...p: unknown[]) => (
          `${p[1]} `
        ))
        .replaceAll(rules3, (...p: unknown[]) => (
          `${p[1]}${p[2]} ${p[5]}`
        ))
        .replaceAll(rules4, (...p: unknown[]) => (
          `${p[1]}${p[2]}\n${p[5]}${p[6]}`
        ));

        if (current === prev || !hasGlobalRuleTarget(current)) {
          break;
        }
      }

      return current;
    };

    if (hasGlobalTarget) {
      result = applyGlobalRules(result);
    }
    logger(`debug`, `${fileExt}:globalRules - Y`);
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:globalRules - ${(error as Error).message}`);
    result = contents;
  }

  return result;
};

// 2. ternaryRules ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const ternaryRules = async (
  contents: string,
  fileExt: string,
) => {
  let result = contents;

  try {
    const hasTernaryTarget = /[?&|]|^[^\S\n\r]*:/m.test(result);
    const rules1 = (
      /(^\s*.*\S)\s*\n(\s*)(\?|:|&&|\|\||\?\?)(\s+)(.*)$/gm
    );
    const rules2 = (
      /(^\s*.*\?\s*.*)\n(\s*):(\s+)(.*)$/gm
    );
    const rules3 = (
      /(\s*)(&&|\|\||\?\?|\?)(\n+)(\s*)(.*)/gm
    );

    const splitTopLevelByComma = (
      inner: string,
    ): string[] => {
      const list: string[] = [];
      let current = ``;

      let depthParen = 0;
      let depthBracket = 0;
      let depthBrace = 0;

      let inSingle = false;
      let inDouble = false;
      let inBacktick = false;
      let inLineComment = false;
      let inBlockComment = false;
      let escaping = false;

      for (let i = 0; i < inner.length; i += 1) {
        const ch = inner[i];
        const next = inner[i + 1] ?? ``;

        if (inLineComment) {
          current += ch;
          inLineComment = ch !== `\n`;
          continue;
        }
        if (inBlockComment) {
          current += ch;
          if (ch === `*` && next === `/`) {
            current += next;
            inBlockComment = false;
            i += 1;
          }
          continue;
        }
        if (escaping) {
          current += ch;
          escaping = false;
          continue;
        }
        if (inSingle) {
          current += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `'`) {
            inSingle = false;
          }
          continue;
        }
        if (inDouble) {
          current += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `"`) {
            inDouble = false;
          }
          continue;
        }
        if (inBacktick) {
          current += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `\``) {
            inBacktick = false;
          }
          continue;
        }
        if (ch === `/` && next === `/`) {
          current += ch + next;
          inLineComment = true;
          i += 1;
          continue;
        }
        if (ch === `/` && next === `*`) {
          current += ch + next;
          inBlockComment = true;
          i += 1;
          continue;
        }
        if (ch === `'`) {
          inSingle = true;
          current += ch;
          continue;
        }
        if (ch === `"`) {
          inDouble = true;
          current += ch;
          continue;
        }
        if (ch === `\``) {
          inBacktick = true;
          current += ch;
          continue;
        }
        if (ch === `(`) {
          depthParen += 1;
        }
        else if (ch === `)`) {
          depthParen = depthParen > 0 ? depthParen - 1 : 0;
        }
        else if (ch === `[`) {
          depthBracket += 1;
        }
        else if (ch === `]`) {
          depthBracket = depthBracket > 0 ? depthBracket - 1 : 0;
        }
        else if (ch === `{`) {
          depthBrace += 1;
        }
        else if (ch === `}`) {
          depthBrace = depthBrace > 0 ? depthBrace - 1 : 0;
        }
        if (ch === `,` && depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
          const trimmed = current.trim();
          if (trimmed.length > 0) {
            list.push(trimmed);
          }
          current = ``;
        }
        else {
          current += ch;
        }
      }

      const last = current.trim();
      if (last.length > 0) {
        list.push(last);
      }

      return list;
    };

    const formatTernaryParens = (
      source: string,
    ): string => {
      let out = ``;
      const n = source.length;

      let inSingle = false;
      let inDouble = false;
      let inBacktick = false;
      let inLineComment = false;
      let inBlockComment = false;
      let escaping = false;

      const findMatchingParen = (
        start: number,
      ): number => {
        let depth = 0;

        let innerSingle = false;
        let innerDouble = false;
        let innerBacktick = false;
        let innerLineComment = false;
        let innerBlockComment = false;
        let innerEscaping = false;

        for (let j = start; j < n; j += 1) {
          const ch2 = source[j];
          const next2 = source[j + 1] ?? ``;

          if (innerLineComment) {
            innerLineComment = ch2 !== `\n`;
            continue;
          }
          if (innerBlockComment) {
            if (ch2 === `*` && next2 === `/`) {
              j += 1;
              innerBlockComment = false;
            }
            continue;
          }
          if (innerEscaping) {
            innerEscaping = false;
            continue;
          }
          if (innerSingle) {
            if (ch2 === `\\`) {
              innerEscaping = true;
            }
            else if (ch2 === `'`) {
              innerSingle = false;
            }
            continue;
          }
          if (innerDouble) {
            if (ch2 === `\\`) {
              innerEscaping = true;
            }
            else if (ch2 === `"`) {
              innerDouble = false;
            }
            continue;
          }
          if (innerBacktick) {
            if (ch2 === `\\`) {
              innerEscaping = true;
            }
            else if (ch2 === `\``) {
              innerBacktick = false;
            }
            continue;
          }

          if (ch2 === `/` && next2 === `/`) {
            innerLineComment = true;
            j += 1;
            continue;
          }
          if (ch2 === `/` && next2 === `*`) {
            innerBlockComment = true;
            j += 1;
            continue;
          }
          if (ch2 === `'`) {
            innerSingle = true;
            continue;
          }
          if (ch2 === `"`) {
            innerDouble = true;
            continue;
          }
          if (ch2 === `\``) {
            innerBacktick = true;
            continue;
          }

          if (ch2 === `(`) {
            depth += 1;
          }
          else if (ch2 === `)`) {
            depth -= 1;
            if (depth === 0) {
              return j;
            }
          }
        }

        return -1;
      };

      for (let i = 0; i < n; i += 1) {
        const ch = source[i];
        const next = source[i + 1] ?? ``;

        if (inLineComment) {
          out += ch;
          inLineComment = ch !== `\n`;
          continue;
        }
        if (inBlockComment) {
          out += ch;
          if (ch === `*` && next === `/`) {
            out += next;
            inBlockComment = false;
            i += 1;
          }
          continue;
        }
        if (escaping) {
          out += ch;
          escaping = false;
          continue;
        }
        if (inSingle) {
          out += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `'`) {
            inSingle = false;
          }
          continue;
        }
        if (inDouble) {
          out += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `"`) {
            inDouble = false;
          }
          continue;
        }
        if (inBacktick) {
          out += ch;
          if (ch === `\\`) {
            escaping = true;
          }
          else if (ch === `\``) {
            inBacktick = false;
          }
          continue;
        }
        if (ch === `/` && next === `/`) {
          out += ch + next;
          inLineComment = true;
          i += 1;
          continue;
        }
        if (ch === `/` && next === `*`) {
          out += ch + next;
          inBlockComment = true;
          i += 1;
          continue;
        }
        if (ch === `'`) {
          inSingle = true;
          out += ch;
          continue;
        }
        if (ch === `"`) {
          inDouble = true;
          out += ch;
          continue;
        }
        if (ch === `\``) {
          inBacktick = true;
          out += ch;
          continue;
        }
        if (ch === `?`) {
          if (next === `?` || next === `.`) {
            out += ch;
            continue;
          }

          let j = i + 1;
          for (; j < n && /\s/u.test(source[j]); j += 1) {}

          if (j >= n || source[j] !== `(`) {
            out += ch;
            continue;
          }

          const parenStart = j;
          const closeIndex = findMatchingParen(parenStart);

          if (closeIndex === -1) {
            out += ch;
            continue;
          }

          const inner = source.slice(parenStart + 1, closeIndex);
          const expressions = splitTopLevelByComma(inner);

          if (expressions.length <= 1) {
            out += source.slice(i, closeIndex + 1);
            i = closeIndex;
            continue;
          }

          const lineStart = source.lastIndexOf(`\n`, i);
          const lineHead = lineStart === -1 ? (
						source.slice(0, i)
					) : (
						source.slice(lineStart + 1, i)
					);
          const lineIndentMatch = lineHead.match(/^(\t*)/u);
          const baseIndent = lineIndentMatch ? lineIndentMatch[1] : ``;
          const bodyIndent = `${baseIndent}\t`;

          const joined = expressions
          .map((expr) => `${bodyIndent}${expr.trim()}`)
          .join(`,\n`);

          out += `? (\n${joined}\n${baseIndent})`;
          i = closeIndex;
          continue;
        }

        out += ch;
      }

      return out;
    };

    const applyTernaryRules = (
      source: string,
    ): string => {
      const maxIterations = 100;
      let current = source;
      const hasTernaryRuleTarget = (
        value: string,
      ) => (
        /\n[^\S\n\r]*(?:\?|:|&&|\|\||\?\?)[^\S\n\r]+|\?.*\n[^\S\n\r]*:|(?:&&|\|\||\?\?|\?)\n/m.test(value)
        || (value.includes(`,`) && /\?\s*\(/m.test(value))
      );

      for (let iter = 0; iter < maxIterations; iter += 1) {
        const prev = current;

        current = current
        .replaceAll(rules1, (...p: unknown[]) => (
          `${p[1]} ${p[3]} ${p[5]}`
        ))
        .replaceAll(rules2, (...p: unknown[]) => (
          `${p[1]} : ${p[4]}`
        ))
        .replaceAll(rules3, (...p: unknown[]) => (
          `${p[1]}${p[2]} ${p[5]}`
        ));

        if (current.includes(`?`) && current.includes(`(`) && current.includes(`,`)) {
          current = formatTernaryParens(current);
        }

        if (current === prev || !hasTernaryRuleTarget(current)) {
          break;
        }
      }

      return current;
    };

    if (hasTernaryTarget) {
      result = applyTernaryRules(result);
    }
    logger(`debug`, `${fileExt}:ternaryRules - Y`);
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:ternaryRules - ${(error as Error).message}`);
    result = contents;
  }

  return result;
};

// 3. iifeRules ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const iifeRules = async (
  contents: string,
  fileExt: string,
) => {
  let result = contents;

  try {
    const hasIifeTarget = result.includes(`(()`);
    // (1) 삼항 + IIFE 한 줄로 합치기
    const rules1 = (
      /(\s*)([^\n?]+?)\n[\t ]*\?(\s*\(\(\)\s*=>\s*{[\S\s]*?}\)\(\))\n[\t ]*:(\s*\(\(\)\s*=>\s*{[\S\s]*?}\)\(\))(\s*;?)/gm
    );

    // (2) : (() => { 또는 && (() => { 내부 들여쓰기 정규화
    const rules2 = (
      /^(\t*)(.*(?:[,:?]|&&|\|\|)\s*\(\(\)\s*=>\s*{)[\t ]*\n([\S\s]*?\n)(\t*)}\)\(\);/gm
    );

    const normalizeIifeBody = (
      baseIndent: string,
      header: string,
      bodyBlock: string,
    ): string => {
      const bodyIndent = `${baseIndent}\t`;
      const lines = bodyBlock.split(`\n`).filter((line) => line.trim());

      let minIndent = Number.POSITIVE_INFINITY;
      for (const line of lines) {
        const match = line.match(/^(\t*)/u);
        const len = match ? match[1].length : 0;
        minIndent = Math.min(len , minIndent);
      }
      minIndent = Number.isFinite(minIndent) ? minIndent : 0;

      const normalized = lines.map((line) => {
        const match = line.match(/^(\t*)(.*)$/u);
        const origIndent = match ? match[1] : ``;
        const content = match ? match[2] : line;
        const relativeIndent = `\t`.repeat(origIndent.length - minIndent);
        return `${bodyIndent}${relativeIndent}${content}`;
      });

      return `${baseIndent}${header}\n${normalized.join(`\n`)}\n${baseIndent}})();`;
    };

    const applyIifeRules = (
      source: string,
    ) => {
      let current = source;

      current = current
      .replaceAll(rules1, (...p: unknown[]) => {
        const indent = p[1] as string;
        const condition = (p[2] as string).trim();
        const firstBranch = p[3] as string;
        const secondBranch = p[4] as string;
        const tail = (p[5] as string) || ``;

        return `${indent}${condition} ?${firstBranch} :${secondBranch}${tail}`;
      })
      .replaceAll(rules2, (...p: unknown[]) => {
        const baseIndent = p[1] as string;
        const header = p[2] as string;
        const bodyBlock = p[3] as string;

        return normalizeIifeBody(baseIndent, header, bodyBlock);
      });

      return current;
    };

    if (hasIifeTarget) {
      result = applyIifeRules(result);
    }
    logger(`debug`, `${fileExt}:iifeRules - Y`);
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:iifeRules - ${(error as Error).message}`);
    result = contents;
  }

  return result;
};
