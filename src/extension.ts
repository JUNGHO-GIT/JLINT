/**
 * @file extension.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { getRemoveComments, main } from "@exportCores";
import { path, setExtensionPath, vscode } from "@exportLibs";
import { initLogger, logger, notify } from "@exportScripts";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const deactivate = () => {
	logger(`info`, `Jlint is now deactivated`);
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const activate = (context: vscode.ExtensionContext) => {
	// 0. Initialize Logger
	initLogger();
	setExtensionPath(context.extensionPath);
	logger(`info`, `Jlint is now active!`);

	// 1. Get Configuration
	const getConfiguration = () => {
		const config = vscode.workspace.getConfiguration(`Jlint`);
		return {
			activateLint: config.get(`activateLint`, true) as boolean,
			indentSize: 2 as number,
			insertLine: config.get(`insertLine`, true) as boolean,
			quoteType: config.get(`quoteType`, `double`) as string,
			removeComments: config.get(`removeComments`, true) as boolean,
			useTabs: false,
		};
	};

	// 2. Register Command
	const command = vscode.commands.registerCommand(
		`extension.Jlint`,
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				await notify(`error`, `Jlint - No active editor found.`);
				return;
			}

			if (editor.document.uri.scheme !== `file`) {
				await notify(`error`, `Jlint - Please save the file before linting.`);
				return;
			}

			// Read editor settings for indentation
			const editorConfig = vscode.workspace.getConfiguration(
				`editor`,
				editor.document.uri,
			);
			const editorInsertSpaces = editorConfig.get(
				`insertSpaces`,
				true,
			) as boolean;
			const editorTabSize = editorConfig.get(`tabSize`, 2) as number;

			const jlintConfig = getConfiguration();
			const commonConfig = {
				...jlintConfig,
				indentSize: editorTabSize,
				useTabs: !editorInsertSpaces,
			};

			const filePath = editor.document.uri.fsPath;
			const fileName = path.basename(filePath);
			const fileTabSize = editorTabSize;
			const fileEol =
				editor.document.eol === vscode.EndOfLine.LF ? `lf` : `crlf`;
			const fileExt = editor.document.languageId;

			await main(
				commonConfig,
				filePath,
				fileName,
				fileTabSize,
				fileEol,
				fileExt,
			);

			await notify(`info`, `Linting Completed - "${fileName}"`);
		},
	);

	const removeCommentsCommand = vscode.commands.registerCommand(
		`extension.JlintRemoveComments`,
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				await notify(`error`, `Jlint - No active editor found.`);
				return;
			}
			if (editor.document.uri.scheme !== `file`) {
				await notify(
					`error`,
					`Jlint - Please save the file before removing comments.`,
				);
				return;
			}
			const editorConfig = vscode.workspace.getConfiguration(
				`editor`,
				editor.document.uri,
			);
      
			const editorTabSize = editorConfig.get(`tabSize`, 2) as number;
			const filePath = editor.document.uri.fsPath;
			const fileName = path.basename(filePath);
			const fileTabSize = editorTabSize;
			const fileEol = editor.document.eol === vscode.EndOfLine.LF ? `lf` : `crlf`;
			const fileExt = editor.document.languageId;
			const initContents = editor.document.getText();
			const finalContents = await getRemoveComments(
				initContents,
				fileTabSize,
				fileEol,
				fileExt,
			);

			const document = editor.document;
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(document.getText().length),
			);
			await editor.edit((editBuilder: vscode.TextEditorEdit) => {
				editBuilder.replace(fullRange, finalContents);
			});
			await document.save();

			await notify(`info`, `Comments Removed - "${fileName}"`);
		},
	);

	// 3. Listen for configuration changes ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――--
	context.subscriptions.push(command);
	context.subscriptions.push(removeCommentsCommand);
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(
			(event: vscode.ConfigurationChangeEvent) => {
				if (event.affectsConfiguration(`Jlint`)) {
					logger(
						`info`,
						`configuration - updated: ${JSON.stringify(getConfiguration(), null, 2)}`,
					);
				}
			},
		),
	);
};
