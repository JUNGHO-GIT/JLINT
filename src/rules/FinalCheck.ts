// rules/FinalCheck.ts

import { lodash } from "@exportLibs";
import { logger } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const finalCheck = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		// 공통 규칙 (언어 무관) -------------------------------------------------------------------
		const ruleJoinCondWithOp = (
			/(^\s*.*\S)\s*\n(\s*)([?]|:|&&|\|\||\?\?)(\s+)(.*)$/gm
		);
		const ruleJoinTernaryColon = (
			/(^\s*.*\?\s*.*)\n(\s*):(\s+)(.*)$/gm
		);
		const ruleAssignmentLineBreak = (
			/(\s*)(.+\S)(\s*)\n(\s*)(=)(\s*)(.+\S)/gm
		);
		const ruleOperatorTrailingNewline = (
			/([&]{2}|[|]{2}|\?\?|=(?![=>]))[ \t]*\n\s*/gm
		);
		const ruleLogicalPrefix = (
			/(\s*)([&][&]|[|][|]|\?\?|[?])(\n+)(\s*)(.*)/gm
		);
		const ruleTernaryIife = (
			/(\s*)([^\n?]+?)\n[ \t]*\?(\s*\(\(\)\s*=>\s*{[\s\S]*?}\)\(\))\n[ \t]*:(\s*\(\(\)\s*=>\s*{[\s\S]*?}\)\(\))(\s*;?)/gm
		);

		// 파일 타입별 규칙 ------------------------------------------------------------------------
		const ruleJsBlockComment = (
			/(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
		);
		const ruleHtmlBlockComment = (
			/(\s*)(<!)(--.*?)(>)(\s*)(\n)(\s*)(<!)(--.*?)(>)([\s\S])/gm
		);
		const ruleJavaBlockComment1 = (
			/(\s*)(\/\/)(\s*)(--.*?)(>)(\s*)(\n)(\s*)(\/\/)(\s*)(--.*?)(>)([\s\S])/gm
		);
		const ruleJavaBlockComment2 = (
			/(^\n*)(^\s*?)(@.*?\n.*)(\s*)(\/\/\s*--.*?>)(\n)(\s*)(.*)/gm
		);
		const ruleJavaBlockComment3 = (
			/(^\s*)(\/\/\s+--.*?>)(\n)(^\s*?)(@.*?)(\n+)(\s*)(.*)/gm
		);
		const ruleJavaBlockComment4 = (
			/(^\s*)(\/\/ [-]+)([->][\n\s]*)(\s*)(\/\/ [-]+)([->][\n\s])/gm
		);
		const ruleJavaBlockComment5 = (
			/(---------------------------)(\n+)(\s*)(\w+)/m
		);
		const ruleXmlComma1 = (
			/( , )/gm
		);
		const ruleXmlComma2 = (
			/(\s*)(\n+)(\s*)(,)(\s*)/gm
		);
		const ruleXmlEquals = (
			/([a-zA-Z0-9$#]+)(\s*)(=)(\s*)([a-zA-Z0-9$#]+)/gm
		);

		// 1. 파일 타입별 전처리 --------------------------------------------------------------------
		let finalResult;
		if (fileExt === `js` || fileExt === `jsx` || fileExt === `ts` || fileExt === `tsx`) {
			finalResult = lodash.chain(contentsParam)
				.replace(ruleJsBlockComment, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
				))
				.value();
		}
		if (fileExt === `html` || fileExt === `jsp`) {
			finalResult = lodash.chain(contentsParam)
				.replace(ruleHtmlBlockComment, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}${p[11]}`
				))
				.value();
		}
		if (fileExt === `java`) {
			finalResult = lodash.chain(contentsParam)
				.replace(ruleJavaBlockComment1, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}${p[13]}`
				))
				.replace(ruleJavaBlockComment2, (...p: unknown[]) => (
					`${p[4]}${p[5]}\n${p[2]}${p[3]}\n${p[7]}${p[8]}`
				))
				.replace(ruleJavaBlockComment3, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}${p[5]}\n${p[7]}${p[8]}`
				))
				.replace(ruleJavaBlockComment4, (...p: unknown[]) => (
					`${p[1]}${p[2]}-\n`
				))
				.replace(ruleJavaBlockComment5, (...p: unknown[]) => (
					`${p[1]}\n${p[3]}${p[4]}`
				))
				.value();
		}
		if (fileExt === `xml`) {
			finalResult = lodash.chain(contentsParam)
				.replace(ruleXmlComma1, () => (
					`, `
				))
				.replace(ruleXmlComma2, (...p: unknown[]) => (
					`${p[1]}, `
				))
				.replace(ruleXmlEquals, (...p: unknown[]) => (
					`${p[1]} = ${p[5]}`
				))
				.value();
		}

		// 2. 삼항 / IIFE / 논리연산자 줄나눔 정리 -------------------------------------------------
		const applyTernaryAndIifeFix = (source: string) => {
			let prev = ``;
			let current = source;

			while (current !== prev) {
				prev = current;
				current = lodash.chain(current)
					.replace(ruleTernaryIife, (...p: unknown[]) => {
						const indent = p[1] as string;
						const condition = (p[2] as string).trim();
						const firstBranch = p[3] as string;
						const secondBranch = p[4] as string;
						const tail = (p[5] as string) || ``;

						return `${indent}${condition} ?${firstBranch} :${secondBranch}${tail}`;
					})
					.replace(ruleJoinCondWithOp, (...p: unknown[]) => (
						`${p[1]} ${p[3]} ${p[5]}`
					))
					.replace(ruleJoinTernaryColon, (...p: unknown[]) => (
						`${p[1]} : ${p[4]}`
					))
					.replace(ruleAssignmentLineBreak, (...p: unknown[]) => (
						`${p[1]}${p[2]} ${p[5]} ${p[7]}`
					))
					.replace(ruleLogicalPrefix, (...p: unknown[]) => (
						`${p[1]}${p[2]} ${p[5]}`
					))
					.replace(ruleOperatorTrailingNewline, (...p: unknown[]) => (
						`${p[1]} `
					))
					.value();
			}

			return current;
		};

		finalResult = applyTernaryAndIifeFix(contentsParam);
		logger(`debug`, `${fileExt}:finalCheck - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:finalCheck - ${(err as Error).message}`);
		return contentsParam;
	}
};
