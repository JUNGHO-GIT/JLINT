// Syntax.ts

import lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const brackets = async (
  contentsParam: string,
) => {

  try {
    const rules1 = (
      /(\))(\{)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2) => (
        `${p1} ${p2}`
      ))
      .value()
    );

    console.log(`_____________________\n brackets Activated!`);
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
) => {

  try {
    const rules1 = (
      /(\s*)(,)(\s*)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3) => (
        `${p2} `
      ))
      .value()
    );

    console.log(`_____________________\n comma Activated!`);
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
) => {

  try {
    const rules1 = (
      /(^\s*)([\s\S]*?)(\s*)(;)(\s*)(?!(\n)|(\/\/)|( \/\/)|(\})|(;))(\s*)/gm
    );
    const rules2 = (
      /(&nbsp;)(\n+)(&nbsp;)/gm
    );
    const rules3 = (
      /(&lt;)(\n+)(&lt;)/gm
    );
    const rules4 = (
      /(;)(\n*)(\s*)(charset)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3, p4, p5) => (
        `${p1}${p2}${p4}\n${p1}${p5}`
      ))
      .replace(rules2, (_, p1, p2, p3) => (
        `${p1}${p3}`
      ))
      .replace(rules3, (_, p1, p2, p3) => (
        `${p1}${p3}`
      ))
      .replace(rules4, (_, p1, p2, p3, p4) => (
        `${p1} ${p4}`
      ))
      .value()
    );

    console.log(`_____________________\n semicolon Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
}

// -------------------------------------------------------------------------------------------------
export const quotes = async (
  contentsParam: string
) => {

  try {
    const rules1 = (
      /(?<!(?:(?:\\['])|(?:['"'])|(?:["'"])))(\s*)(')(\s*)(?!(?:(?:\\['])|(?:['"'])|(?:["'"])))/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2, p3) => (
        `${p1}"${p3}`
      ))
      .value()
    );

    console.log(`_____________________\n quote Activated!`);
    return result;
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};