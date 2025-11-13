// assets/scripts/modal.ts

import { vscode } from "@exportLibs";

// -----------------------------------------------------------------------------------------
export const modal = (
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
		vscode.window.showInformationMessage(msg, { modal: true });
	}
	if (type === `warn`) {
		vscode.window.showWarningMessage(msg, { modal: true });
	}
	if (type === `error`) {
		vscode.window.showErrorMessage(msg, { modal: true });
	}
};