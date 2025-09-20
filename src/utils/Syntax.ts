// Syntax.ts

import lodash from "lodash";

// -------------------------------------------------------------------------------------------------
export const capitalize = async (
  contentsParam: string,
  fileExt: string
) => {
  try {

    const rules1 = (
      /([^</>]\b)(\s*)(select|from|where|insert|into|values|update|set|delete|on|create)\b(\s*)([^</>]\b)/gm
    );
    const rules2 = (
      /([^</>]\b)(\s*)(table|alter|drop|truncate|order by|group by|having|limit|offset|distinct)\b(\s*)([^</>]\b)/gm
    );
    const rules3 = (
      /([^</>]\b)(\s*)(or|not|ifnull|is|in|like|between|as|case when|then|date_format)\b(\s*)([^</>]\b)/gm
    );
    const rules4 = (
      /([^</>]\b)(\s*)(inner join|left join|right join|full join|outer join)\b(\s*)([^</>]\b)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
		))
		.replace(rules2, (...p) => (
			`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
		))
		.replace(rules3, (...p) => (
			`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
		))
		.replace(rules4, (...p) => (
			`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
		))
		.value();

    if (fileExt !== "xml" && fileExt !== "sql") {
      console.log(`_____________________\n [${fileExt}] 'capitalize' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'capitalize' Activated!`);
      return finalResult;
    }
  }
	catch (err: any) {
		console.error(`_____________________\n [${fileExt}] 'capitalize' Error!\n${err.message}`);
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
      /(<)\b(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b([\s\n\S]*?)([\n\s]*)([/]*[>])/gm
    );
    const rules2 = (
      /(<)\b(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b(\s*)([/]*[>])/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]}${p[2]}${p[3]}${p[4]}/>`
		))
		.replace(rules2, (...p) => (
			`${p[1]}${p[2]} />`
		))
		.value();

		if (fileExt !== "html" && fileExt !== "jsp") {
      console.log(`_____________________\n [${fileExt}] 'singleTags' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'singleTags' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
		console.error(`_____________________\n [${fileExt}] 'singleTags' Error!\n${err.message}`);
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
      /(['|"])(\s+)(>)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]} ${p[2]}`
		))
		.replace(rules2, (...p) => (
			`${p[1]}>`
		))
		.value();

		if (fileExt !== "html" && fileExt !== "jsp") {
      console.log(`_____________________\n [${fileExt}] 'brackets' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'brackets' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'brackets' Error!\n${err.message}`);
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

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[2]} `
		))
		.value();

		if (fileExt !== "html" && fileExt !== "jsp") {
      console.log(`_____________________\n [${fileExt}] 'comma' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'comma' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'comma' Error!\n${err.message}`);
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

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]}${p[2]}${p[4]}\n${p[1]}${p[5]}`
		))
		.replace(rules2, (...p) => (
			`${p[1]}${p[3]}`
		))
		.replace(rules3, (...p) => (
			`${p[1]}${p[3]}`
		))
		.replace(rules4, (...p) => (
			`${p[1]} ${p[4]}`
		))
		.value();

		if (fileExt !== "html" && fileExt !== "jsp") {
      console.log(`_____________________\n [${fileExt}] 'semicolon' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'semicolon' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'semicolon' Error!\n${err.message}`);
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

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]}"${p[3]}`
		))
		.value();

		if (fileExt !== "html" && fileExt !== "jsp") {
      console.log(`_____________________\n [${fileExt}] 'quote' Not Supported!`);
      return contentsParam;
    }
    else {
      console.log(`_____________________\n [${fileExt}] 'quote' Activated!`);
      return finalResult;
    }
  }
  catch (err: any) {
    console.error(`_____________________\n [${fileExt}] 'quote' Error!\n${err.message}`);
    return contentsParam;
  }
};