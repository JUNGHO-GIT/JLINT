// rules/Logic.ts

import { lodash } from "@exportLibs";
import { logger } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const ifElse = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		// 1. if( / if (  => if (
		const rules1 = (
			/\bif\s*\(/gm
		);

		// 2. else if( / else if (  => else if (
		const rules2 = (
			/\belse\s+if\s*\(/gm
		);

		// 3. } 뒤의 여러 줄바꿈을 하나로 통합 (CRLF 대응, 다음 줄 들여쓰기 보존)
		const rules3 = (
			/\}\r?\n+(?=[^\S\r\n]*\S)/gm
		);

		// 4. } 와 else / else if 사이 줄바꿈 정규화 (동일 라인 / 복수 라인 모두 처리)
		//    } else if (...) {   /   } \n\n else if (...) {   =>  }\nelse if (...) {
		const rules4 = (
			/(^(\s*)\})[^\S\r\n]*(?:\r?\n[^\S\r\n]*)*(else(?:\s+if)?[^\r\n]*\{)/gm
		);

		// 5. 한 줄 if / else if 블록을 여러 줄로 변환
		//    if (...) { stmt; }  =>  if (...) { \n \tstmt; \n }
		const rules5 = (
			/^(\s*)(if|else\s+if)\s*\((.*?)\)\s*\{\s*([^{}]+?)\s*\}\s*$/gm
		);

		// 6. 한 줄 else 블록을 여러 줄로 변환
		//    else { stmt; }  =>  else { \n \tstmt; \n }
		const rules6 = (
			/^(\s*)else(?!\s+if)\s*\{\s*([^{}]+?)\s*\}\s*$/gm
		);

		// 7. { 뒤의 불필요한 빈 줄 제거 (CRLF 대응)
		const rules7 = (
			/\{[^\S\r\n]*\r?\n+/gm
		);

		// 8. } 앞의 불필요한 빈 줄 제거 (CRLF 대응, 이전 줄 들여쓰기 보존)
		const rules8 = (
			/(\r?\n)+([^\S\r\n]*)\}/gm
		);

		let finalResult = lodash.chain(contentsParam)
			// if / else if 헤더 정규화
			.replace(rules1, (...p: unknown[]) => (
				`if (`
			))
			.replace(rules2, (...p: unknown[]) => (
				`else if (`
			))

			// } 뒤 연속 개행 정리
			.replace(rules3, (...p: unknown[]) => (
				`}\n`
			))

			// } 와 else / else if 정렬 (같은 줄 / 여러 줄 모두 처리)
			.replace(rules4, (...p: unknown[]) => {
				const indent = p[2] as string;
				const header = p[3] as string;
				return `${indent}}\n${indent}${header}`;
			})

			// 한 줄 if / else if 블록 분리
			.replace(rules5, (...p: unknown[]) => {
				const indent = p[1] as string;
				const keyword = p[2] as string;
				const condition = p[3] as string;
				const content = (p[4] as string).trim();
				return `${indent}${keyword} (${condition}) {\n${indent}\t${content}\n${indent}}`;
			})

			// 한 줄 else 블록 분리
			.replace(rules6, (...p: unknown[]) => {
				const indent = p[1] as string;
				const content = (p[2] as string).trim();
				return `${indent}else {\n${indent}\t${content}\n${indent}}`;
			})

			// { / } 주변 빈 줄 정리
			.replace(rules7, (...p: unknown[]) => (
				`{\n`
			))
			.replace(rules8, (...p: unknown[]) => (
				`\n${p[2]}}`
			))
			.value();

		finalResult = (
			fileExt === `xml` || fileExt === `json` || fileExt === `sql`
		) ? (
			logger(`debug`, `${fileExt}:ifElse - N`), contentsParam
		) : (
			logger(`debug`, `${fileExt}:ifElse - Y`), finalResult
		);

		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:ifElse - ${(err as Error).message}`);
		return contentsParam;
	}
};

// -------------------------------------------------------------------------------------------------
export const tryCatch = async (
	contentsParam: string,
	fileExt: string
) => {
	try {
		// 1. try { 포맷
		const rules1 = (
			/\btry\s*\{/gm
		);

		// 2. catch( => catch (
		const rules2 = (
			/\bcatch\s*\(/gm
		);

		// 3. finally{ => finally {
		const rules3 = (
			/\bfinally\s*\{/gm
		);

		// 4. } catch ...  (같은 줄 패턴 정리)
		//    } catch (e) {  =>  }\ncatch (e) {
		const rules4 = (
			/^(\s*)\}\s*(catch[^\r\n]*\{?)/gm
		);

		// 5. } finally ...  (같은 줄 패턴 정리)
		//    } finally {  =>  }\nfinally {
		const rules5 = (
			/^(\s*)\}\s*(finally[^\r\n]*\{)/gm
		);

		// 6. } 뒤의 여러 줄바꿈을 하나로 통합 (CRLF 대응, 다음 줄 들여쓰기 보존)
		const rules6 = (
			/\}\r?\n+(?=[^\S\r\n]*\S)/gm
		);

		// 7. } 와 catch 사이에 여러 줄이 있어도 한 줄로 정리
		//    } \n\n   catch (e) {  =>  }\ncatch (e) {
		const rules7 = (
			/(^(\s*)\})[^\S\r\n]*(?:\r?\n[^\S\r\n]*)*(catch[^\r\n]*\{?)/gm
		);

		// 8. } 와 finally 사이에 여러 줄이 있어도 한 줄로 정리
		//    } \n\n   finally {  =>  }\nfinally {
		const rules8 = (
			/(^(\s*)\})[^\S\r\n]*(?:\r?\n[^\S\r\n]*)*(finally[^\r\n]*\{)/gm
		);

		// 9. { 뒤의 불필요한 빈 줄 제거 (CRLF 대응)
		const rules9 = (
			/\{[^\S\r\n]*\r?\n+/gm
		);

		// 10. } 앞의 불필요한 빈 줄 제거 (CRLF 대응, 이전 줄 들여쓰기 보존)
		const rules10 = (
			/(\r?\n)+([^\S\r\n]*)\}/gm
		);

		let finalResult = lodash.chain(contentsParam)
		// try / catch / finally 헤더 기본 정규화
			.replace(rules1, (...p: unknown[]) => (
				`try {`
			))
			.replace(rules2, (...p: unknown[]) => (
				`catch (`
			))
			.replace(rules3, (...p: unknown[]) => (
				`finally {`
			))

		// } catch / } finally 같은 줄 정리
			.replace(rules4, (...p: unknown[]) => (
				`${p[1]}}\n${p[1]}${p[2]}`
			))
			.replace(rules5, (...p: unknown[]) => (
				`${p[1]}}\n${p[1]}${p[2]}`
			))

		// } 뒤 연속 개행 정리
			.replace(rules6, (...p: unknown[]) => (
				`}\n`
			))

		// } 와 catch / finally 사이에 여러 줄이 끼어 있어도 한 줄로 정리
			.replace(rules7, (...p: unknown[]) => {
				const indent = p[2] as string;
				const header = p[3] as string;
				return `${indent}}\n${indent}${header}`;
			})
			.replace(rules8, (...p: unknown[]) => {
				const indent = p[2] as string;
				const header = p[3] as string;
				return `${indent}}\n${indent}${header}`;
			})

		// { / } 주변 빈 줄 정리
			.replace(rules9, (...p: unknown[]) => (
				`{\n`
			))
			.replace(rules10, (...p: unknown[]) => (
				`\n${p[2]}}`
			))
			.value();

		finalResult = (
			fileExt === `xml` || fileExt === `json` || fileExt === `sql`
		) ? (
			logger(`debug`, `${fileExt}:tryCatch - N`), contentsParam
		) : (
			logger(`debug`, `${fileExt}:tryCatch - Y`), finalResult
		);

		return finalResult;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:tryCatch - ${(err as Error).message}`);
		return contentsParam;
	}
};