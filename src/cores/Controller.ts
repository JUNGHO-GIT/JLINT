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
	langSpecificRules,
	lineBreak,
	semicolon,
	singleTags,
	space,
	ternaryRules,
	tryCatch,
} from "@exportRules";
import { logger, notify } from "@exportScripts";
import type { CommonType, LanguageName, LanguageRules } from "@exportTypes";

// 0. 언어 규칙 맵 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
const LANGUAGE_RULES: Record<LanguageName, LanguageRules> = {
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

const LANGUAGE_NAME_BY_FILE_EXT: Record<string, LanguageName> = {
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
const resolveLanguageRules = async (
	fileExt: string,
	caller: string,
): Promise<LanguageRules | null> => {
	let languageRules: LanguageRules | null = null;
	const languageName = LANGUAGE_NAME_BY_FILE_EXT[fileExt] ?? null;

	if (languageName) {
		logger(`debug`, `${caller} - langStr:${languageName}`);
		languageRules = LANGUAGE_RULES[languageName];
	}
	else {
		const message = `${caller} - Unsupported language: ${fileExt}`;
		logger(`error`, message);
		await notify(`error`, message);
	}

	return languageRules;
};

// 2. 주석제거 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const getRemoveComments = async (
	contentsParam: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let resultContents = contentsParam || ``;

	try {
		const languageRules = await resolveLanguageRules(fileExt, `getRemoveComments`);

		if (languageRules) {
			resultContents = await languageRules.removeComments(
				resultContents,
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

	return resultContents;
};

// 3. 언어정보 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const getLanguage = async (
	commonParam: CommonType,
	initContents: string,
	formatTargetPath: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let resultContents = initContents || ``;

	try {
		const languageRules = await resolveLanguageRules(fileExt, `getLanguage`);

		if (languageRules && commonParam.activateLint) {
			if (commonParam.removeComments) {
				resultContents = await languageRules.removeComments(
					resultContents,
					fileTabSize,
					fileEol,
					fileExt,
				);
			}
			resultContents = await languageRules.prettierFormat(
				commonParam,
				resultContents,
				formatTargetPath,
				fileTabSize,
				fileEol,
				fileExt,
			);
			if (commonParam.insertLine) {
				resultContents = await languageRules.insertLine(resultContents, fileExt);
			}
			resultContents = await languageRules.insertSpace(resultContents, fileExt);
		}
	}
	catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger(`error`, `${fileExt}:getLanguage - ${message}`);
	}

	return resultContents;
};

// 4. 문법 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
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

// 5. 로직 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
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

// 6. 최종 점검 ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
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
