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
		await new Promise((res) => {
			setTimeout(res, AUTO_CLOSE_MS);
		});
	});
};

// -------------------------------------------------------------------------------------------------
export const notify = async (
	type: `debug` | `info` | `hint` | `warn` | `error`,
	value: string
): Promise<void> => {
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

	type === `debug` && await showProgress(text);
	type === `info` && await showProgress(text);
	type === `hint` && await showProgress(text);
	type === `warn` && await showProgress(text);
	type === `error` && await showProgress(text);
};

// -------------------------------------------------------------------------------------------------
export const modal = (
	type: `info` | `warn` | `error`,
	value: string
): Thenable<string | undefined> => {
	const text = `[${MAIN}] ${value}`;
	const options = { modal: true };

	const result = (
		type === `info` ? (
			vscode.window.showInformationMessage(text, options)
		) : type === `warn` ? (
			vscode.window.showWarningMessage(text, options)
		) : (
			vscode.window.showErrorMessage(text, options)
		)
	);

	return result;
};
