/**
 * @file notify.ts
 * @since 2025-11-21
 */

import { vscode } from "@exportLibs";

// -------------------------------------------------------------------------------------------------
const MAIN = `Jlint`;
const AUTO_CLOSE_MS = 1000;

// -------------------------------------------------------------------------------------------------
const showProgress = async (text: string): Promise<void> => {
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: text,
		cancellable: false,
	},
	async (_) => {
		await new Promise((res) => setTimeout(res, AUTO_CLOSE_MS));
	});
};

// -------------------------------------------------------------------------------------------------
export const notify = (
	type: `debug` | `info` | `hint` | `warn` | `error`,
	value: string
): void => {
	const config = {
		title: {
			str: `[${MAIN}]`,
		},
		debug: {
			str: `[DEBUG]`,
		},
		info: {
			str: `[INFO]`,
		},
		hint: {
			str: `[HINT]`,
		},
		warn: {
			str: `[WARN]`,
		},
		error: {
			str: `[ERROR]`,
		},
	};
	const text = `${config.title.str} ${config[type].str} ${value}`;

	type === `debug` && (
		vscode.window.showInformationMessage(text, { modal: false }),
		void showProgress(text)
	);
	type === `info` && (
		vscode.window.showInformationMessage(text, { modal: false }),
		void showProgress(text)
	);
	type === `hint` && (
		vscode.window.showInformationMessage(text, { modal: false }),
		void showProgress(text)
	);
	type === `warn` && (
		vscode.window.showWarningMessage(text, { modal: false }),
		void showProgress(text)
	);
	type === `error` && (
		vscode.window.showErrorMessage(text, { modal: false }),
		void showProgress(text)
	);
};
