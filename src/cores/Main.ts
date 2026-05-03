/**
 * @file Main.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import {
	getContents,
	getFinalCheck,
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

	let finalContents = await getContents(
		filePath,
		fileTabSize,
		fileEol,
		fileExt,
	);
	finalContents = await getLanguage(
		commonParam,
		finalContents,
		filePath,
		fileTabSize,
		fileEol,
		fileExt,
	);
	finalContents = await getSyntax(commonParam, finalContents, fileExt);
	finalContents = await getLogic(commonParam, finalContents, fileExt);
	finalContents = await getFinalCheck(commonParam, finalContents, fileExt);

	// VS Code 에디터를 통해 내용 교체 (파일 동기화 유지)
	const editor = vscode.window.activeTextEditor;
	if (editor?.document.uri.fsPath === filePath) {
		const document = editor.document;
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length),
		);
		await editor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(fullRange, finalContents);
		});
		await document.save();
	}
};
