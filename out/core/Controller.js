"use strict";
// Controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogic = exports.getSyntax = exports.getLanguage = exports.getCommon = void 0;
const Common_js_1 = require("../rules/utils/Common.js");
const Syntax_js_1 = require("../rules/utils/Syntax.js");
const Logic_js_1 = require("../rules/utils/Logic.js");
// -------------------------------------------------------------------------------------------------
const getCommon = async (confParam, initContents, fileName, fileExt) => {
    let resultContents = initContents;
    if (confParam.RemoveComments) {
        resultContents = await (0, Common_js_1.removeComments)(resultContents, fileName, fileExt);
        resultContents = await (0, Common_js_1.singleTags)(resultContents, fileName, fileExt);
    }
    else {
        resultContents = await (0, Common_js_1.singleTags)(resultContents, fileName, fileExt);
    }
    return resultContents;
};
exports.getCommon = getCommon;
// -------------------------------------------------------------------------------------------------
const getLanguage = async (confParam, afterCommonContents, fileName, fileExt) => {
    // 동적으로 언어별 규칙 모듈 import (html -> Html)
    const langRules = await import(`../rules/langs/${fileExt.charAt(0).toUpperCase() + fileExt.slice(1)}.js`);
    let resultContents = afterCommonContents;
    if (confParam.ActivateLint) {
        if (confParam.InsertLine) {
            resultContents = await langRules.prettierFormat(resultContents, fileName);
            resultContents = await langRules.insertLine(resultContents, fileName);
            resultContents = await langRules.lineBreak(resultContents, fileName);
            resultContents = await langRules.spellCheck(resultContents, fileName);
            resultContents = await langRules.space(resultContents, fileName);
        }
        else {
            resultContents = await langRules.prettierFormat(resultContents, fileName);
            resultContents = await langRules.lineBreak(resultContents, fileName);
            resultContents = await langRules.spellCheck(resultContents, fileName);
            resultContents = await langRules.space(resultContents, fileName);
        }
    }
    else {
        resultContents = resultContents;
    }
    return resultContents;
};
exports.getLanguage = getLanguage;
// -------------------------------------------------------------------------------------------------
const getSyntax = async (confParam, afterLanguageContents, fileName) => {
    let resultContents = afterLanguageContents;
    if (confParam.ActivateLint) {
        resultContents = await (0, Syntax_js_1.brackets)(resultContents, fileName);
    }
    else {
        resultContents = resultContents;
    }
    return resultContents;
};
exports.getSyntax = getSyntax;
// -------------------------------------------------------------------------------------------------
const getLogic = async (confParam, afterSyntaxContents, fileName) => {
    let resultContents = afterSyntaxContents;
    if (confParam.ActivateLint) {
        resultContents = await (0, Logic_js_1.ifElse)(resultContents, fileName);
        resultContents = await (0, Logic_js_1.tryCatch)(resultContents, fileName);
    }
    else {
        resultContents = resultContents;
    }
    return resultContents;
};
exports.getLogic = getLogic;
