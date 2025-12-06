/**
 * @file eslint.config.mjs
 * @description ESLint 설정 파일
 * @author Jungho
 * @since 2025-12-06
 */

import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

// 0. 타입 임포트 -------------------------------------------------------------------------------
/**
 * @typedef {import("@eslint/core").Plugin} Plugin
 * @typedef {import("eslint").Linter.Config} Config
 * @typedef {import("eslint").Linter.RulesRecord} RulesRecord
 * @typedef {import("eslint").Linter.LanguageOptions} LanguageOptions
 * @typedef {import("eslint").Linter.LinterOptions} LinterOptions
 */

// 1. 커스텀 설정 ------------------------------------------------------------------------------
const CUSTOM_CONFIG = {

	// 1. FILE EXTENSIONS
	/** @type {string[]} */
	"JS_EXTENSIONS": [
		`**/*.js`,
		`**/*.mjs`,
		`**/*.cjs`,
		`**/*.jsx`,
	],

	/** @type {string[]} */
	"TS_EXTENSIONS": [
		`**/*.ts`,
		`**/*.tsx`,
	],

	// 2. IGNORE PATTERNS
	/** @type {Config['ignores']} */
	"IGNORE_PATTERNS": [
		`**/node_modules/**`,
		`**/dist/**`,
		`**/build/**`,
		`**/.next/**`,
		`**/.turbo/**`,
		`**/coverage/**`,
		`**/.git/**`,
		`**/.cache/**`,
		`**/out/**`,
		`**/*.min.js`,
		`**/*.bundle.js`,
		`**/vendor/**`,
		`**/*.config.js`,
		`**/*.config.cjs`,
		`**/*.config.ts`,
		`scripts/**`,
		`build/**`,
		`dist/**`,
		`coverage/**`,
		`!**/*.d.ts`,
	],

	// 3. COMMON LANGUAGE OPTIONS
	/** @type {LanguageOptions} */
	"JS_LANGUAGE_OPTIONS": {
		"ecmaVersion": `latest`,
		"sourceType": `module`,
		"globals": {
			...globals.es2021,
			...globals.browser,
			...globals.node,
			...globals.worker,
			"APP_ENV": `readonly`,
			"APP_VERSION": `readonly`,
			"DEBUG": `readonly`,
		},
		"parserOptions": {
			"ecmaVersion": `latest`,
			"sourceType": `module`,
			"ecmaFeatures": {
				"jsx": true,
				"globalReturn": false,
				"impliedStrict": false,
			},
		},
	},

	/** @type {LanguageOptions} */
	"TS_LANGUAGE_OPTIONS": {
		"ecmaVersion": `latest`,
		"sourceType": `module`,
		"parser": tsParser,
		"globals": {
			...globals.es2021,
			...globals.browser,
			...globals.node,
			...globals.worker,
			"APP_ENV": `readonly`,
			"APP_VERSION": `readonly`,
			"DEBUG": `readonly`,
		},
		"parserOptions": {
			"ecmaVersion": `latest`,
			"sourceType": `module`,
			"project": `./tsconfig.json`,
			"allowImportExportEverywhere": false,
			"extraFileExtensions": [],
			"ecmaFeatures": {
				"jsx": true,
				"globalReturn": false,
				"impliedStrict": false,
			},
		},
	},

	// 4. COMMON LINTER OPTIONS
	/** @type {LinterOptions} */
	"COMMON_LINTER_OPTIONS": {
		"noInlineConfig": false,
		"reportUnusedDisableDirectives": true,
		"reportUnusedInlineConfigs": `warn`,
	},

	// 5. BASE JS RULES
	/** @type {RulesRecord} */
	"BASE_RULES": {
		"accessor-pairs": [
			`error`,
			{ "setWithoutGet": true, "getWithoutSet": false, "enforceForClassMembers": true },
		],
		"array-element-newline": [
			`error`,
			{ "multiline": true, "minItems": 1 },
		],
		"array-bracket-newline": [
			`error`,
			{ "multiline": true, "minItems": 1 },
		],
		"array-bracket-spacing": [
			`error`,
			`never`,
		],
		"array-callback-return": [
			`error`,
			{ "allowImplicit": false, "checkForEach": true },
		],
		"block-spacing": [
			`error`,
			`always`,
		],
		"brace-style": [
			`error`,
			`stroustrup`,
			{ "allowSingleLine": true },
		],
		"camelcase": [
			`error`,
			{ "properties": `never`, "ignoreDestructuring": false, "ignoreImports": false, "ignoreGlobals": false },
		],
		"capitalized-comments": [
			`off`,
			`always`,
			{ "ignorePattern": `eslint|istanbul|ts-ignore|prettier-ignore`, "ignoreInlineComments": true, "ignoreConsecutiveComments": true },
		],
		"class-methods-use-this": [
			`off`,
			{ "exceptMethods": [], "enforceForClassFields": false },
		],
		"comma-dangle": [
			`error`,
			{ "arrays": `always-multiline`, "objects": `always-multiline`, "imports": `always-multiline`, "exports": `always-multiline`, "functions": `never` },
		],
		"comma-spacing": [
			`error`,
			{ "before": false, "after": true },
		],
		"comma-style": [
			`error`,
			`last`,
		],
		"complexity": [
			`off`,
			{ "max": 20 },
		],
		"computed-property-spacing": [
			`error`,
			`never`,
			{ "enforceForClassMembers": true },
		],
		"consistent-return": [
			`error`,
			{ "treatUndefinedAsUnspecified": false },
		],
		"consistent-this": [
			`off`,
			`self`,
		],
		"constructor-super": [
			`error`,
		],
		"curly": [
			`error`,
			`multi-line`,
		],
		"default-case-last": [
			`error`,
		],
		"default-case": [
			`error`,
			{ "commentPattern": `^no default$` },
		],
		"default-param-last": [
			`error`,
		],
		"eol-last": [
			`error`,
			`always`,
		],
		"eqeqeq": [
			`error`,
			`always`,
			{ "null": `ignore` },
		],
		"for-direction": [
			`error`,
		],
		"func-call-spacing": [
			`error`,
			`never`,
		],
		"func-names": [
			`warn`,
			`as-needed`,
		],
		"func-style": [
			`error`,
			`expression`,
			{ "allowArrowFunctions": true },
		],
		"function-call-argument-newline": [
			`off`,
			`consistent`,
		],
		"function-paren-newline": [
			`off`,
			`multiline-arguments`,
		],
		"generator-star-spacing": [
			`error`,
			{ "before": false, "after": true },
		],
		"getter-return": [
			`error`,
			{ "allowImplicit": false },
		],
		"grouped-accessor-pairs": [
			`error`,
			`setBeforeGet`,
		],
		"guard-for-in": [
			`off`,
		],
		"handle-callback-err": [
			`off`,
			`^(err|error)$`,
		],
		"id-blacklist": [
			`off`,
		],
		"id-denylist": [
			`off`,
			`data`,
			`callback`,
		],
		"id-length": [
			`off`,
			{ "min": 2, "max": 40, "exceptions": [
				`i`,
				`j`,
				`k`,
				`x`,
				`y`,
				`_`,
			] },
		],
		"id-match": [
			`off`,
			`^[_$a-zA-Z][_$a-zA-Z0-9]*$`,
			{ "properties": false, "onlyDeclarations": false, "ignoreDestructuring": false },
		],
		"implicit-arrow-linebreak": [
			`error`,
			`beside`,
		],
		"indent": [
			`error`,
			`tab`,
			{ "SwitchCase": 1, "flatTernaryExpressions": false, "ignoredNodes": [], "offsetTernaryExpressions": true },
		],
		"init-declarations": [
			`off`,
			`always`,
		],
		"jsx-quotes": [
			`error`,
			`prefer-double`,
		],
		"key-spacing": [
			`error`,
			{ "beforeColon": false, "afterColon": true, "mode": `strict` },
		],
		"keyword-spacing": [
			`error`,
			{ "before": true, "after": true, "overrides": {} },
		],
		"line-comment-position": [
			`off`,
			{ "position": `above`, "ignorePattern": ``, "applyDefaultPatterns": true },
		],
		"linebreak-style": [
			`error`,
			`unix`,
		],
		"lines-around-comment": [
			`off`,
			{ "beforeBlockComment": true, "afterBlockComment": false, "beforeLineComment": false, "afterLineComment": false, "allowBlockStart": true, "allowBlockEnd": true, "allowClassStart": true, "allowClassEnd": true, "allowObjectStart": true, "allowObjectEnd": true, "allowArrayStart": true, "allowArrayEnd": true },
		],
		"lines-between-class-members": [
			`error`,
			`always`,
			{ "exceptAfterSingleLine": true },
		],
		"logical-assignment-operators": [
			`error`,
			`always`,
			{ "enforceForIfStatements": true },
		],
		"max-len": [
			`warn`,
			{ "code": 500, "tabWidth": 2, "ignoreUrls": true, "ignoreComments": false, "ignoreTrailingComments": false, "ignoreStrings": true, "ignoreTemplateLiterals": true, "ignoreRegExpLiterals": true },
		],
		"max-depth": [
			`warn`,
			4,
		],
		"max-lines": [
			`off`,
			{ "max": 1000, "skipBlankLines": true, "skipComments": true },
		],
		"max-lines-per-function": [
			`off`,
			{ "max": 150, "skipBlankLines": true, "skipComments": true, "IIFEs": true },
		],
		"max-params": [
			`off`,
			{ "max": 4 },
		],
		"max-nested-callbacks": [
			`off`,
			{ "max": 3 },
		],
		"max-statements": [
			`off`,
			{ "max": 40 },
		],
		"max-statements-per-line": [
			`error`,
			{ "max": 1 },
		],
		"no-console": [
			`warn`,
			{ "allow": [
				`warn`,
				`error`,
			] },
		],
		"no-debugger": [
			`error`,
		],
		"no-duplicate-imports": [
			`off`,
			{ "includeExports": true },
		],
		"no-else-return": [
			`error`,
			{ "allowElseIf": false },
		],
		"no-multiple-empty-lines": [
			`error`,
			{ "max": 1, "maxEOF": 0, "maxBOF": 0 },
		],
		"no-trailing-spaces": [
			`error`,
			{ "skipBlankLines": false, "ignoreComments": false },
		],
		"no-unused-vars": [
			`warn`,
			{ "vars": `all`, "args": `after-used`, "caughtErrors": `none`, "ignoreRestSiblings": true, "varsIgnorePattern": `^_`, "argsIgnorePattern": `^_` },
		],
		"no-var": [
			`error`,
		],
		"no-implicit-coercion": [
			`error`,
			{ "boolean": true, "number": true, "string": true, "allow": [] },
		],
		"no-magic-numbers": [
			`off`,
			{ "ignore": [
				-1,
				0,
				1,
				2,
			], "ignoreArrayIndexes": true, "enforceConst": true, "detectObjects": false },
		],
		"no-prototype-builtins": [
			`error`,
		],
		"no-eval": [
			`error`,
		],
		"no-implied-eval": [
			`error`,
		],
		"no-new-func": [
			`error`,
		],
		"no-shadow": [
			`error`,
		],
		"no-param-reassign": [
			`error`,
			{ "props": true },
		],
		"no-useless-concat": [
			`error`,
		],
		"no-useless-return": [
			`error`,
		],
		"no-unsafe-finally": [
			`error`,
		],
		"no-unsafe-negation": [
			`error`,
			{ "enforceForOrderingRelations": true },
		],
		"no-self-compare": [
			`error`,
		],
		"no-self-assign": [
			`error`,
			{ "props": true },
		],
		"no-undef-init": [
			`error`,
		],
		"no-undef": [
			`error`,
		],
		"no-duplicate-case": [
			`error`,
		],
		"no-empty-pattern": [
			`error`,
		],
		"no-empty": [
			`error`,
			{ "allowEmptyCatch": true },
		],
		"no-extra-bind": [
			`error`,
		],
		"no-extra-boolean-cast": [
			`error`,
		],
		"no-extra-parens": [
			`off`,
			`all`,
			{ "conditionalAssign": true, "returnAssign": false, "nestedBinaryExpressions": false, "enforceForArrowConditionals": false },
		],
		"no-extra-semi": [
			`error`,
		],
		"no-new-wrappers": [
			`error`,
		],
		"no-throw-literal": [
			`error`,
		],
		"no-multi-str": [
			`error`,
		],
		"no-multi-spaces": [
			`error`,
			{ "ignoreEOLComments": false },
		],
		"no-iterator": [
			`error`,
		],
		"no-labels": [
			`error`,
			{ "allowLoop": false, "allowSwitch": false },
		],
		"no-array-constructor": [
			`error`,
		],
		"no-extend-native": [
			`error`,
		],
		"no-obj-calls": [
			`error`,
		],
		"no-octal": [
			`error`,
		],
		"no-octal-escape": [
			`error`,
		],
		"no-nonoctal-decimal-escape": [
			`error`,
		],
		"no-misleading-character-class": [
			`error`,
		],
		"no-with": [
			`error`,
		],
		"no-whitespace-before-property": [
			`error`,
		],
		"no-unreachable": [
			`error`,
		],
		"no-unreachable-loop": [
			`error`,
		],
		"no-unused-labels": [
			`error`,
		],
		"no-unused-private-class-members": [
			`error`,
		],
		"no-useless-assignment": [
			`error`,
		],
		"no-useless-backreference": [
			`error`,
		],
		"prefer-template": [
			`error`,
		],
		"prefer-arrow-callback": [
			`error`,
			{ "allowNamedFunctions": true, "allowUnboundThis": true },
		],
		"prefer-const": [
			`error`,
			{ "destructuring": `all`, "ignoreReadBeforeAssign": true },
		],
		"prefer-exponentiation-operator": [
			`error`,
		],
		"prefer-numeric-literals": [
			`error`,
		],
		"prefer-object-has-own": [
			`error`,
		],
		"prefer-object-spread": [
			`error`,
		],
		"prefer-regex-literals": [
			`error`,
			{ "disallowRedundantWrapping": true },
		],
		"prefer-rest-params": [
			`error`,
		],
		"prefer-spread": [
			`error`,
		],
		"prefer-promise-reject-errors": [
			`error`,
			{ "allowEmptyReject": false },
		],
		"strict": [
			`error`,
			`never`,
		],
		"quote-props": [
			`error`,
			`as-needed`,
			{ "keywords": false, "unnecessary": false, "numbers": false },
		],
		"quotes": [
			`error`,
			`backtick`,
			{ "avoidEscape": true, "allowTemplateLiterals": true },
		],
		"radix": [
			`error`,
			`always`,
		],
		"require-atomic-updates": [
			`error`,
			{ "allowProperties": true },
		],
		"require-await": [
			`off`,
		],
		"require-yield": [
			`error`,
		],
		"require-unicode-regexp": [
			`off`,
		],
		"rest-spread-spacing": [
			`error`,
			`never`,
		],
		"semi-spacing": [
			`error`,
			{ "before": false, "after": true },
		],
		"semi-style": [
			`error`,
			`last`,
		],
		"semi": [
			`error`,
			`always`,
		],
		"sort-imports": [
			`off`,
			{ "ignoreCase": false, "ignoreDeclarationSort": false, "ignoreMemberSort": false, "allowSeparatedGroups": true },
		],
		"sort-keys": [
			`off`,
			`asc`,
			{ "caseSensitive": false, "natural": true, "minKeys": 2 },
		],
		"sort-vars": [
			`off`,
			{ "ignoreCase": true },
		],
		"space-before-blocks": [
			`error`,
			`always`,
		],
		"space-before-function-paren": [
			`error`,
			{ "anonymous": `never`, "named": `never`, "asyncArrow": `always` },
		],
		"space-in-parens": [
			`error`,
			`never`,
		],
		"space-infix-ops": [
			`error`,
			{ "int32Hint": false },
		],
		"space-unary-ops": [
			`error`,
			{ "words": true, "nonwords": false },
		],
		"spaced-comment": [
			`error`,
			`always`,
			{ "block": { "balanced": true } },
		],
		"switch-colon-spacing": [
			`error`,
			{ "after": true, "before": false },
		],
		"template-curly-spacing": [
			`error`,
			`never`,
		],
		"template-tag-spacing": [
			`error`,
			`never`,
		],
		"unicode-bom": [
			`error`,
			`never`,
		],
		"use-isnan": [
			`error`,
			{ "enforceForSwitchCase": true, "enforceForIndexOf": true },
		],
		"valid-typeof": [
			`error`,
			{ "requireStringLiterals": true },
		],
		"vars-on-top": [
			`off`,
		],
		"wrap-iife": [
			`error`,
			`outside`,
			{ "functionPrototypeMethods": true },
		],
		"wrap-regex": [
			`off`,
		],
		"yield-star-spacing": [
			`error`,
			{ "before": false, "after": true },
		],
		"yoda": [
			`error`,
			`never`,
			{ "exceptRange": false, "onlyEquality": false },
		],
		"no-async-promise-executor": [
			`error`,
		],
		"no-await-in-loop": [
			`warn`,
		],
		"no-promise-executor-return": [
			`error`,
		],
		"no-return-await": [
			`error`,
		],
		"no-use-before-define": [
			`error`,
			{ "functions": false, "classes": true, "variables": false },
		],
		"no-constant-condition": [
			`warn`,
			{ "checkLoops": false },
		],
		"no-irregular-whitespace": [
			`error`,
			{ "skipStrings": true, "skipComments": false, "skipRegExps": true, "skipTemplates": true },
		],
		"no-mixed-spaces-and-tabs": [
			`error`,
		],
		"no-loss-of-precision": [
			`error`,
		],
		"no-script-url": [
			`error`,
		],
		"no-unneeded-ternary": [
			`error`,
			{ "defaultAssignment": false },
		],
	},

	// 6. TS SPECIFIC RULES
	/** @type {RulesRecord} */
	"TS_RULES": {
		"@typescript-eslint/adjacent-overload-signatures": [
			`error`,
		],
		"@typescript-eslint/array-type": [
			`warn`,
		],
		"@typescript-eslint/await-thenable": [
			`error`,
		],
		"@typescript-eslint/ban-ts-comment": [
			`error`,
		],
		"@typescript-eslint/ban-tslint-comment": [
			`warn`,
		],
		"@typescript-eslint/class-literal-property-style": [
			`off`,
		],
		"@typescript-eslint/consistent-generic-constructors": [
			`off`,
		],
		"@typescript-eslint/consistent-indexed-object-style": [
			`warn`,
		],
		"@typescript-eslint/consistent-type-assertions": [
			`error`,
		],
		"@typescript-eslint/consistent-type-definitions": [
			`off`,
		],
		"@typescript-eslint/consistent-type-exports": [
			`off`,
		],
		"@typescript-eslint/consistent-type-imports": [
			`off`,
		],
		"@typescript-eslint/explicit-function-return-type": [
			`off`,
		],
		"@typescript-eslint/explicit-member-accessibility": [
			`off`,
		],
		"@typescript-eslint/member-ordering": [
			`off`,
		],
		"@typescript-eslint/method-signature-style": [
			`warn`,
		],
		"@typescript-eslint/naming-convention": [
			`off`,
		],
		"@typescript-eslint/no-array-constructor": [
			`error`,
		],
		"@typescript-eslint/no-confusing-non-null-assertion": [
			`error`,
		],
		"@typescript-eslint/no-confusing-void-expression": [
			`error`,
		],
		"@typescript-eslint/no-duplicate-enum-values": [
			`error`,
		],
		"@typescript-eslint/no-duplicate-type-constituents": [
			`error`,
		],
		"@typescript-eslint/no-explicit-any": [
			`warn`,
		],
		"@typescript-eslint/no-extra-non-null-assertion": [
			`error`,
		],
		"@typescript-eslint/no-floating-promises": [
			`error`,
		],
		"@typescript-eslint/no-for-in-array": [
			`error`,
		],
		"@typescript-eslint/no-inferrable-types": [
			`off`,
		],
		"@typescript-eslint/no-invalid-this": [
			`error`,
		],
		"@typescript-eslint/no-misused-new": [
			`error`,
		],
		"@typescript-eslint/no-misused-promises": [
			`error`,
		],
		"@typescript-eslint/no-namespace": [
			`error`,
		],
		"@typescript-eslint/no-non-null-asserted-nullish-coalescing": [
			`error`,
		],
		"@typescript-eslint/no-non-null-asserted-optional-chain": [
			`error`,
		],
		"@typescript-eslint/no-non-null-assertion": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-boolean-literal-compare": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-condition": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-parameter-property-assignment": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-qualifier": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-template-expression": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-type-assertion": [
			`warn`,
		],
		"@typescript-eslint/no-unnecessary-type-constraint": [
			`warn`,
		],
		"@typescript-eslint/no-unsafe-argument": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-assignment": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-call": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-declaration-merging": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-enum-comparison": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-function-type": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-member-access": [
			`error`,
		],
		"@typescript-eslint/no-unsafe-return": [
			`error`,
		],
		"@typescript-eslint/no-unused-expressions": [
			`off`,
		],
		"@typescript-eslint/non-nullable-type-assertion-style": [
			`off`,
		],
		"@typescript-eslint/prefer-as-const": [
			`warn`,
		],
		"@typescript-eslint/prefer-enum-initializers": [
			`off`,
		],
		"@typescript-eslint/prefer-for-of": [
			`warn`,
		],
		"@typescript-eslint/prefer-includes": [
			`warn`,
		],
		"@typescript-eslint/prefer-nullish-coalescing": [
			`warn`,
		],
		"@typescript-eslint/prefer-optional-chain": [
			`warn`,
		],
		"@typescript-eslint/prefer-reduce-type-parameter": [
			`warn`,
		],
		"@typescript-eslint/prefer-regexp-exec": [
			`off`,
		],
		"@typescript-eslint/prefer-return-this-type": [
			`off`,
		],
		"@typescript-eslint/prefer-string-starts-ends-with": [
			`off`,
		],
		"@typescript-eslint/promise-function-async": [
			`off`,
		],
		"@typescript-eslint/require-await": [
			`off`,
		],
		"@typescript-eslint/restrict-plus-operands": [
			`error`,
		],
		"@typescript-eslint/restrict-template-expressions": [
			`warn`,
		],
		"@typescript-eslint/strict-boolean-expressions": [
			`warn`,
		],
		"@typescript-eslint/switch-exhaustiveness-check": [
			`error`,
		],
		"@typescript-eslint/unbound-method": [
			`error`,
		],
		"@typescript-eslint/unified-signatures": [
			`warn`,
		],
	},
};

