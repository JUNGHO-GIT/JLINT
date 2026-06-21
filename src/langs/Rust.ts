/**
 * @file Rust.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import type { StripOptions } from "@exportLibs";
import { spawnSync, strip } from "@exportLibs";
import { logger } from "@exportScripts";
import type { CommonType } from "@exportTypes";

const BS = String.fromCharCode(92);

// 토큰 상태 스캐너 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
type ScanState = {
	mode: `normal` | `str` | `raw` | `block`;
	hashes: number;
	depth: number;
};

const scanLineState = (line: string, entry: ScanState): ScanState => {
	let mode = entry.mode;
	let hashes = entry.hashes;
	let depth = entry.depth;
	const len = line.length;
	let i = 0;

	while (i < len) {
		const ch = line[i];
		const next = i + 1 < len ? line[i + 1] : ``;

		if (mode === `block`) {
			if (ch === `/` && next === `*`) {
				depth += 1;
				i += 2;
				continue;
			}
			if (ch === `*` && next === `/`) {
				depth -= 1;
				i += 2;
				if (depth <= 0) {
					mode = `normal`;
					depth = 0;
				}
				continue;
			}
			i += 1;
			continue;
		}
		if (mode === `str`) {
			if (ch === BS) {
				i += 2;
				continue;
			}
			if (ch === `"`) {
				mode = `normal`;
			}
			i += 1;
			continue;
		}
		if (mode === `raw`) {
			if (ch === `"`) {
				let h = 0;
				while (line[i + 1 + h] === `#`) {
					h += 1;
				}
				if (h >= hashes) {
					i += 1 + hashes;
					mode = `normal`;
					hashes = 0;
					continue;
				}
			}
			i += 1;
			continue;
		}
		// normal
		if (ch === `/` && next === `/`) {
			break;
		}
		if (ch === `/` && next === `*`) {
			mode = `block`;
			depth = 1;
			i += 2;
			continue;
		}
		if (ch === `r` || ch === `b`) {
			const prev = i > 0 ? line[i - 1] : ``;
			if (!/[A-Za-z0-9_]/.test(prev)) {
				let j = i;
				if (line[j] === `b`) {
					j += 1;
				}
				if (line[j] === `r`) {
					j += 1;
					let h = 0;
					while (line[j] === `#`) {
						h += 1;
						j += 1;
					}
					if (line[j] === `"`) {
						mode = `raw`;
						hashes = h;
						i = j + 1;
						continue;
					}
				}
			}
		}
		if (ch === `'`) {
			if (next === BS) {
				i += 2;
				while (i < len && line[i] !== `'`) {
					i += 1;
				}
				i += 1;
				continue;
			}
			if (line[i + 2] === `'`) {
				i += 3;
				continue;
			}
			i += 1;
			continue;
		}
		if (ch === `"`) {
			mode = `str`;
			i += 1;
			continue;
		}
		i += 1;
	}

	return { mode: mode, hashes: hashes, depth: depth };
};

// 구조보존 2-space 재들여쓰기 ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
const reindentRust = (src: string, unit: string): string => {
	const lines = src.split(`\n`);
	const out: string[] = [];
	const stack: { src: number; tgt: number }[] = [{ src: 0, tgt: 0 }];
	let state: ScanState = { mode: `normal`, hashes: 0, depth: 0 };

	for (const line of lines) {
		if (state.mode !== `normal`) {
			out.push(line);
			state = scanLineState(line, state);
			continue;
		}
		if (line.trim() === ``) {
			out.push(``);
			continue;
		}
		const lead = line.match(/^[ \t]*/);
		const indentLen = lead ? lead[0].length : 0;
		const trimmed = line.slice(indentLen);

		if (indentLen > stack[stack.length - 1].src) {
			stack.push({ src: indentLen, tgt: stack[stack.length - 1].tgt + 1 });
		}
		else {
			while (stack.length > 1 && indentLen < stack[stack.length - 1].src) {
				stack.pop();
			}
			if (stack.length > 1 && stack[stack.length - 1].src !== indentLen) {
				stack[stack.length - 1].src = indentLen;
			}
		}
		const tgt = stack[stack.length - 1].tgt;
		const pad = unit.repeat(tgt);
		// "key": "value" 문자열 값은 다음 줄로 분리 (normal 라인에서만 → 문자열 내부 보호)
		const pair = trimmed.match(
			/^("(?:[^"\\]|\\.)*"\s*:)[ \t]+("(?:[^"\\]|\\.)*")([ \t]*,?)[ \t]*$/,
		);
		if (pair) {
			out.push(`${pad}${pair[1]}`);
			out.push(`${pad}${unit}${pair[2]}${pair[3]}`);
		}
		else {
			out.push(pad + trimmed);
		}
		state = scanLineState(trimmed, state);
	}

	return out.join(`\n`);
};

