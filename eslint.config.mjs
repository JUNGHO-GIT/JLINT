/**
 * @file eslint.config.mjs
 * @description ESLint Configuration File (Flat Config)
 * @author Jungho
 * @since 2025-12-07
 */

import {
	defineConfig,
} from "eslint/config";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

// 0. 타입 정의 ---------------------------------------------------------------------------------------------
/**
 * @typedef {import("eslint").ESLint.Plugin} Plugin
 * @typedef {import("eslint").Linter.Config} Config
 * @typedef {import("eslint").Linter.RulesRecord} RulesRecord
 * @typedef {import("eslint").Linter.ParserOptions} ParserOptions
 * @typedef {import("eslint").Linter.Config['languageOptions']} LanguageOptions
 * @typedef {import("eslint").Linter.Config['linterOptions']} LinterOptions
 */

// 1. Js 설정 ------------------------------------------------------------------------------------------------
/** @type {RulesRecord} */
const JS_RULES = {
	"accessor-pairs": [
		`error`,
	],
	"array-bracket-newline": [
		`error`,
		{
			"multiline": true,
			"minItems": 1,
		},
	],
	"array-bracket-spacing": [
		`error`,
		`always`,
		{
			"singleValue": true,
			"objectsInArrays": true,
			"arraysInArrays": true,
		},
	],
	"array-callback-return": [
		`error`,
		{
			"allowImplicit": false,
			"checkForEach": true,
		},
	],
	"array-element-newline": [
		`error`,
		{
			"multiline": true,
			"minItems": 1,
		},
	],
	"arrow-body-style": [
		`error`,
		`as-needed`,
	],
	"arrow-parens": [
		`error`,
		`always`,
	],
	"arrow-spacing": [
		`error`,
		{
			"before": true,
			"after": true,
		},
	],
	"block-scoped-var": [
		`error`,
	],
	"block-spacing": [
		`error`,
		`always`,
	],
	"brace-style": [
		`error`,
		`stroustrup`,
		{
			"allowSingleLine": false,
		},
	],
	"camelcase": [
		`error`,
		{
			"properties": `never`,
		},
	],
	"capitalized-comments": [
		`off`,
		`always`,
		{
			"ignorePattern": `eslint|istanbul|ts-ignore|prettier-ignore`,
			"ignoreInlineComments": true,
			"ignoreConsecutiveComments": true,
		},
	],
	"class-methods-use-this": [
		`off`,
		{
			"exceptMethods": [],
			"enforceForClassFields": false,
		},
	],
	"comma-dangle": [
		`error`,
		{
			"arrays": `always-multiline`,
			"objects": `always-multiline`,
			"imports": `always-multiline`,
			"exports": `always-multiline`,
			"functions": `never`,
		},
	],
	"comma-spacing": [
		`error`,
		{
			"before": false,
			"after": true,
		},
	],
	"comma-style": [
		`error`,
		`last`,
	],
	"complexity": [
		`warn`,
		{
			"max": 40,
		},
	],
	"computed-property-spacing": [
		`error`,
		`never`,
		{
			"enforceForClassMembers": true,
		},
	],
	"consistent-return": [
		`error`,
		{
			"treatUndefinedAsUnspecified": false,
		},
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
		`all`,
	],
	"default-case": [
		`error`,
		{
			"commentPattern": `^no default$`,
		},
	],
	"default-case-last": [
		`error`,
	],
	"default-param-last": [
		`off`,
	],
	"dot-location": [
		`error`,
		`property`,
	],
	"dot-notation": [
		`error`,
		{
			"allowKeywords": true,
		},
	],
	"eol-last": [
		`error`,
		`always`,
	],
	"eqeqeq": [
		`error`,
		`always`,
		{
			"null": `ignore`,
		},
	],
	"for-direction": [
		`error`,
	],
	"func-call-spacing": [
		`error`,
		`never`,
	],
	"func-name-matching": [
		`error`,
		`always`,
	],
	"func-names": [
		`warn`,
		`as-needed`,
	],
	"func-style": [
		`error`,
		`expression`,
		{
			"allowArrowFunctions": true,
		},
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
		{
			"before": false,
			"after": true,
		},
	],
	"getter-return": [
		`error`,
		{
			"allowImplicit": false,
		},
	],
	"grouped-accessor-pairs": [
		`error`,
		`getBeforeSet`,
	],
	"guard-for-in": [
		`error`,
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
		{
			"min": 2,
			"max": 40,
			"exceptions": [
				`i`,
				`j`,
				`k`,
				`x`,
				`y`,
				`_`,
			],
		},
	],
	"id-match": [
		`off`,
		`^[_$a-zA-Z][_$a-zA-Z0-9]*$`,
		{
			"properties": false,
			"onlyDeclarations": false,
			"ignoreDestructuring": false,
		},
	],
	"implicit-arrow-linebreak": [
		`error`,
		`beside`,
	],
	"indent": [
		`error`,
		`tab`,
		{
			"SwitchCase": 1,
			"VariableDeclarator": {
				"var": 1,
				"let": 1,
				"const": 1,
			},
			"outerIIFEBody": 1,
			"MemberExpression": 1,
			"FunctionDeclaration": {
				"parameters": 1,
				"body": 1,
			},
			"FunctionExpression": {
				"parameters": 1,
				"body": 1,
			},
			"CallExpression": {
				"arguments": 1,
			},
			"ArrayExpression": 1,
			"ObjectExpression": 1,
			"ImportDeclaration": 1,
			"flatTernaryExpressions": false,
			"offsetTernaryExpressions": true,
			"ignoreComments": false,
		},
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
		{
			"beforeColon": false,
			"afterColon": true,
			"mode": `strict`,
		},
	],
	"keyword-spacing": [
		`error`,
		{
			"before": true,
			"after": true,
			"overrides": {},
		},
	],
	"line-comment-position": [
		`off`,
	],
	"linebreak-style": [
		`error`,
		`unix`,
	],
	"lines-around-comment": [
		`off`,
	],
	"lines-between-class-members": [
		`error`,
		`always`,
	],
	"logical-assignment-operators": [
		`error`,
		`always`,
	],
	"max-classes-per-file": [
		`error`,
		1,
	],
	"max-depth": [
		`warn`,
		4,
	],
	"max-len": [
		`warn`,
		{
			"code": 200,
			"ignoreUrls": true,
			"ignoreStrings": true,
		},
	],
	"max-lines": [
		`off`,
	],
	"max-lines-per-function": [
		`off`,
	],
	"max-nested-callbacks": [
		`off`,
		{
			"max": 3,
		},
	],
	"max-params": [
		`off`,
		{
			"max": 4,
		},
	],
	"max-statements": [
		`off`,
		{
			"max": 40,
		},
	],
	"max-statements-per-line": [
		`error`,
		{
			"max": 1,
		},
	],
	"multiline-comment-style": [
		`off`,
		`starred-block`,
	],
	"multiline-ternary": [
		`off`,
		`always-multiline`,
	],
	"new-cap": [
		`error`,
		{
			"newIsCap": true,
			"capIsNew": false,
			"properties": true,
		},
	],
	"new-parens": [
		`error`,
		`always`,
	],
	"newline-per-chained-call": [
		`error`,
		{
			"ignoreChainWithDepth": 4,
		},
	],
	"no-alert": [
		`warn`,
	],
	"no-array-constructor": [
		`error`,
	],
	"no-async-promise-executor": [
		`error`,
	],
	"no-await-in-loop": [
		`error`,
	],
	"no-bitwise": [
		`off`,
	],
	"no-caller": [
		`error`,
	],
	"no-case-declarations": [
		`error`,
	],
	"no-class-assign": [
		`error`,
	],
	"no-compare-neg-zero": [
		`error`,
	],
	"no-cond-assign": [
		`error`,
		`except-parens`,
	],
	"no-confusing-arrow": [
		`error`,
		{
			"allowParens": true,
		},
	],
	"no-console": [
		`warn`,
		{
			"allow": [
				`warn`,
				`error`,
			],
		},
	],
	"no-const-assign": [
		`error`,
	],
	"no-constant-binary-expression": [
		`error`,
	],
	"no-constant-condition": [
		`warn`,
		{
			"checkLoops": false,
		},
	],
	"no-constructor-return": [
		`error`,
	],
	"no-continue": [
		`off`,
	],
	"no-control-regex": [
		`error`,
	],
	"no-debugger": [
		`error`,
	],
	"no-delete-var": [
		`error`,
	],
	"no-div-regex": [
		`off`,
	],
	"no-dupe-args": [
		`error`,
	],
	"no-dupe-class-members": [
		`error`,
	],
	"no-dupe-else-if": [
		`error`,
	],
	"no-dupe-keys": [
		`error`,
	],
	"no-duplicate-case": [
		`error`,
	],
	"no-duplicate-imports": [
		`off`,
		{
			"includeExports": true,
		},
	],
	"no-else-return": [
		`error`,
		{
			"allowElseIf": false,
		},
	],
	"no-empty": [
		`error`,
		{
			"allowEmptyCatch": true,
		},
	],
	"no-empty-character-class": [
		`error`,
	],
	"no-empty-function": [
		`error`,
		{
			"allow": [],
		},
	],
	"no-empty-pattern": [
		`error`,
		{
			"allowObjectPatternsAsParameters": false,
		},
	],
	"no-empty-static-block": [
		`error`,
	],
	"no-eq-null": [
		`off`,
	],
	"no-eval": [
		`error`,
	],
	"no-ex-assign": [
		`error`,
	],
	"no-extend-native": [
		`error`,
	],
	"no-extra-bind": [
		`error`,
	],
	"no-extra-boolean-cast": [
		`error`,
	],
	"no-extra-label": [
		`error`,
	],
	"no-extra-parens": [
		`off`,
	],
	"no-extra-semi": [
		`error`,
	],
	"no-fallthrough": [
		`error`,
	],
	"no-floating-decimal": [
		`error`,
	],
	"no-func-assign": [
		`error`,
	],
	"no-global-assign": [
		`error`,
	],
	"no-implicit-coercion": [
		`error`,
		{
			"boolean": true,
			"number": true,
			"string": true,
			"allow": [
				`!!`,
				`~`,
			],
		},
	],
	"no-implicit-globals": [
		`off`,
	],
	"no-implied-eval": [
		`error`,
	],
	"no-import-assign": [
		`error`,
	],
	"no-inline-comments": [
		`off`,
	],
	"no-inner-declarations": [
		`error`,
	],
	"no-invalid-regexp": [
		`error`,
	],
	"no-invalid-this": [
		`off`,
	],
	"no-irregular-whitespace": [
		`error`,
	],
	"no-iterator": [
		`error`,
	],
	"no-label-var": [
		`error`,
	],
	"no-labels": [
		`error`,
		{
			"allowLoop": false,
			"allowSwitch": false,
		},
	],
	"no-lone-blocks": [
		`error`,
	],
	"no-lonely-if": [
		`error`,
	],
	"no-loop-func": [
		`error`,
	],
	"no-loss-of-precision": [
		`error`,
	],
	"no-magic-numbers": [
		`off`,
		{
			"ignore": [
				-1,
				0,
				1,
				2,
			],
			"ignoreArrayIndexes": true,
			"enforceConst": true,
			"detectObjects": false,
		},
	],
	"no-misleading-character-class": [
		`error`,
	],
	"no-mixed-operators": [
		`error`,
		{
			"groups": [
				[
					`%`,
					`**`,
				],
				[
					`%`,
					`+`,
				],
				[
					`%`,
					`-`,
				],
				[
					`%`,
					`*`,
				],
				[
					`%`,
					`/`,
				],
				[
					`/`,
					`*`,
				],
				[
					`&`,
					`|`,
					`^`,
					`~`,
					`<<`,
					`>>`,
					`>>>`,
				],
				[
					`==`,
					`!=`,
					`===`,
					`!==`,
					`>`,
					`>=`,
					`<`,
					`<=`,
				],
				[
					`&&`,
					`||`,
				],
				[
					`in`,
					`instanceof`,
				],
			],
			"allowSamePrecedence": true,
		},
	],
	"no-mixed-spaces-and-tabs": [
		`error`,
	],
	"no-multi-assign": [
		`error`,
	],
	"no-multi-spaces": [
		`error`,
		{
			"ignoreEOLComments": false,
		},
	],
	"no-multi-str": [
		`error`,
	],
	"no-multiple-empty-lines": [
		`error`,
		{
			"max": 1,
			"maxEOF": 0,
		},
	],
	"no-negated-condition": [
		`off`,
	],
	"no-nested-ternary": [
		`off`,
	],
	"no-new": [
		`error`,
	],
	"no-new-func": [
		`error`,
	],
	"no-new-native-nonconstructor": [
		`error`,
	],
	"no-new-object": [
		`error`,
	],
	"no-new-symbol": [
		`error`,
	],
	"no-new-wrappers": [
		`error`,
	],
	"no-nonoctal-decimal-escape": [
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
	"no-param-reassign": [
		`error`,
		{
			"props": true,
		},
	],
	"no-plusplus": [
		`off`,
	],
	"no-promise-executor-return": [
		`error`,
	],
	"no-proto": [
		`error`,
	],
	"no-prototype-builtins": [
		`error`,
	],
	"no-redeclare": [
		`error`,
	],
	"no-regex-spaces": [
		`error`,
	],
	"no-restricted-exports": [
		`off`,
	],
	"no-restricted-globals": [
		`off`,
	],
	"no-restricted-imports": [
		`off`,
	],
	"no-restricted-properties": [
		`off`,
	],
	"no-restricted-syntax": [
		`off`,
	],
	"no-return-assign": [
		`error`,
		`always`,
	],
	"no-return-await": [
		`error`,
	],
	"no-script-url": [
		`error`,
	],
	"no-self-assign": [
		`error`,
		{
			"props": true,
		},
	],
	"no-self-compare": [
		`error`,
	],
	"no-sequences": [
		`error`,
	],
	"no-setter-return": [
		`error`,
	],
	"no-shadow": [
		`error`,
	],
	"no-shadow-restricted-names": [
		`error`,
	],
	"no-sparse-arrays": [
		`error`,
	],
	"no-tabs": [
		`off`,
	],
	"no-template-curly-in-string": [
		`error`,
	],
	"no-ternary": [
		`off`,
	],
	"no-this-before-super": [
		`error`,
	],
	"no-throw-literal": [
		`error`,
	],
	"no-trailing-spaces": [
		`error`,
	],
	"no-undef": [
		`error`,
		{
			"typeof": false,
		},
	],
	"no-undef-init": [
		`error`,
	],
	"no-undefined": [
		`off`,
	],
	"no-underscore-dangle": [
		`off`,
	],
	"no-unexpected-multiline": [
		`error`,
	],
	"no-unmodified-loop-condition": [
		`off`,
	],
	"no-unneeded-ternary": [
		`error`,
		{
			"defaultAssignment": false,
		},
	],
	"no-unreachable": [
		`error`,
	],
	"no-unreachable-loop": [
		`error`,
		{
			"ignore": [],
		},
	],
	"no-unsafe-finally": [
		`error`,
	],
	"no-unsafe-negation": [
		`error`,
	],
	"no-unsafe-optional-chaining": [
		`error`,
		{
			"disallowArithmeticOperators": true,
		},
	],
	"no-unused-expressions": [
		`error`,
		{
			"allowShortCircuit": true,
			"allowTernary": true,
		},
	],
	"no-unused-labels": [
		`error`,
	],
	"no-unused-private-class-members": [
		`error`,
	],
	"no-unused-vars": [
		`error`,
	],
	"no-use-before-define": [
		`error`,
		{
			"functions": false,
			"classes": true,
			"variables": false,
		},
	],
	"no-useless-assignment": [
		`error`,
	],
	"no-useless-backreference": [
		`error`,
	],
	"no-useless-call": [
		`error`,
	],
	"no-useless-catch": [
		`error`,
	],
	"no-useless-computed-key": [
		`error`,
	],
	"no-useless-concat": [
		`error`,
	],
	"no-useless-constructor": [
		`error`,
	],
	"no-useless-escape": [
		`error`,
	],
	"no-useless-rename": [
		`error`,
	],
	"no-useless-return": [
		`error`,
	],
	"no-var": [
		`error`,
	],
	"no-void": [
		`error`,
	],
	"no-warning-comments": [
		`off`,
	],
	"no-whitespace-before-property": [
		`error`,
	],
	"no-with": [
		`error`,
	],
	"object-curly-newline": [
		`error`,
		{
			"ObjectExpression": {
				"multiline": true,
				"minProperties": 1,
			},
			"ObjectPattern": {
				"multiline": true,
				"minProperties": 1,
			},
		},
	],
	"object-curly-spacing": [
		`error`,
		`always`,
	],
	"object-property-newline": [
		`error`,
		{
			"allowMultiplePropertiesPerLine": false,
		},
	],
	"object-shorthand": [
		`error`,
		`always`,
		{
			"ignoreConstructors": false,
			"avoidQuotes": true,
		},
	],
	"one-var": [
		`error`,
		`never`,
	],
	"one-var-declaration-per-line": [
		`error`,
		`always`,
	],
	"operator-assignment": [
		`error`,
		`always`,
	],
	"operator-linebreak": [
		`error`,
		`before`,
	],
	"padded-blocks": [
		`error`,
		`never`,
	],
	"padding-line-between-statements": [
		`off`,
	],
	"prefer-arrow-callback": [
		`error`,
	],
	"prefer-const": [
		`error`,
	],
	"prefer-destructuring": [
		`off`,
		{
			"object": true,
			"array": true,
		},
	],
	"prefer-exponentiation-operator": [
		`error`,
	],
	"prefer-named-capture-group": [
		`off`,
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
	"prefer-promise-reject-errors": [
		`error`,
	],
	"prefer-regex-literals": [
		`error`,
	],
	"prefer-rest-params": [
		`error`,
	],
	"prefer-spread": [
		`error`,
	],
	"prefer-template": [
		`error`,
	],
	"quote-props": [
		`error`,
		`always`,
		{
			"keywords": false,
			"unnecessary": false,
			"numbers": false,
		},
	],
	"quotes": [
		`error`,
		`backtick`,
		{
			"avoidEscape": true,
		},
	],
	"radix": [
		`error`,
		`always`,
	],
	"require-atomic-updates": [
		`error`,
		{
			"allowProperties": true,
		},
	],
	"require-await": [
		`off`,
	],
	"require-unicode-regexp": [
		`off`,
	],
	"require-yield": [
		`error`,
	],
	"rest-spread-spacing": [
		`error`,
		`never`,
	],
	"semi": [
		`error`,
		`always`,
	],
	"semi-spacing": [
		`error`,
		{
			"before": false,
			"after": true,
		},
	],
	"semi-style": [
		`error`,
		`last`,
	],
	"sort-imports": [
		`off`,
	],
	"sort-keys": [
		`off`,
	],
	"sort-vars": [
		`off`,
		{
			"ignoreCase": true,
		},
	],
	"space-before-blocks": [
		`error`,
		`always`,
	],
	"space-before-function-paren": [
		`error`,
		{
			"anonymous": `never`,
			"named": `never`,
			"asyncArrow": `always`,
		},
	],
	"space-in-parens": [
		`error`,
		`never`,
	],
	"space-infix-ops": [
		`error`,
		{
			"int32Hint": false,
		},
	],
	"space-unary-ops": [
		`error`,
		{
			"words": true,
			"nonwords": false,
		},
	],
	"spaced-comment": [
		`error`,
		`always`,
		{
			"block": {
				"balanced": true,
			},
		},
	],
	"strict": [
		`error`,
		`never`,
	],
	"switch-colon-spacing": [
		`error`,
		{
			"after": true,
			"before": false,
		},
	],
	"symbol-description": [
		`error`,
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
	],
	"valid-typeof": [
		`error`,
	],
	"vars-on-top": [
		`off`,
	],
	"wrap-iife": [
		`error`,
		`outside`,
		{
			"functionPrototypeMethods": true,
		},
	],
	"wrap-regex": [
		`off`,
	],
	"yield-star-spacing": [
		`error`,
		{
			"before": false,
			"after": true,
		},
	],
	"yoda": [
		`error`,
		`never`,
	],
};

// 2. Ts 설정 ------------------------------------------------------------------------------------------------
/** @type {RulesRecord} */
const TS_RULES = {
	"@typescript-eslint/adjacent-overload-signatures": [
		`error`,
	],
	"@typescript-eslint/array-type": [
		`warn`,
		{
			"default": `array`,
			"readonly": `array`,
		},
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
	"@typescript-eslint/dot-notation": [
		`error`,
	],
	"@typescript-eslint/explicit-function-return-type": [
		`off`,
	],
	"@typescript-eslint/explicit-member-accessibility": [
		`off`,
	],
	"@typescript-eslint/explicit-module-boundary-types": [
		`off`,
	],
	"@typescript-eslint/member-ordering": [
		`off`,
	],
	"@typescript-eslint/method-signature-style": [
		`warn`,
		`property`,
	],
	"@typescript-eslint/naming-convention": [
		`off`,
	],
	"@typescript-eslint/no-array-constructor": [
		`error`,
	],
	"@typescript-eslint/no-array-delete": [
		`error`,
	],
	"@typescript-eslint/no-base-to-string": [
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
		{
			"ignoreIntersections": false,
			"ignoreUnions": false,
		},
	],
	"@typescript-eslint/no-dynamic-delete": [
		`error`,
	],
	"@typescript-eslint/no-empty-function": [
		`error`,
	],
	"@typescript-eslint/no-empty-interface": [
		`error`,
	],
	"@typescript-eslint/no-explicit-any": [
		`warn`,
	],
	"@typescript-eslint/no-extra-non-null-assertion": [
		`error`,
	],
	"@typescript-eslint/no-extraneous-class": [
		`error`,
	],
	"@typescript-eslint/no-floating-promises": [
		`error`,
		{
			"ignoreVoid": true,
			"ignoreIIFE": true,
		},
	],
	"@typescript-eslint/no-for-in-array": [
		`error`,
	],
	"@typescript-eslint/no-implied-eval": [
		`error`,
	],
	"@typescript-eslint/no-import-type-side-effects": [
		`error`,
	],
	"@typescript-eslint/no-inferrable-types": [
		`off`,
	],
	"@typescript-eslint/no-invalid-this": [
		`error`,
		{
			"capIsConstructor": true,
		},
	],
	"@typescript-eslint/no-invalid-void-type": [
		`error`,
	],
	"@typescript-eslint/no-loop-func": [
		`error`,
	],
	"@typescript-eslint/no-loss-of-precision": [
		`error`,
	],
	"@typescript-eslint/no-magic-numbers": [
		`off`,
	],
	"@typescript-eslint/no-meaningless-void-operator": [
		`error`,
	],
	"@typescript-eslint/no-misused-new": [
		`error`,
	],
	"@typescript-eslint/no-misused-promises": [
		`error`,
		{
			"checksVoidReturn": false,
		},
	],
	"@typescript-eslint/no-mixed-enums": [
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
	"@typescript-eslint/no-redundant-type-constituents": [
		`error`,
	],
	"@typescript-eslint/no-require-imports": [
		`error`,
	],
	"@typescript-eslint/no-shadow": [
		`error`,
	],
	"@typescript-eslint/no-this-alias": [
		`error`,
	],
	"@typescript-eslint/no-unnecessary-boolean-literal-compare": [
		`error`,
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
	"@typescript-eslint/no-unnecessary-type-arguments": [
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
	"@typescript-eslint/no-unsafe-unary-minus": [
		`error`,
	],
	"@typescript-eslint/no-unused-expressions": [
		`error`,
		{
			"allowShortCircuit": true,
			"allowTernary": true,
		},
	],
	"@typescript-eslint/no-unused-vars": [
		`error`,
	],
	"@typescript-eslint/no-use-before-define": [
		`error`,
	],
	"@typescript-eslint/no-useless-constructor": [
		`error`,
	],
	"@typescript-eslint/no-useless-empty-export": [
		`error`,
	],
	"@typescript-eslint/non-nullable-type-assertion-style": [
		`off`,
	],
	"@typescript-eslint/parameter-properties": [
		`off`,
	],
	"@typescript-eslint/prefer-as-const": [
		`warn`,
	],
	"@typescript-eslint/prefer-destructuring": [
		`off`,
	],
	"@typescript-eslint/prefer-enum-initializers": [
		`off`,
	],
	"@typescript-eslint/prefer-find": [
		`error`,
	],
	"@typescript-eslint/prefer-for-of": [
		`warn`,
	],
	"@typescript-eslint/prefer-function-type": [
		`error`,
	],
	"@typescript-eslint/prefer-includes": [
		`warn`,
	],
	"@typescript-eslint/prefer-literal-enum-member": [
		`error`,
	],
	"@typescript-eslint/prefer-namespace-keyword": [
		`error`,
	],
	"@typescript-eslint/prefer-nullish-coalescing": [
		`error`,
	],
	"@typescript-eslint/prefer-optional-chain": [
		`warn`,
	],
	"@typescript-eslint/prefer-promise-reject-errors": [
		`error`,
	],
	"@typescript-eslint/prefer-readonly": [
		`error`,
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
		`error`,
	],
	"@typescript-eslint/promise-function-async": [
		`off`,
	],
	"@typescript-eslint/require-array-sort-compare": [
		`off`,
	],
	"@typescript-eslint/require-await": [
		`off`,
	],
	"@typescript-eslint/restrict-plus-operands": [
		`error`,
		{
			"skipCompoundAssignments": false,
		},
	],
	"@typescript-eslint/restrict-template-expressions": [
		`warn`,
		{
			"allowNumber": true,
		},
	],
	"@typescript-eslint/return-await": [
		`error`,
	],
	"@typescript-eslint/strict-boolean-expressions": [
		`off`,
	],
	"@typescript-eslint/switch-exhaustiveness-check": [
		`error`,
	],
	"@typescript-eslint/unbound-method": [
		`error`,
	],
	"@typescript-eslint/unified-signatures": [
		`error`,
	],
};

// 3. 최종 설정 병합 ----------------------------------------------------------------------------------------
/** @type {import('eslint-define-config').ESLintConfig[]} */
export default defineConfig([

	// 1. Ignore 패턴 ---------------------------------------------------------------------------------
	{
		"ignores": [
			`**/node_modules/**`,
			`**/dist/**`,
			`**/build/**`,
			`**/.next/**`,
			`**/.turbo/**`,
			`**/coverage/**`,
			`**/.git/**`,
			`**/.cache/**`,
			`**/out/**`,
			`**/vendor/**`,
			`coverage/**`,
			`!**/*.d.ts`,
		],
	},

	// 2. Js 설정 -------------------------------------------------------------------------------------
	{
		"files": [
			`**/*.js`,
			`**/*.mjs`,
			`**/*.cjs`,
			`**/*.jsx`,
		],
		"linterOptions": {
			"noInlineConfig": false,
			"reportUnusedDisableDirectives": `error`,
			"reportUnusedInlineConfigs": `error`,
		},
		"rules": {
			...js.configs.recommended.rules,
			...JS_RULES,
		},
		"plugins": {},
		"settings": {},
		"languageOptions": {
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
					"impliedStrict": true,
				},
				"lib": [
					`es2022`,
				],
				"cacheLifetime": {
					"glob": `Infinity`,
				},
				"allowImportExportEverywhere": false,
				"extraFileExtensions": [],
			},
		},
	},

	// 3. Ts 설정 -------------------------------------------------------------------------------------
	{
		"files": [
			`**/*.ts`,
			`**/*.tsx`,
			`**/*.mts`,
			`**/*.cts`,
		],
		"linterOptions": {
			"noInlineConfig": false,
			"reportUnusedDisableDirectives": `error`,
			"reportUnusedInlineConfigs": `error`,
		},
		"rules": {
			...js.configs.recommended.rules,
			...JS_RULES,
			...TS_RULES,
		},
		"plugins": {
			"@typescript-eslint": tseslint,
		},
		"settings": {},
		"languageOptions": {
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
				"ecmaFeatures": {
					"jsx": true,
					"globalReturn": false,
					"impliedStrict": true,
				},
				"lib": [
					`es2022`,
				],
				"cacheLifetime": {
					"glob": `Infinity`,
				},
				"allowImportExportEverywhere": false,
				"extraFileExtensions": [],
				// 타입 정보 사용 룰용 옵션
				"projectService": true,
				"tsconfigRootDir": import.meta.dirname,
				"warnOnUnsupportedTypeScriptVersion": true,
				// TS 파서 확장 옵션
				"emitDecoratorMetadata": true,
				"experimentalDecorators": true,
				"disallowAutomaticSingleRunInference": false,
				"jsDocParsingMode": `all`,
				"jsxPragma": `React`,
				"jsxFragmentName": null,
			},
		},
	},
]);
