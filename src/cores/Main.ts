/**
 * @file Main.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import {
	getContents,
	getFinalCheck as gtFnlChck,
	getLanguage,
	getLogic,
	getSyntax,
} from "@exportCores";
import { vscode } from "@exportLibs";
import { logger } from "@exportScripts";
import type { CommonType } from "@exportTypes";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const main = async (
	commonParam: CommonType,
	filePath: string,
	fileName: string,
	fileTabSize: number,
	fileEol: string,
	fileExt: string,
) => {
	logger(
		`info`,
		`activateLint: ${commonParam.activateLint} \n` +
			`removeComments: ${commonParam.removeComments} \n` +
			`insertLine: ${commonParam.insertLine} \n` +
			`indentSize: ${commonParam.indentSize} \n` +
			`quoteType: ${commonParam.quoteType} \n` +
			`fileName: ${fileName} \n` +
			`fileExt: ${fileExt} \n` +
			`fileTabSize: ${fileTabSize} \n` +
			`fileEol: ${fileEol}`,
	);

	let fnlCntn = await getContents(
		filePath,
		fileTabSize,
		fileEol,
		fileExt,
	);
	fnlCntn = await getLanguage(
		commonParam,
		fnlCntn,
		filePath,
		fileTabSize,
		fileEol,
		fileExt,
	);
	fnlCntn = await getSyntax(commonParam, fnlCntn, fileExt);
	fnlCntn = await getLogic(commonParam, fnlCntn, fileExt);
	fnlCntn = await gtFnlChck(commonParam, fnlCntn, fileExt);

	// VS Code 에디터를 통해 내용 교체 (파일 동기화 유지)
	const editor = vscode.window.activeTextEditor;
	if (editor?.document.uri.fsPath === filePath) {
		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length),
		);
		await editor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(fullRange, fnlCntn);
		});
		await document.save();
	}
};
