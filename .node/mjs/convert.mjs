/**
 * @file convert.mjs
 * @description Array/Object 변환 및 정렬 스크립트
 * @author Jungho
 * @since 2025-12-07
 */

import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { logger } from "../lib/utils.mjs";

// 1. 인자 파싱 ------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TITLE = path.basename(__filename);
const argv = process.argv.slice(2);
const args1 = argv.find((arg) => [
	`--npm`,
	`--pnpm`,
	`--yarn`,
	`--bun`,
].includes(arg))?.replace(`--`, ``) || ``;
const args2 = argv.find((arg) => [
	`--array`,
	`--object`,
].includes(arg))?.replace(`--`, ``) || ``;

// 2. 배열 정렬 -------------------------------------------------------------------------------
const sortArray = (input) => {
	const cloned = Array.isArray(input) ? [
		...input,
	] : [];

	const result = cloned
		.sort((a, b) => {
			const aKey = a && typeof a.key === `string` ? a.key : ``;
			const bKey = b && typeof b.key === `string` ? b.key : ``;
			const aHasPlus = aKey.includes(`+`);
			const bHasPlus = bKey.includes(`+`);

			const basicOrder = !aHasPlus && bHasPlus ? -1 : aHasPlus && !bHasPlus ? 1 : 0;
			const finalOrder = basicOrder !== 0 ? basicOrder : aKey < bKey ? -1 : aKey > bKey ? 1 : 0;

			return finalOrder;
		})
		.map((obj) => {
			const reorderedObj = {};

			`key` in obj && (reorderedObj.key = obj.key);
			`command` in obj && (reorderedObj.command = obj.command);
			`when` in obj && (reorderedObj.when = obj.when);

			Object.keys(obj).forEach((prop) => {
				prop !== `key` && prop !== `command` && prop !== `when` && (reorderedObj[prop] = obj[prop]);
			});

			return reorderedObj;
		});

	return result;
};

// 3. 객체 정렬 -------------------------------------------------------------------------------
const sortObject = (input) => {
	const grouped = {};
	const source = input && typeof input === `object` && !Array.isArray(input) ? input : {};

	Object.keys(source).forEach((key) => {
		const parts = key.split(`.`);
		const group = parts[0];
		!grouped[group] && (grouped[group] = []);
		grouped[group].push([
			key,
			source[key],
		]);
	});

	const sortedObject = {};
	Object.keys(grouped)
		.sort()
		.forEach((group) => {
			grouped[group].sort((a, b) => a[0].localeCompare(b[0]));
			grouped[group].forEach((entry) => {
				const entryKey = entry[0];
				const entryValue = entry[1];
				sortedObject[entryKey] = entryValue;
			});
		});

	const result = sortedObject;
	return result;
};

// 4. 결과 저장 -------------------------------------------------------------------------------
const saveResult = (content, fileName, modeParam) => {
	let isSaved = false;

	try {
		const filePath = path.join(__dirname, fileName);
		fs.writeFileSync(filePath, content, `utf8`);
		logger(`info`, `-----------------------------------------`);
		logger(`success`, `${fileName} 파일이 성공적으로 생성되었습니다.`);
		logger(`info`, `파일 위치: ${filePath}`);
		logger(`info`, `Processed Type: ${modeParam}`);
		logger(`info`, `정렬된 결과가 파일에 저장되었습니다.`);
		isSaved = true;
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `파일 저장 중 오류가 발생했습니다: ${errMsg}`);
	}
	const result = isSaved;
	return result;
};

