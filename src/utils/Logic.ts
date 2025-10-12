// Logic.ts

import lodash from "lodash";
import { fnLogger } from "@scripts/utils";

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
      /(.*?)(?<=\})(\s*)(\n*)(\s*)(if|else if)(\s*)(\(?)(?:\s*)(.*?)(\s*)(?:\))(\s*)(\{?)(?:\s*)(.*?)(\s*)(\})/gm
    );
    const rules3 = (
      /(.*?)(?<=\})(\s*)(\n*)(\s*)(else(?!\s*if))(\s*)(\{?)(?:\s*)(.*?)(\s*)(\})/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => (
			`${p[2]} (`
		))
		.replace(rules2, (...p) => {
			const baseIndent = p[1].match(/^(.*?)\}$/)?.[1] || '';
			return `${p[1]}\n${baseIndent}${p[5]} (${p[8]}) {\n${baseIndent}\t${p[12]}\n${baseIndent}}`;
		})
		.replace(rules3, (...p) => {
			const baseIndent = p[1].match(/^(.*?)\}$/)?.[1] || '';
			return `${p[1]}\n${baseIndent}${p[5]} {\n${baseIndent}\t${p[8]}\n${baseIndent}}`;
		})
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
    const rules1 = (
      /(\s*)(try)(\s*)(\{)(\s*)/gm
    );
    const rules2 = (
      /(\s*)(.*?)(?<=\})(\s*)(catch)(\s*)/gm
    );
    const rules3 = (
      /(\s*)(.*?)(?<=\})(\s*)(finally)(\s*)/gm
    );

    const finalResult = lodash.chain(contentsParam)
		.replace(rules1, (...p) => {
			const leadingMatch = p[1].match(/^(\s*)/);
			const insertSize = leadingMatch ? leadingMatch[1] : "";
			return `${insertSize}try {${p[5]}`;
		})
		.replace(rules2, (...p) => {
			const leadingMatch = p[1].match(/^(\s*)/);
			const insertSize = leadingMatch ? leadingMatch[1] : "";
			return `${insertSize}${p[2]}\n${insertSize}catch`;
		})
		.replace(rules3, (...p) => {
			const leadingMatch = p[1].match(/^(\s*)/);
			const insertSize = leadingMatch ? leadingMatch[1] : "";
			return `${insertSize}${p[2]}\n${insertSize}${p[4]}`;
		})
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