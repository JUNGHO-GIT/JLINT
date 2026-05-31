/**
 * @file ExportCores.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export { getContents } from "@cores/Contents";
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export {
	gtFnlChck as getFinalCheck,
	getLanguage,
	getLogic,
	gtRmvCmts as getRemoveComments,
	getSyntax,
} from "@cores/Controller";
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export { main } from "@cores/Main";
