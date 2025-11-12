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
	const msg = `[Jlint] [${key}] ${value}`;
	type === `debug` && console.debug(msg);
	type === `info` && console.info(msg);
	type === `warn` && console.warn(msg);
	type === `error` && console.error(msg);
};