// 0. removeComments ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const removeComments = async (
	contents: string,
	_fileTabSize: number,
	_fileEol: string,
	fileExt: string,
) => {
	try {
		const minifyResult = contents;

		const baseOptions: StripOptions = {
			block: true,
			keepProtected: false,
			language: `javascript`,
			line: true,
			preserveNewlines: false,
		};

		const finalResult = strip(minifyResult, baseOptions);

		logger(`debug`, `${fileExt}:removeComments - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:removeComments - ${(error as Error).message}`);
		return contents;
	}
};

// 1. prettierFormat ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const prettierFormat = async (
	commonParam: CommonType,
	contents: string,
	_fileName: string,
	_fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	try {
		logger(`debug`, `${fileExt}:prettierFormat - start`);
		// 0. formatter (rustfmt: 인프로세스 포매터가 없어 외부 rustfmt 사용, 미설치 시 원본 보존)
		const newlineStyle = fileEol === `lf` ? `Unix` : `Windows`;
		const rustfmtConfig = [
			`tab_spaces=${commonParam.indentSize}`,
			`hard_tabs=${commonParam.useTabs}`,
			`max_width=1000`,
			`newline_style=${newlineStyle}`,
		].join(`,`);
		const formatted = spawnSync(
			`rustfmt`,
			[`--emit`, `stdout`, `--edition`, `2021`, `--config`, rustfmtConfig],
			{ encoding: `utf8`, input: contents, maxBuffer: 64 * 1024 * 1024 },
		);

		// 1. availability
		if (formatted.error || formatted.status !== 0) {
			const reason = formatted.error
				? `rustfmt:missing`
				: `rustfmt:exit:${formatted.status}`;
			logger(`warn`, `${fileExt}:prettierFormat - ${reason}`);
			const stderr = formatted.stderr ? formatted.stderr.trim() : ``;
			if (stderr) {
				logger(`warn`, `${fileExt}:prettierFormat - ${stderr}`);
			}
			logger(`warn`, `${fileExt}:prettierFormat - format:skipped`);
			return contents;
		}

		// 2. result (rustfmt 가 매크로 내부를 4-space 고정 → 2-space 재들여쓰기 + 문자열 값 줄분리)
		const rustfmtOut = formatted.stdout ?? contents;
		const unit = commonParam.useTabs ? `\t` : ` `.repeat(commonParam.indentSize);
		const finalResult = reindentRust(rustfmtOut, unit);

		logger(`debug`, `${fileExt}:prettierFormat - end`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:prettierFormat - ${(error as Error).message}`);
		return contents;
	}
};

// 2. insertLine ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const insertLine = async (contents: string, fileExt: string) => {
	try {
		const finalResult = contents;

		logger(`debug`, `${fileExt}:insertLine - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertLine - ${(error as Error).message}`);
		return contents;
	}
};

// 3. insertSpace ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const insertSpace = async (contents: string, fileExt: string) => {
	try {
		// 함수/타입 정의 앞 빈 줄 1칸 보장 (앞 줄이 코드일 때만; 빈 줄·주석·여는 블록·속성 뒤 스킵)
		const blankRule =
			/^([^\S\n\r]*[^\s/#*@][^\n\r]*(?<!\{)\n)([^\S\n\r]*)((?:pub(?:\([^)]*\))?\s+)?(?:default\s+)?(?:async\s+)?(?:const\s+)?(?:unsafe\s+)?(?:extern\s+(?:"[^"]*"\s+)?)?(?:fn|struct|enum|trait|impl|mod|union)\b)/gm;

		const finalResult: string = contents.replaceAll(
			blankRule,
			(...p: unknown[]) => `${p[1]}\n${p[2]}${p[3]}`,
		);

		logger(`debug`, `${fileExt}:insertSpace - Y`);
		return finalResult;
	}
  catch (error: unknown) {
		logger(`error`, `${fileExt}:insertSpace - ${(error as Error).message}`);
		return contents;
	}
};
