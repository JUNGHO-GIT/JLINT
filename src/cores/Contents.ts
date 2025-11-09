// Contents.ts

import { vscode } from "@exportLibs";
import { logger } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const getContents = async (
  filePath: string,
  fileTabSize: number,
  fileEol: string,
	fileExt: string
) => {

  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const decoder = new TextDecoder("utf-8");
  const dataStr = decoder.decode(data);

  try {
		const updateContent = dataStr

		// .split("\n")
		.split(fileEol === "lf" ? "\n" : "\r\n")

		// 우측 공백 제거
		.map((line: string) => line.trimEnd())

		// 빈 줄 제거 + 연속 빈 줄 방지
		.filter((line: string, idx, arr) => {
			const prev = arr[idx - 1] || "";
			return !(line === "" && prev === "");
		})

		// 들여쓰기 조정
		.map((line: string) => {
			const indentMatch = line.match(/^(\s+)/);
			if (indentMatch) {
				const spaces = indentMatch[1].length;
				const newIndent = Math.ceil(spaces / fileTabSize) * fileTabSize;
				return line.replace(/^(\s+)/, " ".repeat(newIndent));
			}
			return line;
		})
		.join("\n")
		.trim();

		logger("debug", `${fileExt}:getContents`, "Y");
		return updateContent;
  }
  catch (err: any) {
		logger("error", `${fileExt}:getContents`, err.message);
    return dataStr;
  }
};