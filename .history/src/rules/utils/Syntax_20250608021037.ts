// Syntax.ts

import * as lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const capitalize = async (
  contentsParam: string,
  fileExt: string
) => {
  try {

    const rules1 = (
      /([^</>]\b)(\s*)(select|from|where|insert|into|values|update|set|delete|join|on|create)(\s*)([^</>]\b)/gm
    );
    const rules2 = (
      /([^</>]\b)(\s*)(table|alter|drop|truncate|order by|group by|having|limit|offset|distinct)(\s*)([^</>]\b)/gm
    );
    const rules3 = (
      /([^</>]\b)(\s*)(or|not|ifnull|is|in|like|between|as|case when|then|date_format)(\s*)([^</>]\b)/gm
    );
    const rules4 = (
      /([^</>]\b)(\s*)(inner join|left join|right join|full join|outer join)(\s*)([^</>]\b)/gm
    );

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}${p3.toUpperCase()}${p4}${p5}`
    ))
    .replace(rules2, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}${p3.toUpperCase()}${p4}${p5}`
    ))
    .replace(rules3, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}${p3.toUpperCase()}${p4}${p5}`
    ))
    .replace(rules4, (_, p1, p2, p3, p4, p5) => (
      `${p1}${p2}${p3.toUpperCase()}${p4}${p5}`
    ))
    .value();

    if (fileExt !== "xml" && fileExt !== "sql") {
      console.log(`_____________________\n 'capitalize' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'capitalize' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const singleTags = async (
  contentsParam: string,
  fileExt: string
) => {
  try {

    const rules1 = (
      /(<)\b(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b(\s*)([\n\s\S]*?)(?<=[/]*[>])/gm
    );

    const result = lodash.chain(contentsParam)
    .replace(rules1, (_, p1, p2, p3, p4) => (
      `${p1}${p2}${p3}${p4} />`
    ))
    .value();

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'singleTags' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'singleTags' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const brackets = async (
  contentsParam: string,
  fileExt: string
) => {
  try {
    const rules1 = (
      /(\))(\{)/gm
    );
    const rules2 = (
      /(<)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)(\s*)([\n\s\S]*?)(\s*)(?<!=)(\/>)/gm
    );

    const result = (
      lodash.chain(contentsParam)
      .replace(rules1, (_, p1, p2) => (
        `${p1} ${p2}`
      ))
      .replace(rules2, (_, p1, p2, p3, p4, p5, p6) => (
        `${p1}${p2}${p3}${p4} />`
      ))
      .value()
    );

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'brackets' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'brackets' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const comma = async (
  contentsParam: string,
  fileExt: string
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

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'comma' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'comma' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};

// -------------------------------------------------------------------------------------------------
export const semicolon = async (
  contentsParam: string,
  fileExt: string
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

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'semicolon' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'semicolon' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
}

// -------------------------------------------------------------------------------------------------
export const quotes = async (
  contentsParam: string,
  fileExt: string
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

    if (fileExt === "xml" || fileExt === "json" || fileExt === "sql") {
      console.log(`_____________________\n 'quote' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n 'quote' Activated!`);
      return result;
    }
  }
  catch (err: any) {
    console.error(err.message);
    return contentsParam;
  }
};