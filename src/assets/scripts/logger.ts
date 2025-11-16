// assets/scripts/logger.ts

import { vscode } from "@exportLibs";

// -----------------------------------------------------------------------------------------
let logLevelMap = { "off": 0, "debug": 1, "info": 2, "warn": 3, "error": 4 };
let outputChannel: vscode.OutputChannel | null = null;

// -----------------------------------------------------------------------------------------
const getLogLevel = (): number => {
	const config = vscode.workspace.getConfiguration(`Jlint`);
	const level = config.get<string>(`logLevel`, `info`);
	return logLevelMap[level as keyof typeof logLevelMap] || 2;
};

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
	const currentLevel = getLogLevel();
	const messageLevel = logLevelMap[type];

	currentLevel === 0 || messageLevel < currentLevel ? (
		void 0
	) : (
		initLogger(),
		type === `debug` && console.debug(`[Jlint] [${key}] ${value}`),
		type === `info` && console.info(`[Jlint] [${key}] ${value}`),
		type === `warn` && console.warn(`[Jlint] [${key}] ${value}`),
		type === `error` && console.error(`[Jlint] [${key}] ${value}`),
		outputChannel?.appendLine(`[${type.toUpperCase()}] [${key}] ${value}`)
	);
};