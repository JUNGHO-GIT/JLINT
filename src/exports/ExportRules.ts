/**
 * @file ExportRules.ts
 * @since 2025-11-28
 */

// -------------------------------------------------------------------------------
export {
	capitalize,
	singleTags,
	semicolon,
	space,
	lineBreak,
} from "@rules/Syntax";

// -------------------------------------------------------------------------------
export {
	ifElse,
	tryCatch,
} from "@rules/Logic";

// -------------------------------------------------------------------------------
export {
	globalRules,
	ternaryRules,
	iifeRules,
	langSpecificRules,
} from "@rules/FinalCheck";
