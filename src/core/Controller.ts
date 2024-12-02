// Controller.ts

import { removeComments, singleTags } from '../rules/utils/Common.js';
import { brackets } from '../rules/utils/Syntax.js';
import { ifElse, tryCatch } from '../rules/utils/Logic.js';

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  ActivateLint: boolean,
  RemoveComments: boolean,
  InsertLine: boolean
};

// -------------------------------------------------------------------------------------------------
export const getCommon = async (
  confParam: ConfProps,
  initContents: string,
  fileExt: string
) => {

  let resultContents = initContents;

  if (confParam.RemoveComments) {
    resultContents = await removeComments(resultContents, fileExt);
    resultContents = await singleTags(resultContents, fileExt);
  }
  else {
    resultContents = await singleTags(resultContents, fileExt);
  }

  return resultContents;
}

// -------------------------------------------------------------------------------------------------
export const getLanguage = async (
  confParam: ConfProps,
  afterCommonContents: string,
  fileName: string,
  fileExt: string
) => {

  // 동적으로 언어별 규칙 모듈 import (html -> Html)
  const langRules = await import(
    `../rules/langs/${fileExt.charAt(0).toUpperCase() + fileExt.slice(1)}.js`
  );

  let resultContents = afterCommonContents;

  if (confParam.ActivateLint) {
    if (confParam.InsertLine) {
      resultContents = await langRules.prettierFormat(resultContents, fileName);
      resultContents = await langRules.insertLine(resultContents);
      resultContents = await langRules.lineBreak(resultContents);
      resultContents = await langRules.spellCheck(resultContents);
      resultContents = await langRules.space(resultContents);
    }
    else {
      resultContents = await langRules.prettierFormat(resultContents, fileName);
      resultContents = await langRules.lineBreak(resultContents);
      resultContents = await langRules.spellCheck(resultContents);
      resultContents = await langRules.space(resultContents);
    }
  }
  else {
    resultContents = resultContents;
  }

  return resultContents;
};

// -------------------------------------------------------------------------------------------------
export const getSyntax = async (
  confParam: ConfProps,
  afterLanguageContents: string,
) => {

  let resultContents = afterLanguageContents;

  if (confParam.ActivateLint) {
    resultContents = await brackets(resultContents);
  }
  else {
    resultContents = resultContents;
  }

  return resultContents;
};

// -------------------------------------------------------------------------------------------------
export const getLogic = async (
  confParam: ConfProps,
  afterSyntaxContents: string,
) => {

  let resultContents = afterSyntaxContents;

  if (confParam.ActivateLint) {
    resultContents = await ifElse(resultContents);
    resultContents = await tryCatch(resultContents);
  }
  else {
    resultContents = resultContents;
  }

  return resultContents;
};