// 5. 데이터 처리 -----------------------------------------------------------------------------
const processData = (input, modeParam) => {
	const isArrayMode = modeParam === `array`;
	const isObjectMode = modeParam === `object`;
	const fileNameArray = `convert_result.jsonc`;
	const fileNameObject = `convert_result.json`;

	let canRun = false;
	let outputContent = ``;
	let fileName = ``;

	const convertToJSONC = (sortedArray) => {
		let jsoncContent = `[\n`;
		let previousKey = null;

		sortedArray.forEach((obj, index) => {
			const currentKey = obj && obj.key ? obj.key : `undefined`;

			currentKey !== previousKey && (() => {
				const lines = `------------------------------------------------------------------------------------------`;
				index > 0 && (jsoncContent += `\n`);
				jsoncContent += `\n\t// ${currentKey} ${lines}\n`;
				previousKey = currentKey;
			})();

			const jsonStr = JSON.stringify(obj, null, 2);
			const indentedJson = jsonStr
				.split(`\n`)
				.map((line) => `\t${line}`)
				.join(`\n`);

			jsoncContent += indentedJson;
			index < sortedArray.length - 1 && (jsoncContent += `,`);
			jsoncContent += `\n`;
		});

		jsoncContent += `]`;

		const result = jsoncContent;
		return result;
	};

	isArrayMode && (() => {
		const isValidArray = Array.isArray(input);
		canRun = isValidArray;
		isValidArray && (() => {
			const sorted = sortArray(input);
			const converted = convertToJSONC(sorted);
			outputContent = converted;
			fileName = fileNameArray;
		})();
	})();

	isObjectMode && (() => {
		const isPlainObject = typeof input === `object` && input !== null && !Array.isArray(input);
		canRun = isPlainObject;
		isPlainObject && (() => {
			const sorted = sortObject(input);
			const json = JSON.stringify(sorted, null, 2);
			outputContent = json;
			fileName = fileNameObject;
		})();
	})();

	!canRun && isArrayMode && logger(`error`, `오류: 입력 데이터가 배열이 아닙니다.`);
	!canRun && isObjectMode && logger(`error`, `오류: 입력 데이터가 객체가 아닙니다.`);

	canRun && (() => {
		const saved = saveResult(outputContent, fileName, modeParam);
		!saved && (canRun = false);
	})();

	const result = {
		"canRun": canRun,
		"outputContent": outputContent,
		"fileName": fileName,
	};
	return result;
};

// 6. stdin 처리 -----------------------------------------------------------------------------
const runConvert = (modeParam) => new Promise((resolve, reject) => {
	const modeLabel = modeParam === `array` ? `배열(Array)` : modeParam === `object` ? `객체(Object)` : `알 수 없음`;

	const rl = createInterface({
		"input": process.stdin,
		"output": process.stdout,
	});

	logger(`info`, `${modeLabel} 데이터를 입력하세요 (입력 완료 후 Ctrl+D 또는 빈 줄 2번 입력):`);

	let inputData = ``;
	let emptyLineCount = 0;

	rl.on(`line`, (line) => {
		const trimmed = line.trim();
		trimmed === `` ? (emptyLineCount += 1) : (emptyLineCount = 0);

		emptyLineCount >= 2 ? rl.close() : (inputData += `${line}\n`);
	});

	rl.on(`close`, () => {
		let hasError = false;
		let errorObj = null;
		const raw = inputData.trim();

		!raw && (() => {
			logger(`info`, `입력 데이터가 없습니다.`);
			hasError = true;
			errorObj = new Error(`NO_INPUT`);
		})();

		raw && (() => {
			let parsedInput = null;

			try {
				parsedInput = new Function(`return ${inputData}`)();
			}
			catch (e) {
				const errMsg = e instanceof Error ? e.message : String(e);
				logger(`error`, `입력 데이터 파싱 중 오류 발생: ${errMsg}`);
				hasError = true;
				errorObj = e instanceof Error ? e : new Error(errMsg);
			}
			!hasError && (() => {
				try {
					const result = processData(parsedInput, modeParam);
					!result.canRun && (() => {
						hasError = true;
						errorObj = new Error(`CONVERT_FAILED`);
					})();
				}
				catch (e2) {
					const errMsg2 = e2 instanceof Error ? e2.message : String(e2);
					logger(`error`, `데이터 처리 중 오류 발생: ${errMsg2}`);
					hasError = true;
					errorObj = e2 instanceof Error ? e2 : new Error(errMsg2);
				}
			})();
		})();

		!hasError && (() => {
			resolve(true);
		})();

		hasError && (() => {
			reject(errorObj || new Error(`UNKNOWN_ERROR`));
		})();
	});
});

// 99. 실행 ----------------------------------------------------------------------------------
(async () => {
	try {
		logger(`info`, `스크립트 실행: ${TITLE}`);
		logger(`info`, `전달된 인자 1: ${args1 || `none`}`);
		logger(`info`, `전달된 인자 2: ${args2 || `none`}`);
		// logger(`info`, `전달된 인자 3: ${args3 || `none`}`);
	}
	catch {
		logger(`warn`, `인자 파싱 오류 발생`);
		process.exit(0);
	}
	try {
		args2 === `array` && (async () => {
			await runConvert(`array`);
		})();

		args2 === `object` && (async () => {
			await runConvert(`object`);
		})();

		logger(`info`, `스크립트 정상 종료: ${TITLE}`);
		process.exit(0);
	}
	catch (e) {
		const errMsg = e instanceof Error ? e.message : String(e);
		logger(`error`, `${TITLE} 스크립트 실행 실패: ${errMsg}`);
		process.exit(1);
	}
})();
