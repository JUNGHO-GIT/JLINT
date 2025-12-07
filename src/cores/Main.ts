// Main.ts

import { vscode } from "@exportLibs";
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
		`activateLint: ${commonParam.activateLint} \n`
		+ `removeComments: ${commonParam.removeComments} \n`
		+ `insertLine: ${commonParam.insertLine} \n`
		+ `tabSize: ${commonParam.tabSize} \n`
		+ `quoteType: ${commonParam.quoteType} \n`
		+ `fileName: ${fileName} \n`
		+ `fileExt: ${fileExt} \n`
		+ `fileTabSize: ${fileTabSize} \n`
		+ `fileEol: ${fileEol}`
	);

	let finalContents = await getContents(filePath, fileTabSize, fileEol, fileExt);
	finalContents = await getLanguage(commonParam, finalContents, fileName, fileTabSize, fileEol, fileExt);
	finalContents = await getSyntax(commonParam, finalContents, fileExt);
	finalContents = await getLogic(commonParam, finalContents, fileExt);
	finalContents = await getFinalCheck(commonParam, finalContents, fileExt);

	// VS Code 에디터를 통해 내용 교체 (파일 동기화 유지)
	const editor = vscode.window.activeTextEditor;
	if (editor?.document.uri.fsPath === filePath) {
		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);
		await editor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(fullRange, finalContents);
		});
		await document.save();
	}
};
