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