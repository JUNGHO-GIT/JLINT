// rules/Syntax.ts

import { lodash } from "@exportLibs";
import { logger } from "@exportScripts";

// 1. capitalize -----------------------------------------------------------------------------------
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
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules2, (...p: unknown[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules3, (...p: unknown[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.replace(rules4, (...p: unknown[]) => (
				`${p[1]}${p[2]}${p[3].toUpperCase()}${p[4]}${p[5]}`
			))
			.value();

		return (
			(fileExt !== `xml` && fileExt !== `sql`) ? (
				logger(`debug`, `${fileExt}:capitalize - N`), contentsParam
			) : (
				logger(`debug`, `${fileExt}:capitalize - Y`), finalResult
			)
		);
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:capitalize - ${(err as Error).message}`);
		return contentsParam;
	}
};

// 2. singleTags -----------------------------------------------------------------------------------
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
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}${p[2]}${p[3]}${p[4]}/>`
			))
			.replace(rules2, (...p: unknown[]) => (
				`${p[1]}${p[2]} />`
			))
			.value();

		logger(`debug`, `${fileExt}:singleTags - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:singleTags - ${(err as Error).message}`);
		return contentsParam;
	}
};

// 3. semicolon -----------------------------------------------------------------------------------
export const semicolon = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(\s*)(return)(\s*)([;])/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}${p[2]};`
			))
			.value();

		logger(`debug`, `${fileExt}:semicolon - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:semicolon - ${(err as Error).message}`);
		return contentsParam;
	}
};

// 4. space ---------------------------------------------------------------------------------------
export const space = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/((?:function\s*[\w$]*|(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?)\s*\()([^)]*)\)/gm
		);

		const finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}${p[2].replace(/([\w$]+)\s*=\s*/g, `$1=`)})`
			))
			.value();

		logger(`debug`, `${fileExt}:space - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:space - ${(err as Error).message}`);
		return contentsParam;
	}
};

// 5. lineBreak ------------------------------------------------------------------------------------
export const lineBreak = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		const rules1 = (
			/(>)(\n*)(?:\})(?:\n*)(function)/gm
		);
		const rules2 = (
			/(?:\n*)(\s*)(<\/body>)(\s*?)/gm
		);
		const rules3 = (
			/(.*?)(\n*)(\s*)(\/\/ -.*>)/gm
		);
		const rules4 = (
			/(?<!package.*)(\s*)(;)(\s*)(\n?)(\s*)(import)/gm
		);
		const rules5 = (
			/(^\s*?)(import)([\s\S]*?)((;)|(\n+)?)(\s?)(\/\/)([\s\S]*?)(\n+?)(?=import)/gm
		);
		const rules6 = (
			/(^\s*?)(import)([\s\S]*?)(;)(\s*)(\n*)(^\s*?)(@)(\s*)(\S*)/gm
		);
		const rules7 = (
			/(import.*)(;)(\n*)(\/\/ --)/gm
		);
		const rules8 = (
			/(import.*;)(\n)(^public)/gm
		);
		const rules9 = (
			/(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
		);
		const rules10 = (
			/(\n+)(^.)(\s*)(\})(\s*)(\n)(\s*)(\/\/)/gm
		);
		const rules11 = (
			/(.*?)(\n*)(.*?)(\n*)(?<=^.\s*)(return)(\s*?)(\S*?)(\s*)(\n)(\s*)(\})/gm
		);
		const rules12 = (
			/(^\s*)(@Value)(\s*)(\()(.*)(\n+)(.*)(\))/gm
		);
		const rules13 = (
			/(^\s*)(.*;)(\n)(?!\n)(\s*)(@Autowired|@Value|@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping)/gm
		);
		const rules14 = (
			/(\s*)(@Override)(\n|\n+)(.*)(\n|\n+)(\s*)(public|private)/gm
		);

		let finalResult = lodash.chain(contentsParam)
			.replace(rules1, (...p: unknown[]) => (
				`${p[1]}\n${p[3]}`
			))
			.value();

		if (fileExt === `html` || fileExt === `jsp`) {
			finalResult = lodash.chain(finalResult)
				.replace(rules2, (...p: unknown[]) => (
					`\n\n${p[1]}${p[2]}${p[3]}`
				))
				.replace(rules3, (...p: unknown[]) => (
					`${p[1]}\n\n${p[3]}${p[4]}`
				))
				.value();
		}

		if (fileExt === `java`) {
			finalResult = lodash.chain(finalResult)
				.replace(rules4, (...p: unknown[]) => (
					`${p[1]}${p[2]}\n${p[6]}`
				))
				.replace(rules5, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}\n`
				))
				.replace(rules6, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[8]}${p[10]}`
				))
				.replace(rules7, (...p: unknown[]) => (
					`${p[1]}${p[2]}\n\n${p[4]}`
				))
				.replace(rules8, (...p: unknown[]) => (
					`${p[1]}${p[2]}\n${p[3]}`
				))
				.replace(rules9, (...p: unknown[]) => (
					`${p[1]} ${p[3]}\n${p[6]}${p[7]}`
				))
				.replace(rules10, (...p: unknown[]) => (
					`${p[1]}${p[2]}${p[3]}${p[4]}\n\n${p[7]}${p[8]}`
				))
				.replace(rules11, (...p: unknown[]) => (
					`${p[1]}\n${p[3]}${p[4]}${p[5]}${p[6]}${p[7]}${p[8]}${p[9]}${p[10]}${p[11]}`
				))
				.replace(rules12, (...p: unknown[]) => (
					`${p[1]}${p[2]} (${p[5]}${p[7]})`
				))
				.replace(rules13, (...p: unknown[]) => (
					`${p[1]}${p[2]}\n\n${p[4]}${p[5]}`
				))
				.replace(rules14, (...p: unknown[]) => (
					`${p[1]}${p[2]}\n${p[6]}${p[7]}`
				))
				.value();
		}

		logger(`debug`, `${fileExt}:lineBreak - Y`);
		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:lineBreak - ${(err as Error).message}`);
		return contentsParam;
	}
};
