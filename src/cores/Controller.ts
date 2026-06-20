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
	lineBreak,
	langSpecificRules,
	semicolon,
	singleTags,
	space,
	ternaryRules,
	tryCatch,
} from "@exportRules";
import { logger, notify } from "@exportScripts";
import type { CommonType, LanguageRules, LanguageName } from "@exportTypes";

// 0. 언어 규칙 맵 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
const LANGUAGE_RULES: Record<LanguageName, LanguageRules> = {
	Css: Langs.Css,
	Html: Langs.Html,
	Java: Langs.Java,
	Javascript: Langs.Javascript,
	Javascriptreact: Langs.Javascriptreact,
	Json: Langs.Json,
	Jsp: Langs.Jsp,
	Python: Langs.Python,
	Rust: Langs.Rust,
	Sql: Langs.Sql,
	Typescript: Langs.Typescript,
	Typescriptreact: Langs.Typescriptreact,
	Xml: Langs.Xml,
	Yaml: Langs.Yaml,
};

const LANGUAGE_BY_EXT: Record<string, LanguageName> = {
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
	py: `Python`,
	python: `Python`,
	rs: `Rust`,
	rust: `Rust`,
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

// 1. 언어 규칙 해석 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
const resolveLanguageRules = async (
	fileExt: string,
	caller: string,
): Promise<LanguageRules | null> => {
	let languageRules: LanguageRules | null = null;
	const languageName = LANGUAGE_BY_EXT[fileExt] ?? null;

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

// 2. 주석제거 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getRemoveComments = async (
	contents: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let result = contents || ``;

	try {
		const languageRules = await resolveLanguageRules(fileExt, `getRemoveComments`);

		if (languageRules) {
			result = await languageRules.removeComments(
				result,
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

	return result;
};

// 3. 언어정보 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getLanguage = async (
	commonParam: CommonType,
	initContents: string,
	filePath: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	let result = initContents || ``;

	try {
		const languageRules = await resolveLanguageRules(fileExt, `getLanguage`);

		if (languageRules && commonParam.activateLint) {
			if (commonParam.removeComments) {
				result = await languageRules.removeComments(
					result,
					fileTabSize,
					fileEol,
					fileExt,
				);
			}
			result = await languageRules.prettierFormat(
				commonParam,
				result,
				filePath,
				fileTabSize,
				fileEol,
				fileExt,
			);
			if (commonParam.insertLine) {
				result = await languageRules.insertLine(result, fileExt);
			}
			result = await languageRules.insertSpace(result, fileExt);
		}
	}
	catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger(`error`, `${fileExt}:getLanguage - ${message}`);
	}

	return result;
};

// 4. 문법 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getSyntax = async (
	commonParam: CommonType,
	contents: string,
	fileExt: string,
) => {
	let result = contents;
	if (!commonParam.activateLint) {
		return result;
	}
	result = await capitalize(result, fileExt);
	result = await singleTags(result, fileExt);
	result = await semicolon(result, fileExt);
	result = await space(result, fileExt);
	result = await lineBreak(result, fileExt);

	return result;
};

// 5. 로직 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getLogic = async (
	commonParam: CommonType,
	contents: string,
	fileExt: string,
) => {
	let result = contents;
	if (!commonParam.activateLint) {
		return result;
	}
	result = await ifElse(result, fileExt);
	result = await tryCatch(result, fileExt);

	return result;
};

// 6. 최종 점검 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const getFinalCheck = async (
	commonParam: CommonType,
	contents: string,
	fileExt: string,
) => {
	let result = contents;
	if (!commonParam.activateLint) {
		return result;
	}
	result = await langSpecificRules(result, fileExt);
	result = await globalRules(result, fileExt);
	result = await ternaryRules(result, fileExt);
	result = await iifeRules(result, fileExt);

	return result;
};
