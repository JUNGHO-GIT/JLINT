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

  // 언어별 규칙 모듈 매핑
	const langStr = (
		(fileExt === "css" || fileExt === "scss") ? "Css" :
		(fileExt === "html" || fileExt === "htm") ? "Html" :
		(fileExt === "jsp" || fileExt === "jspx") ? "Jsp" :
		(fileExt === "json" || fileExt === "jsonc") ? "Json" :
		(fileExt === "java" || fileExt === "jav") ? "Java" :
		(fileExt === "sql" || fileExt === "plsql") ? "Sql" :
		(fileExt === "yaml" || fileExt === "yml" || fileExt === "spring-boot-properties-yaml") ? "Yaml" :
		(fileExt === "xml" || fileExt === "mybatis") ? "Xml" :
		(fileExt === "javascript" || fileExt === "js") ? "Javascript" :
		(fileExt === "javascriptreact" || fileExt === "jsx") ? "Javascriptreact" :
		(fileExt === "typescript" || fileExt === "ts") ? "Typescript" :
		(fileExt === "typescriptreact" || fileExt === "tsx") ? "Typescriptreact" :
		null
	);

	langStr ? (
		logger("debug", `getLanguage`, `langStr:${langStr}`)
	) : (
		logger("error", `getLanguage`, `Unsupported language: ${fileExt}`),
		notify("error", `getLanguage`, `Unsupported language: ${fileExt}`)
	);

  let resultContents = initContents ? initContents : "";
  if (!langStr) {
    return resultContents;
  }

	const langRules = Langs[langStr as keyof typeof Langs] as any;

  if (!confParam.activateLint) {
		return resultContents;
	}
	confParam.removeComments && langRules.removeComments && (
		resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt)
	);
	confParam.activateLint && langRules.prettierFormat && (
		resultContents = await langRules.prettierFormat(confParam, resultContents, fileName, fileTabSize, fileEol, fileExt)
	);
	confParam.insertLine && langRules.insertLine && (
		resultContents = await langRules.insertLine(resultContents, fileExt)
	);
	langRules.insertSpace && (
		resultContents = await langRules.insertSpace(resultContents, fileExt)
	);
	langRules.lineBreak && (
		resultContents = await langRules.lineBreak(resultContents, fileExt)
	);
	langRules.finalCheck && (
		resultContents = await langRules.finalCheck(resultContents, fileExt)
	);

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
