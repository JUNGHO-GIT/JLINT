// rules/Syntax.ts

import { lodash } from "@exportLibs";
import { logger } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const capitalize = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/([^</>]\b)(\s*)(select|from|where|insert|into|values|update|set|delete|on|create)\b(\s*)([^</>]\b)/gm
		);
		const rules2 = (
			/([^</>]\b)(\s*)(table|alter|drop|truncate|order by|group by|having|limit|offset|distinct)\b(\s*)([^</>]\b)/gm
		);
		const rules3 = (
			/([^</>]\b)(\s*)(or|not|ifnull|is|in|like|between|as|case when|then|date_format)\b(\s*)([^</>]\b)/gm
		);
		const rules4 = (
			/([^</>]\b)(\s*)(inner join|left join|right join|full join|outer join)\b(\s*)([^</>]\b)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules2, (...p: any[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules3, (...p: any[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules4, (...p: any[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.value();

		return (
			fileExt !== `xml` && fileExt !== `sql`
				? (logger(`debug`, `${fileExt}:capitalize - N`), contentsParam)
				: (logger(`debug`, `${fileExt}:capitalize - Y`), finalResult)
		);
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:capitalize - ${err.message}`);
		return contentsParam;
	}
};

// -------------------------------------------------------------------------------------------------
export const singleTags = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(<)\b(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b([\s\n\S]*?)([\n\s]*)([/]*[>])/gm
		);
		const rules2 = (
			/(<)\b(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b(\s*)([/]*[>])/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}${p[2]}${p[3]}${p[4]}/>`
			))
			.replace(rules2, (...p: any[]) => (
				`${p[1]}${p[2]} />`
			))
			.value();

		logger(`debug`, `${fileExt}:singleTags - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:singleTags - ${err.message}`);
		return contentsParam;
	}
};

// -------------------------------------------------------------------------------------------------
export const semicolon = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)(return)(\s*)([;])/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}${p[2]};`
			))
			.value();

		logger(`debug`, `${fileExt}:semicolon - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:semicolon - ${err.message}`);
		return contentsParam;
	}
};

// -------------------------------------------------------------------------------------------------
export const space = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/((?:function\s*[\w$]*|(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?)\s*\()([^)]*)\)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}${p[2].replace(/([\w$]+)\s*=\s*/g, `$1=`)})`
			))
			.value();

		logger(`debug`, `${fileExt}:space - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:space - ${err.message}`);
		return contentsParam;
	}
};

// -------------------------------------------------------------------------------------------------
export const finalCheck = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)([&][&]|[|][|]|[?][?])(\n+)(\s*)(.*)/gm
		);
		const rules2 = (
			/(\s*)(\w+)(\s*)([=])(\s*)(\n+)(\s*)(.*)/gm
		);
		const rules3 = (
			/([&]{2}|[|]{2}|[?]{2}|=(?![=>]))[ \t]*\n\s*/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: any[]) => (
				`${p[1]}${p[2]} ${p[5]}`
			))
			.replace(rules2, (...p: any[]) => (
				`${p[1]}${p[2]} ${p[4]} ${p[8]}`
			))
			.replace(rules3, (...p: any[]) => (
				`${p[1]} `
			))
			.value();

		logger(`debug`, `${fileExt}:finalCheck - Y`);
		return finalResult;
	}
	catch (err: any) {
		logger(`error`, `${fileExt}:finalCheck - ${err.message}`);
		return contentsParam;
	}
};