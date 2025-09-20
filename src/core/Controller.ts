// Controller.ts

import { capitalize, singleTags, brackets } from '../utils/Syntax.js';
import { comma, quotes, semicolon } from '../utils/Syntax.js';
import { ifElse, tryCatch } from '../utils/Logic.js';

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

  if (fileExt.includes("css")) {
    langStr = "Css";
  }
  else if (fileExt.includes("html")) {
    langStr = "Html";
  }
  else if (fileExt.includes("jsp")) {
    langStr = "Jsp";
  }
  else if (fileExt.includes("json")) {
    langStr = "Json";
  }
  else if (fileExt.includes("java")) {
    langStr = "Java";
  }
  else if (fileExt.includes("yaml") || fileExt.includes("yml")) {
    langStr = "Yaml";
  }
  else if (fileExt.includes("xml") || fileExt.includes("mybatis")) {
    langStr = "Xml";
  }
  else if (fileExt.includes("sql")) {
    langStr = "Sql";
  }
  else if (fileExt.includes("js") || fileExt.includes("javascript")) {
    langStr = "Javascript";
  }
  else if (fileExt.includes("jsx") || fileExt.includes("javascriptreact")) {
    langStr = "Javascriptreact";
  }
  else if (fileExt.includes("ts") || fileExt.includes("typescript")) {
    langStr = "Typescript";
  }
  else if (fileExt.includes("tsx") || fileExt.includes("typescriptreact")) {
    langStr = "Typescriptreact";
  }
	else {
    throw new Error(`Unsupported file extension: ${fileExt}`);
  }

  let langRules = await import(`../langs/${langStr}.js`);
  let resultContents = initContents;
  if (!confParam.ActivateLint) {
		return resultContents;
	}

	if (confParam.RemoveComments) {
		resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt);
	}
	if (confParam.ActivateLint) {
		resultContents = await langRules.prettierFormat(resultContents, fileName, fileTabSize, fileEol, fileExt);
	}
	if (confParam.InsertLine) {
		resultContents = await langRules.insertLine(resultContents, fileExt);
	}
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
	// resultContents = await brackets(resultContents, fileExt);
	// resultContents = await comma(resultContents, fileExt);
	// resultContents = await semicolon(resultContents, fileExt);
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

	// resultContents = await ifElse(resultContents, fileExt);
	// resultContents = await tryCatch(resultContents, fileExt);

  return resultContents;
};
