// assets/scripts/notify.ts

import { vscode } from "@exportLibs";

// -----------------------------------------------------------------------------------------
export const notify = (
	type:
	`debug` |
	`info` |
	`warn` |
	`error`,
	key: string,
	value: string,
): void => {
	const msg = `[Jlint] [${key}] ${value}`;

	if (type === `debug` || type === `info`) {
		void vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: msg,
			cancellable: false
		},
		async (_) => {
			await new Promise((res) => {
				setTimeout(res, 1000);
			});
		});
		return;
	}
	if (type === `warn`) {
		vscode.window.showWarningMessage(msg, { modal: false });
		void vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: msg,
			cancellable: false
		},
		async (_) => {
			await new Promise((res) => {
				setTimeout(res, 1000);
			});
		});
		return;
	}
	if (type === `error`) {
		vscode.window.showErrorMessage(msg, { modal: false });
		void vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: msg,
			cancellable: false
		},
		async (_) => {
			await new Promise((res) => {
				setTimeout(res, 1000);
			});
		});
		return;
	}
};
