/**
 * @file Controller.ts
 * @description 언어 라우팅과 공통 규칙 파이프라인
 * @author Jungho
 * @since 2026-1-4
 */

import * as Langs from "@exportLangs";
import {
	capitalize,
	globalRules,
	ifElse,
	iifeRules,
	langSpecificRules as lngSpcfRls,
	lineBreak,
	semicolon,
	singleTags,
	space,
	ternaryRules,
	tryCatch,
} from "@exportRules";
import { logger, notify } from "@exportScripts";
import type { CommonType, LanguageName, LanguageRules as LangRls } from "@exportTypes";

// 0. 언어 규칙 맵 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
const LANG_RLS: Record<LanguageName, LangRls> = {
	Css: Langs.Css,
	Html: Langs.Html,
	Java: Langs.Java,
	Javascript: Langs.Javascript,
	Javascriptreact: Langs.Javascriptreact,
	Json: Langs.Json,
	Jsp: Langs.Jsp,
	Sql: Langs.Sql,
	Typescript: Langs.Typescript,
	Typescriptreact: Langs.Typescriptreact,
	Xml: Langs.Xml,
	Yaml: Langs.Yaml,
};

const LNBFE: Record<string, LanguageName> = {
	css: `Css`,
	htm: `Html`,
	html: `Html`,
	jav: `Java`,
	java: `Java`,
	javascript: `Javascript`,
	javascriptreact: `Javascriptreact`,
	"spring-boot-properties-yaml": `Yaml`,
	js: `Javascript`,
	json: `Json`,
	jsonc: `Json`,
	jsp: `Jsp`,
	jspx: `Jsp`,
	jsx: `Javascriptreact`,
	mybatis: `Xml`,
	plsql: `Sql`,
	scss: `Css`,
	sql: `Sql`,
	ts: `Typescript`,
	tsx: `Typescriptreact`,
	typescript: `Typescript`,
	typescriptreact: `Typescriptreact`,
	xml: `Xml`,
	yaml: `Yaml`,
	yml: `Yaml`,
};

// 1. 언어 규칙 해석 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
const rslvLangRls = async (
	fileExt: string,
	caller: string,
): Promise<LangRls | null> => {
	let langRls: LangRls | null = null;
	const languageName = LNBFE[fileExt] ?? null;

	if (languageName) {
		logger(`debug`, `${caller} - langStr:${languageName}`);
		langRls = LANG_RLS[languageName];
	}
	else {
		const message = `${caller} - Unsupported language: ${fileExt}`;
		logger(`error`, message);
		await notify(`error`, message);
	}

	return langRls;
};

// 2. 주석제거 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const gtRmvCmts = async (
	cntnPrm: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let resCntn = cntnPrm || ``;

	try {
		const langRls = await rslvLangRls(fileExt, `getRemoveComments`);

		if (langRls) {
			resCntn = await langRls.removeComments(
				resCntn,
				fileTabSize,
				fileEol,
				fileExt,
			);
		}
	}
	catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger(
			`error`,
			`${fileExt}:getRemoveComments - ${message}`,
		);
	}

	return resCntn;
};

// 3. 언어정보 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const getLanguage = async (
	commonParam: CommonType,
	initContents: string,
	frmtTgtPth: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let resCntn = initContents || ``;

	try {
		const langRls = await rslvLangRls(fileExt, `getLanguage`);

		if (langRls && commonParam.activateLint) {
			if (commonParam.removeComments) {
				resCntn = await langRls.removeComments(
					resCntn,
					fileTabSize,
					fileEol,
					fileExt,
				);
			}
			resCntn = await langRls.prettierFormat(
				commonParam,
				resCntn,
				frmtTgtPth,
				fileTabSize,
				fileEol,
				fileExt,
			);
			if (commonParam.insertLine) {
				resCntn = await langRls.insertLine(resCntn, fileExt);
			}
			resCntn = await langRls.insertSpace(resCntn, fileExt);
		}
	}
	catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger(`error`, `${fileExt}:getLanguage - ${message}`);
	}

	return resCntn;
};

// 4. 문법 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const getSyntax = async (
	commonParam: CommonType,
	aftrLangCntn: string,
	fileExt: string,
) => {
	let resCntn = aftrLangCntn;
	if (!commonParam.activateLint) {
		return resCntn;
	}
	resCntn = await capitalize(resCntn, fileExt);
	resCntn = await singleTags(resCntn, fileExt);
	resCntn = await semicolon(resCntn, fileExt);
	resCntn = await space(resCntn, fileExt);
	resCntn = await lineBreak(resCntn, fileExt);

	return resCntn;
};

// 5. 로직 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
export const getLogic = async (
	commonParam: CommonType,
	aftrSyntCntn: string,
	fileExt: string,
) => {
	let resCntn = aftrSyntCntn;
	if (!commonParam.activateLint) {
		return resCntn;
	}
	resCntn = await ifElse(resCntn, fileExt);
	resCntn = await tryCatch(resCntn, fileExt);

	return resCntn;
};

// 6. 최종 점검 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const gtFnlChck = async (
	commonParam: CommonType,
	aftrLgcCntn: string,
	fileExt: string,
) => {
	let resCntn = aftrLgcCntn;
	if (!commonParam.activateLint) {
		return resCntn;
	}
	resCntn = await lngSpcfRls(resCntn, fileExt);
	resCntn = await globalRules(resCntn, fileExt);
	resCntn = await ternaryRules(resCntn, fileExt);
	resCntn = await iifeRules(resCntn, fileExt);

	return resCntn;
};
