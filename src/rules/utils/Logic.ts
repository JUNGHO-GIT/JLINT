// Logic.ts

import lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const ifElse = async (
  contentsParam: string,
) => {
  try {
    const rules1
    = /(\b)(if)(\()/gm;
    const rules2
    = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)([\s\S]*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;
    const rules3
    = /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)([\s\S]*?;)(\s*)(?:\})/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3) => {
      return `${p2} (`;
    })
    .replace(rules2, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13) => {
      const indentSize1 = p1.length - `}`.length;
      const indentSize2 = p13.length - `}`.length;
      const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
      const insertSize = " ".repeat(spaceSize);
      return `${p1}\n${insertSize}else if (${p8}) {\n${insertSize}\t${p12}\n${insertSize}}`;
    })
    .replace(rules3, (_, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
      const indentSize1 = p1.length - `}`.length;
      const indentSize2 = p9.length - `}`.length;
      const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
      const insertSize = " ".repeat(spaceSize);
      return `${p1}\n${insertSize}else {\n${insertSize}\t${p8}\n${insertSize}}`;
    })
    .value();

    console.log(`_____________________\n ifElse Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const tryCatch = async (
  contentsParam: string,
) => {
  try {
    const rules1
    = /(\s*)(try)(\s*)(\{)(\s*)/gm;
    const rules2
    = /(\s*)(.*?)(?<=\})(\s*)(catch)(\s*)/gm;
    const rules3
    = /(\s*)(.*?)(?<=\})(\s*)(finally)(\s*)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4, p5) => (
      `${p1}try {${p5}`
    ))
    .replace(rules2, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}\n${p1}catch`
    ))
    .replace(rules3, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}\n${p1}${p4}`
    ))
    .value();

    console.log(`_____________________\n tryCatch Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};