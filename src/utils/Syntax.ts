// Syntax.ts

import lodash from "lodash";
import { fnLogger } from "@scripts/utils";

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

    return (
      fileExt !== "xml" && fileExt !== "sql"
			? (fnLogger(fileExt, "capitalize", "N"), contentsParam)
			: (fnLogger(fileExt, "capitalize", "Y"), finalResult)
    );
  }
	catch (err: any) {
		fnLogger(fileExt, "capitalize", "E", err.message);
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

		fnLogger(fileExt, "singleTags", "Y");
    return finalResult;
  }
  catch (err: any) {
		fnLogger(fileExt, "singleTags", "E", err.message);
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

		fnLogger(fileExt, "brackets", "Y");
    return finalResult;
  }
  catch (err: any) {
    fnLogger(fileExt, "brackets", "E", err.message);
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

		fnLogger(fileExt, "comma", "Y");
    return finalResult;
  }
  catch (err: any) {
    fnLogger(fileExt, "comma", "E", err.message);
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
			/(\s*)(return)(\s*)([;])/gm
		);

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[1]}${p[2]};`
		))
		.value();

		fnLogger(fileExt, "semicolon", "Y");
    return finalResult;
  }
  catch (err: any) {
    fnLogger(fileExt, "semicolon", "E", err.message);
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

		fnLogger(fileExt, "quotes", "Y");
    return finalResult;
  }
  catch (err: any) {
    fnLogger(fileExt, "quotes", "E", err.message);
    return contentsParam;
  }
};