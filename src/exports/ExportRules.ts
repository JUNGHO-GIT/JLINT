/**
 * @file ExportRules.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
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
