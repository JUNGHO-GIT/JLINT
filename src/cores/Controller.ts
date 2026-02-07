/**
 * @file Controller.ts
 * @description Controller
 * @author Jungho
 * @since 2026-1-4
 */

import { capitalize, singleTags, semicolon, space, lineBreak } from "@exportRules";
import { ifElse, tryCatch } from "@exportRules";
import { globalRules, ternaryRules, iifeRules, langSpecificRules } from "@exportRules";
import { logger, notify } from "@exportScripts";
import { CommonType } from "@exportTypes";
import * as Langs from "@exportLangs";

// 0. 주석제거 -------------------------------------------------------------------------------------
export const getRemoveComments = async (
  contentsParam: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {
  let resultContents = contentsParam || ``;

  try {
    const langStr = (
			(fileExt === `css` || fileExt === `scss`) ? `Css`
			: (fileExt === `html` || fileExt === `htm`) ? `Html`
			: (fileExt === `jsp` || fileExt === `jspx`) ? `Jsp`
			: (fileExt === `json` || fileExt === `jsonc`) ? `Json`
			: (fileExt === `java` || fileExt === `jav`) ? `Java`
			: (fileExt === `sql` || fileExt === `plsql`) ? `Sql`
			: (fileExt === `yaml` || fileExt === `yml` || fileExt === `spring-boot-properties-yaml`) ? `Yaml`
			: (fileExt === `xml` || fileExt === `mybatis`) ? `Xml`
			: (fileExt === `javascript` || fileExt === `js`) ? `Javascript`
			: (fileExt === `javascriptreact` || fileExt === `jsx`) ? `Javascriptreact`
			: (fileExt === `typescript` || fileExt === `ts`) ? `Typescript`
			: (fileExt === `typescriptreact` || fileExt === `tsx`) ? `Typescriptreact`
			: null
    );

		langStr ? (
			logger(`debug`, `getRemoveComments - langStr:${langStr}`)
		) : (
			logger(`error`, `getRemoveComments - Unsupported language: ${fileExt}`),
			notify(`error`, `getRemoveComments - Unsupported language: ${fileExt}`)
		);

		if (langStr) {
		  const langFactory = (Langs as any)[langStr as string];
		  const langRules = typeof langFactory === `function` ? langFactory() : langFactory;
		  resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt);
		}
  }
  catch (error: unknown) {
    logger(`error`, `${fileExt}:getRemoveComments - ${(error as Error).message}`);
  }

  return resultContents;
};

// 1. 언어정보 -------------------------------------------------------------------------------------
export const getLanguage = async (
  commonParam: CommonType,
  initContents: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {

  // 동적으로 언어별 규칙 모듈 import (html -> Html)
  const langStr = (
		(fileExt === `css` || fileExt === `scss`) ? `Css`
		: (fileExt === `html` || fileExt === `htm`) ? `Html`
		: (fileExt === `jsp` || fileExt === `jspx`) ? `Jsp`
		: (fileExt === `json` || fileExt === `jsonc`) ? `Json`
		: (fileExt === `java` || fileExt === `jav`) ? `Java`
		: (fileExt === `sql` || fileExt === `plsql`) ? `Sql`
		: (fileExt === `yaml` || fileExt === `yml` || fileExt === `spring-boot-properties-yaml`) ? `Yaml`
		: (fileExt === `xml` || fileExt === `mybatis`) ? `Xml`
		: (fileExt === `javascript` || fileExt === `js`) ? `Javascript`
		: (fileExt === `javascriptreact` || fileExt === `jsx`) ? `Javascriptreact`
		: (fileExt === `typescript` || fileExt === `ts`) ? `Typescript`
		: (fileExt === `typescriptreact` || fileExt === `tsx`) ? `Typescriptreact`
		: null
  );

	langStr ? (
		logger(`debug`, `getLanguage - langStr:${langStr}`)
	) : (
		logger(`error`, `getLanguage - Unsupported language: ${fileExt}`),
		notify(`error`, `getLanguage - Unsupported language: ${fileExt}`)
	);

	let resultContents = initContents || ``;
	!langStr && (() => resultContents)();
	const langFactory = (Langs as any)[langStr as string];
	const langRules = typeof langFactory === `function` ? langFactory() : langFactory;

	if (!commonParam.activateLint) {
	  return resultContents;
	}
	commonParam.removeComments && (resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol, fileExt));
	commonParam.activateLint && (resultContents = await langRules.prettierFormat(commonParam, resultContents, fileName, fileTabSize, fileEol, fileExt));
	commonParam.insertLine && (resultContents = await langRules.insertLine(resultContents, fileExt));
	resultContents = await langRules.insertSpace(resultContents, fileExt);

	return resultContents;
};

// 2. 문법 -----------------------------------------------------------------------------------------
export const getSyntax = async (
  commonParam: CommonType,
  afterLanguageContents: string,
  fileExt: string,
) => {
  let resultContents = afterLanguageContents;
  if (!commonParam.activateLint) {
    return resultContents;
  }
  resultContents = await capitalize(resultContents, fileExt);
  resultContents = await singleTags(resultContents, fileExt);
  resultContents = await semicolon(resultContents, fileExt);
  resultContents = await space(resultContents, fileExt);
  resultContents = await lineBreak(resultContents, fileExt);

  return resultContents;
};

// 3. 로직 -----------------------------------------------------------------------------------------
export const getLogic = async (
  commonParam: CommonType,
  afterSyntaxContents: string,
  fileExt: string,
) => {
  let resultContents = afterSyntaxContents;
  if (!commonParam.activateLint) {
    return resultContents;
  }
  resultContents = await ifElse(resultContents, fileExt);
  resultContents = await tryCatch(resultContents, fileExt);

  return resultContents;
};

// 4. 최종 점검 -------------------------------------------------------------------------------------
export const getFinalCheck = async (
  commonParam: CommonType,
  afterLogicContents: string,
  fileExt: string,
) => {
  let resultContents = afterLogicContents;
  if (!commonParam.activateLint) {
    return resultContents;
  }
  resultContents = await langSpecificRules(resultContents, fileExt);
  resultContents = await globalRules(resultContents, fileExt);
  resultContents = await ternaryRules(resultContents, fileExt);
  resultContents = await iifeRules(resultContents, fileExt);

  return resultContents;
};
