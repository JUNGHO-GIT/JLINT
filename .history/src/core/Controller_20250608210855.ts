// Controller.ts

import { capitalize, singleTags, brackets } from '../rules/utils/Syntax.js';
import { comma, quotes, semicolon } from '../rules/utils/Syntax.js';
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
  fileExt: string,
  fileTabSize: number,
  fileEol: string
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
      resultContents = await langRules.removeComments(resultContents, fileTabSize, fileEol);
    }
    if (confParam.ActivateLint) {
      resultContents = await langRules.prettierFormat(resultContents, fileName, fileTabSize, fileEol);
    }
    if (confParam.InsertLine) {
      resultContents = await langRules.insertLine(resultContents);
    }
    resultContents = await langRules.insertSpace(resultContents);
    resultContents = await langRules.lineBreak(resultContents);
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
    resultContents = await capitalize(resultContents, fileExt);
    resultContents = await singleTags(resultContents, fileExt);
    resultContents = await brackets(resultContents, fileExt);
    /* resultContents = await comma(resultContents, fileExt); */
    /* resultContents = await semicolon(resultContents, fileExt); */
    /* resultContents = await quotes(afterLanguageContents, fileExt); */
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
  fileExt: string
) => {

  let resultContents = afterSyntaxContents;

  if (confParam.ActivateLint) {
    /* resultContents = await ifElse(resultContents, fileExt); */
    /* resultContents = await tryCatch(resultContents, fileExt); */
  }
  else {
    resultContents = resultContents;
  }

  return resultContents;
};