// Controller.ts

import { capitalize, singleTags, semicolon, space, finalCheck } from "@exportRules";
import { ifElse, tryCatch } from "@exportRules";
import { logger, notify } from "@exportScripts";
import { CommonType } from "@exportTypes";
import * as Langs from "@exportLangs";

// -------------------------------------------------------------------------------------------------
export const getLanguage = async (
  commonParam: CommonType,
  initContents: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
	fileExt: string
) => {

	// 동적으로 언어별 규칙 모듈 import (html -> Html)
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
		logger("debug", `getLanguage - langStr:${langStr}`)
	) : (
		logger("error", `getLanguage - Unsupported language: ${fileExt}`),
		notify("error", `getLanguage - Unsupported language: ${fileExt}`)
	);

  let resultContents = initContents ? initContents : "";
  !langStr && (() => {
    return resultContents;
  })();
	const langFactory = (Langs as any)[langStr as string];
	const langRules = (typeof langFactory === "function") ? langFactory() : langFactory;

  if (!commonParam.activateLint) {
		return resultContents;
	}
	commonParam.removeComments && (
		resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt)
	);
	commonParam.activateLint && (
		resultContents = await langRules.prettierFormat(commonParam, resultContents, fileName, fileTabSize, fileEol, fileExt)
	);
	commonParam.insertLine && (
		resultContents = await langRules.insertLine(resultContents, fileExt)
	);
	resultContents = await langRules.insertSpace(resultContents, fileExt);
	resultContents = await langRules.lineBreak(resultContents, fileExt);
	resultContents = await langRules.finalCheck(resultContents, fileExt);

  return resultContents;
}

// -------------------------------------------------------------------------------------------------
export const getLogic = async (
  commonParam: CommonType,
  afterSyntaxContents: string,
  fileExt: string
) => {

  let resultContents = afterSyntaxContents;
  if (!commonParam.activateLint) {
		return resultContents;
	}
	resultContents = await ifElse(resultContents, fileExt);
	resultContents = await tryCatch(resultContents, fileExt);

  return resultContents;
};

// -------------------------------------------------------------------------------------------------
export const getSyntax = async (
  commonParam: CommonType,
  afterLanguageContents: string,
  fileExt: string
) => {

  let resultContents = afterLanguageContents;
  if (!commonParam.activateLint) {
		return resultContents;
	}
	resultContents = await capitalize(resultContents, fileExt);
	resultContents = await singleTags(resultContents, fileExt);
	resultContents = await semicolon(resultContents, fileExt);
	resultContents = await space(resultContents, fileExt);
	resultContents = await finalCheck(resultContents, fileExt);

  return resultContents;
};
