// Syntax.ts

import * as lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const brackets = async (
  contentsParam: string,
  fileName: string,
) => {
  try {
    const rules1 = /(\))(\{)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2) => {
      return `${p1} ${p2}`;
    })
    .value();

    console.log(`_____________________\n brackets Activated! ('${fileName}')`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const comma = async (
  contentsParam: string,
  fileName: string,
) => {
  try {
    const rules1 = /(\s*)(,)(\s*)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3) => {
      return `${p2} `;
    })
    .value();

    console.log(`_____________________\n comma Activated! ('${fileName}')`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const semicolon = async (
  contentsParam: string,
  fileName: string,
) => {
  try {
    const rules1
    = /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm;
    const rules2
    = /(&nbsp;)(\n+)(&nbsp;)/gm;
    const rules3
    = /(&lt;)(\n+)(&lt;)/gm;
    const rules4
    = /(;)(\n*)(\s*)(charset)/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4, p5) => {
      return `${p1}${p2}${p4}\n${p1}${p5}`;
    })
    .replace(rules2, (_, p1, p2, p3) => {
      return `${p1}${p3}`;
    })
    .replace(rules3, (_, p1, p2, p3) => {
      return `${p1}${p3}`;
    })
    .replace(rules4, (_, p1, p2, p3, p4) => {
      return `${p1} ${p4}`;
    })
    .value();

    console.log(`_____________________\n semicolon Activated! ('${fileName}')`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const quotes = async (
  contentsParam: string,
  fileName: string,
) => {
  try {
    const rules1
    = /(?<!(?:(?:\\['])|(?:['"'])|(?:["'"])))(\s*)(')(\s*)(?!(?:(?:\\['])|(?:['"'])|(?:["'"])))/gm;

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3) => {
      return `${p1}"${p3}`;
    })
    .value();

    console.log(`_____________________\n quote Activated! ('${fileName}')`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};