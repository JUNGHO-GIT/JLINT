// Controller.ts

import { capitalize, singleTags, brackets, comma, semicolon, quotes } from "../utils/Syntax";
import { ifElse, tryCatch } from "../utils/Logic";
import { fnLogger } from "../assets/scripts/utils";

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  ActivateLint: boolean,
  RemoveComments: boolean,
  InsertLine: boolean
};

// -------------------------------------------------------------------------------------------------
export const getLanguage = async (
  confParam: ConfProps,
  initContents: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
	fileExt: string
) => {

  // 동적으로 언어별 규칙 모듈 import (html -> Html)
  let langStr: string | null = null;
	(fileExt === "css") && (langStr = "Css");
	(fileExt === "html") && (langStr = "Html");
	(fileExt === "jsp") && (langStr = "Jsp");
	(fileExt === "json") && (langStr = "Json");
	(fileExt === "java") && (langStr = "Java");
	(fileExt === "sql") && (langStr = "Sql");
	(fileExt === "yaml" || fileExt === "yml") && (langStr = "Yaml");
	(fileExt === "xml" || fileExt === "mybatis") && (langStr = "Xml");
	(fileExt === "javascript") && (langStr = "Javascript");
	(fileExt === "javascriptreact") && (langStr = "Javascriptreact");
	(fileExt === "typescript") && (langStr = "Typescript");
	(fileExt === "typescriptreact") && (langStr = "Typescriptreact");

	langStr ? (
		fnLogger(fileExt, "getLanguage", "M", `langStr: ${langStr}`)
	) : (
		fnLogger(fileExt, "getLanguage", "E", `Unsupported language: ${fileExt}`)
	);

  let langRules = await import(`../langs/${langStr}.js`);
  let resultContents = initContents;
  if (!confParam.ActivateLint) {
		return resultContents;
	}
	confParam.RemoveComments && (
		resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt)
	);
	confParam.ActivateLint && (
		resultContents = await langRules.prettierFormat(resultContents, fileName, fileTabSize, fileEol, fileExt)
	);
	confParam.InsertLine && (
		resultContents = await langRules.insertLine(resultContents, fileExt)
	);
	resultContents = await langRules.insertSpace(resultContents, fileExt);
	resultContents = await langRules.lineBreak(resultContents, fileExt);
	resultContents = await langRules.finalCheck(resultContents, fileExt);

  return resultContents;
}

// -------------------------------------------------------------------------------------------------
export const getSyntax = async (
  confParam: ConfProps,
  afterLanguageContents: string,
  fileExt: string
) => {

  let resultContents = afterLanguageContents;
  if (!confParam.ActivateLint) {
		return resultContents;
	}
	resultContents = await capitalize(resultContents, fileExt);
	resultContents = await singleTags(resultContents, fileExt);
	resultContents = await semicolon(resultContents, fileExt);
	// resultContents = await brackets(resultContents, fileExt);
	// resultContents = await comma(resultContents, fileExt);
	// resultContents = await quotes(afterLanguageContents, fileExt);

  return resultContents;
};

// -------------------------------------------------------------------------------------------------
export const getLogic = async (
  confParam: ConfProps,
  afterSyntaxContents: string,
  fileExt: string
) => {

  let resultContents = afterSyntaxContents;
  if (!confParam.ActivateLint) {
		return resultContents;
	}
	resultContents = await ifElse(resultContents, fileExt);
	resultContents = await tryCatch(resultContents, fileExt);

  return resultContents;
};