// 7. 프로젝트 전체 설정 ------------------------------------------------------------------------
export default defineConfig([
	// 7-1. JavaScript Config (js, mjs, cjs, jsx)
	{
		"name": `JavaScript`,
		"basePath": `.`,
		"files": CUSTOM_CONFIG.JS_EXTENSIONS,
		"ignores": CUSTOM_CONFIG.IGNORE_PATTERNS,
		"languageOptions": CUSTOM_CONFIG.JS_LANGUAGE_OPTIONS,
		"linterOptions": CUSTOM_CONFIG.COMMON_LINTER_OPTIONS,
		"extends": [
			js.configs.recommended,
		],
		"rules": {
			...js.configs.recommended.rules,
			...CUSTOM_CONFIG.BASE_RULES,
		},
		"settings": {},
	},
	// 7-2. TypeScript Config (ts, tsx)
	{
		"name": `TypeScript`,
		"basePath": `.`,
		"files": CUSTOM_CONFIG.TS_EXTENSIONS,
		"ignores": CUSTOM_CONFIG.IGNORE_PATTERNS,
		"languageOptions": CUSTOM_CONFIG.TS_LANGUAGE_OPTIONS,
		"linterOptions": CUSTOM_CONFIG.COMMON_LINTER_OPTIONS,
		"extends": [
			js.configs.recommended,
		],
		"plugins": {
			"@typescript-eslint": /** @type {Plugin} */ (/** @type {unknown} */ (tseslint)),
		},
		"rules": {
			...js.configs.recommended.rules,
			...CUSTOM_CONFIG.BASE_RULES,
			...CUSTOM_CONFIG.TS_RULES,
		},
		"settings": {},
	},
]);
