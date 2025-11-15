// assets/scripts/logger.ts

import { vscode } from "@exportLibs";

// -----------------------------------------------------------------------------------------
let outputChannel: vscode.OutputChannel | null = null;

// -----------------------------------------------------------------------------------------
export const initLogger = (): void => {
	(!outputChannel) ? (
		outputChannel = vscode.window.createOutputChannel(`Jlint`)
	) : (
		void 0
	);
};

// -----------------------------------------------------------------------------------------
export const logger = (
	type:
	`debug` |
	`info` |
	`warn` |
	`error`,
	key: string,
	value: string,
): void => {
	initLogger();

	const message = `[${type.toUpperCase()}] [${key}] ${value}`;

	type === `debug` && console.debug(
		`[Jlint] [${key}] ${value}`
	);
	type === `info` && console.info(
		`[Jlint] [${key}] ${value}`
	);
	type === `warn` && console.warn(
		`[Jlint] [${key}] ${value}`
	);
	type === `error` && console.error(
		`[Jlint] [${key}] ${value}`
	);

	outputChannel?.appendLine(message);
};