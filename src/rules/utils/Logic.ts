// Logic.ts

import lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const ifElse = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {

    const rules1 = (
      /(\b)(if)(\()/gm
    );
    const rules2 = (
      /(.*?)(?<=\})(\s*)(\n*)(\s*)(else if)(\s*)(\(?)(?:\s*)(.*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)(.*?)(\s*)(\})/gm
    );
    const rules3 = (
      /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)(.*?)(\s*)(\})/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        `${p[2]} (`
      ))
      .replace(rules2, (...p) => {
        const indentSize1 = p[1].length - `}`.length;
        const indentSize2 = p[13].length - `}`.length;
        const spaceSize = indentSize1 ===-1 ? indentSize2 : indentSize1;
        const insertSize = (" ").repeat(spaceSize);

        return `${p[1]}\n${insertSize}else if (${p[8]}) {\n${insertSize}\t${p[12]}\n${insertSize}}`;
      })
      .replace(rules3, (...p) => {
        const indentSize1 = p[1].length - `}`.length;
        const indentSize2 = p[9].length - `}`.length;
        const spaceSize = indentSize1 == -1 ? indentSize2 : indentSize1;
        const insertSize = " ".repeat(spaceSize);
        return `${p[1]}\n${insertSize}else {\n${insertSize}\t${p[8]}\n${insertSize}}`;
      })
      .value()
    );

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'ifElse' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'ifElse' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const tryCatch = async (
  contentsParam: string,
  fileExt: string,
) => {
  try {
    const rules1 = (
      /(\s*)(try)(\s*)(\{)(\s*)/gm
    );
    const rules2 = (
      /(\s*)(.*?)(?<=\})(\s*)(catch)(\s*)/gm
    );
    const rules3 = (
      /(\s*)(.*?)(?<=\})(\s*)(finally)(\s*)/gm
    );

    const finalResult = (
      lodash.chain(contentsParam)
      .replace(rules1, (...p) => (
        `${p[1]}try {${p[5]}`
      ))
      .replace(rules2, (...p) => (
        `${p[1]}${p[2]}\n${p[1]}catch`
      ))
      .replace(rules3, (...p) => (
        `${p[1]}${p[2]}\n${p[1]}${p[4]}`
      ))
      .value()
    );

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'tryCatch' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'tryCatch' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};