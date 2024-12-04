// Controller.ts

import { brackets } from '../rules/utils/Syntax.js';
import { ifElse, tryCatch } from '../rules/utils/Logic.js';

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
  fileExt: string
) => {

  // 동적으로 언어별 규칙 모듈 import (html -> Html)
  const langRules = await import(
    `../rules/langs/${fileExt.charAt(0).toUpperCase() + fileExt.slice(1)}.js`
  );

  let resultContents = initContents;

  if (!confParam.ActivateLint) {
    resultContents = resultContents;
  }
  else {
    if (confParam.RemoveComments) {
      resultContents = await langRules.removeComments(resultContents);
    }
    if (confParam.ActivateLint) {
      resultContents = await langRules.prettierFormat(resultContents, fileName);
    }
    if (confParam.InsertLine) {
      resultContents = await langRules.insertLine(resultContents);
    }
    resultContents = await langRules.lineBreak(resultContents);
    resultContents = await langRules.insertSpace(resultContents);
    resultContents = await langRules.finalCheck(resultContents);
  }

  return resultContents;
}

// -------------------------------------------------------------------------------------------------
export const getSyntax = async (
  confParam: ConfProps,
  afterLanguageContents: string,
  fileExt: string
) => {

  let resultContents = afterLanguageContents;

  if (confParam.ActivateLint) {
    resultContents = await brackets(resultContents, fileExt);
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