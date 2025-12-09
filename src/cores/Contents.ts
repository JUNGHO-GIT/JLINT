// Contents.ts

import { TextDecoder, vscode } from "@exportLibs";
import { logger } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const getContents = async (filePath: string, fileTabSize: number, fileEol: string, fileExt: string) => {
	const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
	const decoder = new TextDecoder(`utf-8`);
	const dataStr = decoder.decode(data);

	try {
		const updateContent = dataStr
			.split(fileEol === `lf` ? `\n` : `\r\n`)
			.map((line: string) => line.trimEnd())
			.filter((line: string, idx: number, arr: string[]) => { 
				
				const prev = arr[idx - 1] || ``;
				return !(line === `` && prev === ``);
			})
			.map((line: string) => {
				const indentMatch = line.match(/^(\s+)/);
				if (indentMatch) {
					const spaces = indentMatch[1].length;
					const newIndent = Math.ceil(spaces / fileTabSize) * fileTabSize;
					return line.replace(/^(\s+)/, ` `.repeat(newIndent));
				}
				return line;
			})
			.join(`\n`)
			.trim();

		logger(`debug`, `${fileExt}:getContents - Y`);
		return updateContent;
	}
	catch (err: unknown) {
		logger(`error`, `${fileExt}:getContents - ${(err as Error).message}`);
		return dataStr;
	}
};
