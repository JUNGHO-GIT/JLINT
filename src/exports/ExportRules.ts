/**
 * @file ExportRules.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export {
	globalRules,
	iifeRules,
	lngSpcfRls as langSpecificRules,
	ternaryRules,
} from "@rules/FinalCheck";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export {
	ifElse,
	tryCatch,
} from "@rules/Logic";
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export {
	capitalize,
	lineBreak,
	semicolon,
	singleTags,
	space,
} from "@rules/Syntax";
