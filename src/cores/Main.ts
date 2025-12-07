// Main.ts

import { fs } from "@exportLibs";
import { getContents, getLanguage, getSyntax, getLogic, getFinalCheck } from "@exportCores";
import { logger } from "@exportScripts";
import { CommonType } from "@exportTypes";

// -------------------------------------------------------------------------------------------------
export const main = async (
	commonParam: CommonType,
	filePath: string,
	fileName: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string
) => {
	logger(
		`info`,
		`activateLint: ${commonParam.activateLint} \n` +
		`removeComments: ${commonParam.removeComments} \n` +
		`insertLine: ${commonParam.insertLine} \n` +
		`tabSize: ${commonParam.tabSize} \n` +
		`quoteType: ${commonParam.quoteType} \n` +
		`fileName: ${fileName} \n` +
		`fileExt: ${fileExt} \n` +
		`fileTabSize: ${fileTabSize} \n` +
		`fileEol: ${fileEol}`
	);

	let finalContents = await getContents(filePath, fileTabSize, fileEol, fileExt);
	finalContents = await getLanguage(commonParam, finalContents, fileName, fileTabSize, fileEol, fileExt);
	finalContents = await getSyntax(commonParam, finalContents, fileExt);
	finalContents = await getLogic(commonParam, finalContents, fileExt);
	finalContents = await getFinalCheck(commonParam, finalContents, fileExt);

	fs.writeFileSync(filePath, finalContents, `utf8`);
};
