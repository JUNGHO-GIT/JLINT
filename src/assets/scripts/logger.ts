// assets/scripts/logger.ts

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
	type === `debug` && console.debug(
		`[jlint] [${key}] ${value}`
	);
	type === `info` && console.info(
		`[jlint] [${key}] ${value}`
	);
	type === `warn` && console.warn(
		`[jlint] [${key}] ${value}`
	);
	type === `error` && console.error(
		`[jlint] [${key}] ${value}`
	);
};