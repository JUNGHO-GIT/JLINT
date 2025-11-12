// Controller.ts

import { capitalize, singleTags, semicolon, ifElse, tryCatch } from "@exportRules";
import { logger, notify } from "@exportScripts";
import * as Langs from "@exportLangs";

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  activateLint: boolean,
  removeComments: boolean,
  insertLine: boolean,
  tabSize: number,
  quoteType: string
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
	(fileExt === "css" || fileExt === "scss") && (langStr = "Css");
	(fileExt === "html" || fileExt === "htm") && (langStr = "Html");
	(fileExt === "jsp" || fileExt === "jspx") && (langStr = "Jsp");
	(fileExt === "json" || fileExt === "jsonc") && (langStr = "Json");
	(fileExt === "java" || fileExt === "jav") && (langStr = "Java");
	(fileExt === "sql" || fileExt === "plsql") && (langStr = "Sql");
	(fileExt === "yaml" || fileExt === "yml") && (langStr = "Yaml");
	(fileExt === "xml" || fileExt === "mybatis") && (langStr = "Xml");
	(fileExt === "javascript" || fileExt === "js") && (langStr = "Javascript");
	(fileExt === "javascriptreact" || fileExt === "jsx") && (langStr = "Javascriptreact");
	(fileExt === "typescript" || fileExt === "ts") && (langStr = "Typescript");
	(fileExt === "typescriptreact" || fileExt === "tsx") && (langStr = "Typescriptreact");

	langStr ? (
		logger("debug", `getLanguage`, `langStr:${langStr}`)
	) : (
		notify("error", `getLanguage`, `Unsupported language: ${fileExt}`)
	);

  let resultContents = initContents ? initContents : "";
  if (!langStr) {
    return resultContents;
  }
	const langFactory = (Langs as any)[langStr];
	const langRules = (typeof langFactory === "function") ? langFactory() : langFactory;

  if (!confParam.activateLint) {
		return resultContents;
	}
	confParam.removeComments && (
		resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt)
	);
	confParam.activateLint && (
		resultContents = await langRules.prettierFormat(confParam, resultContents, fileName, fileTabSize, fileEol, fileExt)
	);
	confParam.insertLine && (
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
  if (!confParam.activateLint) {
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
  if (!confParam.activateLint) {
		return resultContents;
	}
	resultContents = await ifElse(resultContents, fileExt);
	resultContents = await tryCatch(resultContents, fileExt);

  return resultContents;
};
