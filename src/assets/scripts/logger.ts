/**
 * @file logger.ts
 * @since 2025-11-21
 */

import { vscode } from "@exportLibs";

// -------------------------------------------------------------------------------------------------
const MAIN = `Jlint`;
const logLevelMap = { off: 0, debug: 1, info: 2, hint: 3, warn: 4, error: 5 };
let outputChannel: vscode.OutputChannel | null = null;

// -------------------------------------------------------------------------------------------------
export const initLogger = (): void => {
	!outputChannel ? (
		outputChannel = vscode.window.createOutputChannel(MAIN)
	) : (
		void 0
	);
};

// -------------------------------------------------------------------------------------------------
const getLogLevel = (): number => {
	const config = vscode.workspace.getConfiguration(MAIN);
	const level = config.get<string>(`logLevel`, `info`);
	const rs = logLevelMap[level as keyof typeof logLevelMap] || 2;
	return rs;
};

// -------------------------------------------------------------------------------------------------
const appendOutput = (levelKey: keyof typeof logLevelMap, msg: string): void => {
	outputChannel && getLogLevel() <= logLevelMap[levelKey] && outputChannel.appendLine(msg);
};

// -------------------------------------------------------------------------------------------------
const formatLog = (text = ``): string => {
	return text.trim().replace(/^\s+/gm, ``);
};

// -------------------------------------------------------------------------------------------------
export const logger = (
	type: `debug` | `info` | `hint` | `warn` | `error`,
	value: string
): void => {
	const config = {
		line: {
			str: `-----------------------------------------`,
			color: `\u001b[38;2;255;162;0m`,
		},
		title: {
			str: `[${MAIN}]`,
			color: `\u001b[38;2;78;201;176m`,
		},
		debug: {
			str: `[DEBUG]`,
			color: `\u001b[38;5;141m`,
		},
		info: {
			str: `[INFO]`,
			color: `\u001b[38;5;46m`,
		},
		hint: {
			str: `[HINT]`,
			color: `\u001b[38;5;39m`,
		},
		warn: {
			str: `[WARN]`,
			color: `\u001b[38;5;214m`,
		},
		error: {
			str: `[ERROR]`,
			color: `\u001b[38;5;196m`,
		},
		reset: {
			str: ``,
			color: `\u001b[0m`,
		},
	};
	const separator = `${config.reset.color}${config.line.color}${config.line.str}${config.reset.color}`;
	const title = `${config.reset.color}${config.title.color}${config.title.str}${config.reset.color}`;
	const level = `${config.reset.color}${config[type].color}${config[type].str}${config.reset.color}`;
	const logMsg = formatLog(`
		${separator}
		${title} ${level}
		- ${value}
	`);
	const outputMsg = formatLog(`
		${config.line.str}
		${config[type].str} - ${value}
	`);

	type === `debug` && (() => {
		console.debug(logMsg);
		appendOutput(`debug`, outputMsg);
	})();
	type === `info` && (() => {
		console.info(logMsg);
		appendOutput(`info`, outputMsg);
	})();
	type === `hint` && (() => {
		console.log(logMsg);
		appendOutput(`hint`, outputMsg);
	})();
	type === `warn` && (() => {
		console.warn(logMsg);
		appendOutput(`warn`, outputMsg);
	})();
	type === `error` && (() => {
		console.error(logMsg);
		appendOutput(`error`, outputMsg);
	})();
};
