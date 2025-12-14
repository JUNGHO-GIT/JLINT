/**
 * @file eslint.config.mjs
 * @description ESLint Configuration File (Flat Config)
 * @author Jungho
 * @since 2025-12-07
 */

// @ts-check
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";
import stylistic from "@stylistic/eslint-plugin";
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
	// 1-1. array
	"array-callback-return": [
		`error`,
		{
			allowImplicit: false,
			checkForEach: true,
			allowVoid: false,
		},
	],
	"no-array-constructor": [`error`], // no options
	"no-sparse-arrays": [`error`], // no options

	// 1-2. object
	"accessor-pairs": [
		`error`,
		{
			setWithoutGet: true,
			getWithoutSet: false,
			enforceForClassMembers: true,
		},
	],
	"dot-notation": [
		`error`,
		{
			allowKeywords: true,
			allowPattern: ``,
		},
	],
	"grouped-accessor-pairs": [`error`, `getBeforeSet`],
	"no-extend-native": [
		`error`,
		{
			exceptions: [],
		},
	],
	"no-iterator": [`error`], // no options
	"no-new-object": [`error`], // no options
	"no-proto": [`error`], // no options
	"no-prototype-builtins": [`error`], // no options
	"object-shorthand": [`error`, `never`],
	"prefer-object-has-own": [`error`], // no options
	"prefer-object-spread": [`error`], // no options

	// 1-3. function
	"arrow-body-style": [
		`error`,
		`as-needed`,
		{
			requireReturnForObjectLiteral: false,
		},
	],
	"func-name-matching": [
		`error`,
		`always`,
		{
			considerPropertyDescriptor: false,
			includeCommonJSModuleExports: false,
		},
	],
	"func-names": [
		`warn`,
		`as-needed`,
		{
			generators: `as-needed`,
		},
	],
	"func-style": [
		`error`,
		`expression`,
		{
			allowArrowFunctions: true,
			overrides: {},
		},
	],
	"getter-return": [
		`error`,
		{
			allowImplicit: false,
		},
	],
	"no-caller": [`error`], // no options
	"no-empty-function": [
		`error`,
		{
			allow: [],
		},
	],
	"no-extra-bind": [`error`], // no options
	"no-func-assign": [`error`], // no options
	"no-loop-func": [`error`], // no options
	"no-new-func": [`error`], // no options
	"no-return-assign": [`error`, `always`],
	"no-return-await": [`error`], // no options
	"prefer-arrow-callback": [
		`error`,
		{
			allowNamedFunctions: false,
			allowUnboundThis: true,
		},
	],
	"prefer-rest-params": [`error`], // no options
	"prefer-spread": [`error`], // no options

	// 1-4. class
	"class-methods-use-this": [
		`off`,
		{
			exceptMethods: [],
			enforceForClassFields: true,
		},
	],
	"constructor-super": [`error`], // no options
	"max-classes-per-file": [
		`error`,
		{
			max: 1,
			ignoreExpressions: false,
		},
	],
	"new-cap": [
		`error`,
		{
			newIsCap: true,
			capIsNew: false,
			newIsCapExceptions: [],
			newIsCapExceptionPattern: ``,
			capIsNewExceptions: [],
			capIsNewExceptionPattern: ``,
			properties: true,
		},
	],
	"no-class-assign": [`error`], // no options
	"no-constructor-return": [`error`], // no options
	"no-dupe-class-members": [`error`], // no options
	"no-new": [`error`], // no options
	"no-new-native-nonconstructor": [`error`], // no options
	"no-new-symbol": [`error`], // no options
	"no-new-wrappers": [`error`], // no options
	"no-this-before-super": [`error`], // no options
	"no-useless-constructor": [`error`], // no options

	// 1-5. variable
	"block-scoped-var": [`error`], // no options
	"init-declarations": [
		`off`,
		`always`,
		{
			ignoreForLoopInit: false,
		},
	],
	"no-const-assign": [`error`], // no options
	"no-delete-var": [`error`], // no options
	"no-global-assign": [
		`error`,
		{
			exceptions: [],
		},
	],
	"no-import-assign": [`error`], // no options
	"no-label-var": [`error`], // no options
	"no-multi-assign": [
		`error`,
		{
			ignoreNonDeclaration: false,
		},
	],
	"no-redeclare": [
		`error`,
		{
			builtinGlobals: true,
		},
	],
	"no-shadow": [
		`error`,
		{
			builtinGlobals: false,
			hoist: `functions`,
			allow: [],
			ignoreOnInitialization: false,
		},
	],
	"no-shadow-restricted-names": [`error`], // no options
	"no-undef": [
		`error`,
		{
			typeof: false,
		},
	],
	"no-undef-init": [`error`], // no options
	"no-undefined": [`off`], // no options
	"no-underscore-dangle": [
		`off`,
		{
			allow: [],
			allowAfterThis: false,
			allowAfterSuper: false,
			allowAfterThisConstructor: false,
			enforceInMethodNames: false,
			enforceInClassFields: false,
			allowInArrayDestructuring: true,
			allowInObjectDestructuring: true,
			allowFunctionParams: true,
		},
	],
	"no-unused-vars": [
		`error`,
		{
			vars: `all`,
			varsIgnorePattern: ``,
			args: `after-used`,
			argsIgnorePattern: ``,
			caughtErrors: `all`,
			caughtErrorsIgnorePattern: ``,
			destructuredArrayIgnorePattern: ``,
			ignoreRestSiblings: false,
			ignoreClassWithStaticInitBlock: false,
			reportUsedIgnorePattern: false,
		},
	],
	"no-use-before-define": [
		`error`,
		{
			functions: false,
			classes: true,
			variables: false,
			allowNamedExports: false,
		},
	],
	"no-useless-assignment": [`error`], // no options
	"no-var": [`error`], // no options
	"one-var": [`error`, `never`],
	"operator-assignment": [`error`, `always`],
	"prefer-const": [
		`error`,
		{
			destructuring: `any`,
			ignoreReadBeforeAssign: false,
		},
	],
	"prefer-destructuring": [
		`off`,
		{
			VariableDeclarator: {
				array: true,
				object: true,
			},
			AssignmentExpression: {
				array: true,
				object: true,
			},
		},
		{
			enforceForRenamedProperties: false,
		},
	],
	"vars-on-top": [`off`], // no options

	// 1-6. async
	"no-async-promise-executor": [`error`], // no options
	"no-await-in-loop": [`error`], // no options
	"no-promise-executor-return": [
		`error`,
		{
			allowVoid: false,
		},
	],
	"prefer-promise-reject-errors": [
		`error`,
		{
			allowEmptyReject: false,
		},
	],
	"require-atomic-updates": [
		`error`,
		{
			allowProperties: true,
		},
	],
	"require-await": [`off`], // no options

	// 1-7. control-flow
	"consistent-return": [
		`error`,
		{
			treatUndefinedAsUnspecified: false,
		},
	],
	curly: [`error`, `all`],
	"default-case": [
		`error`,
		{
			commentPattern: `^no default$`,
		},
	],
	"default-case-last": [`error`], // no options
	"default-param-last": [`off`], // no options
	"for-direction": [`error`], // no options
	"guard-for-in": [`error`], // no options
	"no-case-declarations": [`error`], // no options
	"no-cond-assign": [`error`, `except-parens`],
	"no-constant-binary-expression": [`error`], // no options
	"no-constant-condition": [
		`warn`,
		{
			checkLoops: false,
		},
	],
	"no-continue": [`off`], // no options
	"no-dupe-else-if": [`error`], // no options
	"no-duplicate-case": [`error`], // no options
	"no-else-return": [
		`error`,
		{
			allowElseIf: false,
		},
	],
	"no-empty": [
		`error`,
		{
			allowEmptyCatch: true,
		},
	],
	"no-empty-pattern": [
		`error`,
		{
			allowObjectPatternsAsParameters: false,
		},
	],
	"no-extra-boolean-cast": [
		`error`,
		{
			enforceForInnerExpressions: false,
		},
	],
	"no-extra-label": [`error`], // no options
	"no-fallthrough": [
		`error`,
		{
			commentPattern: ``,
			allowEmptyCase: false,
			reportUnusedFallthroughComment: false,
		},
	],
	"no-labels": [
		`error`,
		{
			allowLoop: false,
			allowSwitch: false,
		},
	],
	"no-lone-blocks": [`error`], // no options
	"no-lonely-if": [`error`], // no options
	"no-unreachable": [`error`], // no options
	"no-unreachable-loop": [`error`, {}],
	"no-unsafe-finally": [`error`], // no options
	"no-useless-catch": [`error`], // no options
	"no-useless-return": [`error`], // no options
	yoda: [
		`error`,
		`never`,
		{
			exceptRange: false,
			onlyEquality: false,
		},
	],

	// 1-8. expression
	eqeqeq: [
		`error`,
		`always`,
		{
			null: `ignore`,
		},
	],
	"logical-assignment-operators": [
		`error`,
		`always`,
		{
			enforceForIfStatements: false,
		},
	],
	"no-bitwise": [
		`off`,
		{
			allow: [],
			int32Hint: false,
		},
	],
	"no-compare-neg-zero": [`error`], // no options
	"no-eq-null": [`off`], // no options
	"no-eval": [
		`error`,
		{
			allowIndirect: false,
		},
	],
	"no-implicit-coercion": [
		`error`,
		{
			boolean: true,
			number: true,
			string: true,
			disallowTemplateShorthand: false,
			allow: [`!!`, `~`],
		},
	],
	"no-implied-eval": [`error`], // no options
	"no-nested-ternary": [`off`], // no options
	"no-plusplus": [
		`off`,
		{
			allowForLoopAfterthoughts: false,
		},
	],
	"no-script-url": [`error`], // no options
	"no-self-assign": [
		`error`,
		{
			props: true,
		},
	],
	"no-self-compare": [`error`], // no options
	"no-sequences": [
		`error`,
		{
			allowInParentheses: true,
		},
	],
	"no-ternary": [`off`], // no options
	"no-throw-literal": [`error`], // no options
	"no-unneeded-ternary": [
		`error`,
		{
			defaultAssignment: false,
		},
	],
	"no-unsafe-negation": [
		`error`,
		{
			enforceForOrderingRelations: false,
		},
	],
	"no-unsafe-optional-chaining": [
		`error`,
		{
			disallowArithmeticOperators: true,
		},
	],
	"no-unused-expressions": [
		`error`,
		{
			allowShortCircuit: true,
			allowTernary: true,
			allowTaggedTemplates: false,
			enforceForJSX: false,
		},
	],
	"no-useless-call": [`error`], // no options
	"no-useless-computed-key": [
		`error`,
		{
			enforceForClassMembers: true,
		},
	],
	"no-useless-concat": [`error`], // no options
	"no-useless-rename": [
		`error`,
		{
			ignoreImport: false,
			ignoreExport: false,
			ignoreDestructuring: false,
		},
	],
	"no-void": [
		`error`,
		{
			allowAsStatement: false,
		},
	],
	"prefer-exponentiation-operator": [`error`], // no options

	// 1-9. string / regex / template
	"no-control-regex": [`error`], // no options
	"no-div-regex": [`off`], // no options
	"no-empty-character-class": [`error`], // no options
	"no-invalid-regexp": [
		`error`,
		{
			allowConstructorFlags: [],
		},
	],
	"no-misleading-character-class": [
		`error`,
		{
			allowEscape: false,
		},
	],
	"no-multi-str": [`error`], // no options
	"no-regex-spaces": [`error`], // no options
	"no-template-curly-in-string": [`error`], // no options
	"no-useless-backreference": [`error`], // no options
	"no-useless-escape": [`error`], // no options
	"prefer-named-capture-group": [`off`], // no options
	"prefer-numeric-literals": [`error`], // no options
	"prefer-regex-literals": [
		`error`,
		{
			disallowRedundantWrapping: false,
		},
	],
	"prefer-template": [`error`], // no options
	"require-unicode-regexp": [
		`off`,
		{
			requireFlag: `u`,
		},
	],

	// 1-10. module / import / export
	"no-duplicate-imports": [
		`off`,
		{
			includeExports: true,
		},
	],
	"no-implicit-globals": [
		`off`,
		{
			lexicalBindings: false,
		},
	],
	"no-restricted-exports": [
		`off`,
		{
			restrictedNamedExports: [],
			restrictedNamedExportsPattern: ``,
			restrictDefaultExports: {},
		},
	],
	"no-restricted-globals": [`off`], // options: list of restricted global names
	"no-restricted-imports": [
		`off`,
		{
			paths: [],
			patterns: [],
		},
	],
	"no-restricted-properties": [`off`], // options: list of restricted properties
	"no-restricted-syntax": [`off`], // options: list of restricted syntax selectors
	"sort-imports": [
		`off`,
		{
			ignoreCase: false,
			ignoreDeclarationSort: false,
			ignoreMemberSort: false,
			memberSyntaxSortOrder: [
				`none`,
				`all`,
				`multiple`,
				`single`,
			],
			allowSeparatedGroups: false,
		},
	],
	strict: [`error`, `never`],

	// 1-11. naming
	camelcase: [
		`error`,
		{
			properties: `never`,
			ignoreDestructuring: false,
			ignoreImports: false,
			ignoreGlobals: false,
			allow: [],
		},
	],
	"capitalized-comments": [
		`off`,
		`always`,
		{
			ignorePattern: `eslint|istanbul|ts-ignore|prettier-ignore`,
			ignoreInlineComments: true,
			ignoreConsecutiveComments: true,
		},
	],
	"consistent-this": [`off`, `self`],
	"id-blacklist": [`off`], // deprecated, use id-denylist
	"id-denylist": [`off`], // options: list of denied identifiers
	"id-length": [
		`off`,
		{
			min: 3,
			max: 40,
			properties: `always`,
			exceptions: [
				`i`,
				`j`,
				`k`,
				`x`,
				`y`,
				`_`,
			],
			exceptionPatterns: [],
		},
	],
	"id-match": [
		`off`,
		`^[_$a-zA-Z][_$a-zA-Z0-9]*$`,
		{
			properties: false,
			classFields: false,
			onlyDeclarations: false,
			ignoreDestructuring: false,
		},
	],

	// 1-12. debug / error
	"handle-callback-err": [`off`, `^(err|error)$`], // deprecated
	"no-alert": [`warn`], // no options
	"no-console": [
		`warn`,
		{
			allow: [`warn`, `error`],
		},
	],
	"no-debugger": [`error`], // no options
	"no-dupe-args": [`error`], // no options
	"no-dupe-keys": [`error`], // no options
	"no-empty-static-block": [`error`], // no options
	"no-ex-assign": [`error`], // no options
	"no-inner-declarations": [`error`, `functions`],
	"no-invalid-this": [
		`off`,
		{
			capIsConstructor: true,
		},
	],
	"no-irregular-whitespace": [
		`error`,
		{
			skipStrings: true,
			skipComments: false,
			skipRegExps: false,
			skipTemplates: false,
			skipJSXText: false,
		},
	],
	"no-loss-of-precision": [`error`], // no options
	"no-nonoctal-decimal-escape": [`error`], // no options
	"no-obj-calls": [`error`], // no options
	"no-octal": [`error`], // no options
	"no-octal-escape": [`error`], // no options
	"no-param-reassign": [
		`error`,
		{
			props: true,
			ignorePropertyModificationsFor: [],
			ignorePropertyModificationsForRegex: [],
		},
	],
	"no-setter-return": [`error`], // no options
	"no-unexpected-multiline": [`error`], // no options
	"no-unmodified-loop-condition": [`off`], // no options
	"no-unused-labels": [`error`], // no options
	"no-unused-private-class-members": [`error`], // no options
	"no-with": [`error`], // no options
	radix: [`error`, `always`],
	"require-yield": [`error`], // no options
	"symbol-description": [`error`], // no options
	"unicode-bom": [`error`, `never`],
	"use-isnan": [
		`error`,
		{
			enforceForSwitchCase: true,
			enforceForIndexOf: false,
		},
	],
	"valid-typeof": [
		`error`,
		{
			requireStringLiterals: true,
		},
	],

	// 1-13. complexity
	complexity: [
		`warn`,
		{
			max: 40,
			variant: `classic`,
		},
	],
	"max-depth": [
		`warn`,
		{
			max: 4,
		},
	],
	"max-lines": [
		`off`,
		{
			max: 300,
			skipBlankLines: true,
			skipComments: true,
		},
	],
	"max-lines-per-function": [
		`off`,
		{
			max: 50,
			skipBlankLines: false,
			skipComments: false,
			IIFEs: false,
		},
	],
	"max-nested-callbacks": [
		`off`,
		{
			max: 3,
		},
	],
	"max-params": [
		`off`,
		{
			max: 4,
		},
	],
	"max-statements": [
		`off`,
		{
			max: 40,
		},
		{
			ignoreTopLevelFunctions: false,
		},
	],
	"no-magic-numbers": [
		`off`,
		{
			ignore: [
				-1,
				0,
				1,
				3,
			],
			ignoreArrayIndexes: true,
			ignoreDefaultValues: false,
			ignoreClassFieldInitialValues: false,
			enforceConst: true,
			detectObjects: false,
		},
	],
	"sort-keys": [
		`off`,
		`asc`,
		{
			caseSensitive: true,
			natural: false,
			minKeys: 3,
			allowLineSeparatedGroups: false,
		},
	],
	"sort-vars": [
		`off`,
		{
			ignoreCase: true,
		},
	],
};

// 2. Ts 설정 ------------------------------------------------------------------------------------------------
/** @type {RulesRecord} */
const TS_RULES = {
	// 2-1. type-safety
	"@typescript-eslint/await-thenable": [`error`], // no options
	"@typescript-eslint/no-floating-promises": [
		`error`,
		{
			ignoreVoid: true,
			ignoreIIFE: true,
			allowForKnownSafePromises: [],
			allowForKnownSafeCalls: [],
		},
	],
	"@typescript-eslint/no-misused-promises": [
		`error`,
		{
			checksConditionals: true,
			checksVoidReturn: false,
			checksSpreads: true,
		},
	],
	"@typescript-eslint/no-unsafe-argument": [`error`], // no options
	"@typescript-eslint/no-unsafe-assignment": [`error`], // no options
	"@typescript-eslint/no-unsafe-call": [`error`], // no options
	"@typescript-eslint/no-unsafe-declaration-merging": [`error`], // no options
	"@typescript-eslint/no-unsafe-enum-comparison": [`error`], // no options
	"@typescript-eslint/no-unsafe-function-type": [`error`], // no options
	"@typescript-eslint/no-unsafe-member-access": [`error`], // no options
	"@typescript-eslint/no-unsafe-return": [`error`], // no options
	"@typescript-eslint/no-unsafe-unary-minus": [`error`], // no options
	"@typescript-eslint/switch-exhaustiveness-check": [
		`error`,
		{
			allowDefaultCaseForExhaustiveSwitch: true,
			requireDefaultForNonUnion: false,
			considerDefaultExhaustiveForUnions: false,
		},
	],
	"@typescript-eslint/unbound-method": [
		`error`,
		{
			ignoreStatic: false,
		},
	],

	// 2-2. consistency
	"@typescript-eslint/adjacent-overload-signatures": [`error`], // no options
	"@typescript-eslint/array-type": [
		`warn`,
		{
			default: `array`,
			readonly: `array`,
		},
	],
	"@typescript-eslint/consistent-generic-constructors": [`off`, `constructor`],
	"@typescript-eslint/consistent-indexed-object-style": [`warn`, `record`],
	"@typescript-eslint/consistent-type-assertions": [
		`error`,
		{
			assertionStyle: `as`,
			objectLiteralTypeAssertions: `allow`,
			arrayLiteralTypeAssertions: `allow`,
		},
	],
	"@typescript-eslint/consistent-type-definitions": [`off`, `interface`],
	"@typescript-eslint/consistent-type-exports": [
		`off`,
		{
			fixMixedExportsWithInlineTypeSpecifier: false,
		},
	],
	"@typescript-eslint/consistent-type-imports": [
		`off`,
		{
			prefer: `type-imports`,
			disallowTypeAnnotations: true,
			fixStyle: `separate-type-imports`,
		},
	],
	"@typescript-eslint/dot-notation": [
		`error`,
		{
			allowKeywords: true,
			allowPattern: ``,
			allowPrivateClassPropertyAccess: false,
			allowProtectedClassPropertyAccess: false,
			allowIndexSignaturePropertyAccess: false,
		},
	],
	"@typescript-eslint/member-ordering": [
		`off`,
		{
			default: [],
		},
	],
	"@typescript-eslint/method-signature-style": [`warn`, `property`],
	"@typescript-eslint/unified-signatures": [
		`error`,
		{
			ignoreDifferentlyNamedParameters: false,
		},
	],

	// 2-3. ban / guard
	"@typescript-eslint/ban-ts-comment": [
		`error`,
		{
			"ts-expect-error": `allow-with-description`,
			"ts-ignore": true,
			"ts-nocheck": true,
			"ts-check": false,
			minimumDescriptionLength: 3,
		},
	],
	"@typescript-eslint/ban-tslint-comment": [`warn`], // no options
	"@typescript-eslint/no-array-constructor": [`error`], // no options
	"@typescript-eslint/no-array-delete": [`error`], // no options
	"@typescript-eslint/no-base-to-string": [
		`error`,
		{
			ignoredTypeNames: [`RegExp`],
		},
	],
	"@typescript-eslint/no-confusing-non-null-assertion": [`error`], // no options
	"@typescript-eslint/no-confusing-void-expression": [
		`error`,
		{
			ignoreArrowShorthand: false,
			ignoreVoidOperator: false,
			ignoreVoidReturningFunctions: false,
		},
	],
	"@typescript-eslint/no-duplicate-enum-values": [`error`], // no options
	"@typescript-eslint/no-duplicate-type-constituents": [
		`error`,
		{
			ignoreIntersections: false,
			ignoreUnions: false,
		},
	],
	"@typescript-eslint/no-dynamic-delete": [`error`], // no options
	"@typescript-eslint/no-empty-function": [
		`error`,
		{
			allow: [],
		},
	],
	"@typescript-eslint/no-empty-interface": [
		`error`,
		{
			allowSingleExtends: false,
		},
	],
	"@typescript-eslint/no-extra-non-null-assertion": [`error`], // no options
	"@typescript-eslint/no-extraneous-class": [
		`error`,
		{
			allowConstructorOnly: false,
			allowEmpty: false,
			allowStaticOnly: false,
			allowWithDecorator: false,
		},
	],
	"@typescript-eslint/no-for-in-array": [`error`], // no options
	"@typescript-eslint/no-implied-eval": [`error`], // no options
	"@typescript-eslint/no-import-type-side-effects": [`error`], // no options
	"@typescript-eslint/no-invalid-this": [
		`error`,
		{
			capIsConstructor: true,
		},
	],
	"@typescript-eslint/no-invalid-void-type": [
		`error`,
		{
			allowInGenericTypeArguments: true,
			allowAsThisParameter: false,
		},
	],
	"@typescript-eslint/no-loop-func": [`error`], // no options
	"@typescript-eslint/no-meaningless-void-operator": [
		`error`,
		{
			checkNever: false,
		},
	],
	"@typescript-eslint/no-misused-new": [`error`], // no options
	"@typescript-eslint/no-mixed-enums": [`error`], // no options
	"@typescript-eslint/no-namespace": [
		`error`,
		{
			allowDeclarations: false,
			allowDefinitionFiles: true,
		},
	],
	"@typescript-eslint/no-non-null-asserted-nullish-coalescing": [`error`], // no options
	"@typescript-eslint/no-non-null-asserted-optional-chain": [`error`], // no options
	"@typescript-eslint/no-redundant-type-constituents": [`error`], // no options
	"@typescript-eslint/no-require-imports": [
		`error`,
		{
			allow: [],
			allowAsImport: false,
		},
	],
	"@typescript-eslint/no-shadow": [
		`error`,
		{
			builtinGlobals: false,
			hoist: `functions`,
			allow: [],
			ignoreOnInitialization: false,
			ignoreTypeValueShadow: true,
			ignoreFunctionTypeParameterNameValueShadow: true,
		},
	],
	"@typescript-eslint/no-this-alias": [
		`error`,
		{
			allowDestructuring: true,
			allowedNames: [],
		},
	],
	"@typescript-eslint/no-unnecessary-boolean-literal-compare": [
		`error`,
		{
			allowComparingNullableBooleansToTrue: true,
			allowComparingNullableBooleansToFalse: true,
		},
	],
	"@typescript-eslint/no-useless-constructor": [`error`], // no options
	"@typescript-eslint/no-useless-empty-export": [`error`], // no options

	// 2-4. lint-parity (js 규칙 override)
	"@typescript-eslint/no-loss-of-precision": [`error`], // no options
	"@typescript-eslint/no-unused-expressions": [
		`error`,
		{
			allowShortCircuit: true,
			allowTernary: true,
			allowTaggedTemplates: false,
			enforceForJSX: false,
		},
	],
	"@typescript-eslint/no-unused-vars": [
		`error`,
		{
			vars: `all`,
			varsIgnorePattern: ``,
			args: `after-used`,
			argsIgnorePattern: ``,
			caughtErrors: `all`,
			caughtErrorsIgnorePattern: ``,
			destructuredArrayIgnorePattern: ``,
			ignoreRestSiblings: false,
			ignoreClassWithStaticInitBlock: false,
			reportUsedIgnorePattern: false,
		},
	],
	"@typescript-eslint/no-use-before-define": [
		`error`,
		{
			functions: true,
			classes: true,
			variables: true,
			allowNamedExports: false,
			enums: true,
			typedefs: true,
			ignoreTypeReferences: true,
		},
	],

	// 2-5. preference
	"@typescript-eslint/no-explicit-any": [
		`warn`,
		{
			fixToUnknown: false,
			ignoreRestArgs: false,
		},
	],
	"@typescript-eslint/no-non-null-assertion": [`warn`], // no options
	"@typescript-eslint/no-unnecessary-condition": [
		`warn`,
		{
			allowConstantLoopConditions: false,
			allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
			checkTypePredicates: false,
		},
	],
	"@typescript-eslint/no-unnecessary-parameter-property-assignment": [`warn`], // no options
	"@typescript-eslint/no-unnecessary-qualifier": [`warn`], // no options
	"@typescript-eslint/no-unnecessary-template-expression": [`warn`], // no options
	"@typescript-eslint/no-unnecessary-type-arguments": [`warn`], // no options
	"@typescript-eslint/no-unnecessary-type-assertion": [
		`warn`,
		{
			typesToIgnore: [],
		},
	],
	"@typescript-eslint/no-unnecessary-type-constraint": [`warn`], // no options
	"@typescript-eslint/prefer-as-const": [`warn`], // no options
	"@typescript-eslint/prefer-find": [`error`], // no options
	"@typescript-eslint/prefer-for-of": [`warn`], // no options
	"@typescript-eslint/prefer-function-type": [`error`], // no options
	"@typescript-eslint/prefer-includes": [`warn`], // no options
	"@typescript-eslint/prefer-literal-enum-member": [
		`error`,
		{
			allowBitwiseExpressions: false,
		},
	],
	"@typescript-eslint/prefer-namespace-keyword": [`error`], // no options
	"@typescript-eslint/prefer-nullish-coalescing": [
		`error`,
		{
			ignoreTernaryTests: false,
			ignoreConditionalTests: false,
			ignoreMixedLogicalExpressions: false,
			ignorePrimitives: {
				bigint: false,
				boolean: false,
				number: false,
				string: false,
			},
			allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
		},
	],
	"@typescript-eslint/prefer-optional-chain": [
		`warn`,
		{
			checkAny: true,
			checkUnknown: true,
			checkString: true,
			checkNumber: true,
			checkBoolean: true,
			checkBigInt: true,
			requireNullish: false,
			allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
		},
	],
	"@typescript-eslint/prefer-promise-reject-errors": [
		`error`,
		{
			allowEmptyReject: false,
		},
	],
	"@typescript-eslint/prefer-readonly": [
		`error`,
		{
			onlyInlineLambdas: false,
		},
	],
	"@typescript-eslint/prefer-reduce-type-parameter": [`warn`], // no options
	"@typescript-eslint/prefer-string-starts-ends-with": [
		`error`,
		{
			allowSingleElementEquality: `never`,
		},
	],
	"@typescript-eslint/restrict-plus-operands": [
		`error`,
		{
			allowAny: false,
			allowBoolean: false,
			allowNullish: false,
			allowNumberAndString: false,
			allowRegExp: false,
			skipCompoundAssignments: false,
		},
	],
	"@typescript-eslint/restrict-template-expressions": [
		`warn`,
		{
			allowAny: false,
			allowBoolean: false,
			allowNullish: false,
			allowNumber: true,
			allowRegExp: false,
			allowNever: false,
		},
	],
	"@typescript-eslint/return-await": [`error`, `in-try-catch`],

	// 2-6. off
	"@typescript-eslint/class-literal-property-style": [`off`, `fields`],
	"@typescript-eslint/explicit-function-return-type": [
		`off`,
		{
			allowExpressions: false,
			allowTypedFunctionExpressions: true,
			allowHigherOrderFunctions: true,
			allowDirectConstAssertionInArrowFunctions: true,
			allowConciseArrowFunctionExpressionsStartingWithVoid: false,
			allowFunctionsWithoutTypeParameters: false,
			allowedNames: [],
			allowIIFEs: false,
		},
	],
	"@typescript-eslint/explicit-member-accessibility": [
		`off`,
		{
			accessibility: `explicit`,
			ignoredMethodNames: [],
			overrides: {},
		},
	],
	"@typescript-eslint/explicit-module-boundary-types": [
		`off`,
		{
			allowArgumentsExplicitlyTypedAsAny: false,
			allowDirectConstAssertionInArrowFunctions: true,
			allowedNames: [],
			allowHigherOrderFunctions: true,
			allowTypedFunctionExpressions: true,
		},
	],
	"@typescript-eslint/naming-convention": [`off`], // complex options
	"@typescript-eslint/no-inferrable-types": [
		`off`,
		{
			ignoreParameters: false,
			ignoreProperties: false,
		},
	],
	"@typescript-eslint/no-magic-numbers": [
		`off`,
		{
			ignoreArrayIndexes: false,
			ignoreDefaultValues: false,
			ignoreClassFieldInitialValues: false,
			enforceConst: false,
			detectObjects: false,
			ignoreEnums: false,
			ignoreNumericLiteralTypes: false,
			ignoreReadonlyClassProperties: false,
			ignoreTypeIndexes: false,
		},
	],
	"@typescript-eslint/non-nullable-type-assertion-style": [`off`], // no options
	"@typescript-eslint/parameter-properties": [
		`off`,
		{
			allow: [],
			prefer: `class-property`,
		},
	],
	"@typescript-eslint/prefer-destructuring": [
		`off`,
		{
			VariableDeclarator: {
				array: true,
				object: true,
			},
			AssignmentExpression: {
				array: true,
				object: true,
			},
		},
		{
			enforceForRenamedProperties: false,
			enforceForDeclarationWithTypeAnnotation: false,
		},
	],
	"@typescript-eslint/prefer-enum-initializers": [`off`], // no options
	"@typescript-eslint/prefer-regexp-exec": [`off`], // no options
	"@typescript-eslint/prefer-return-this-type": [`off`], // no options
	"@typescript-eslint/promise-function-async": [
		`off`,
		{
			allowAny: true,
			allowedPromiseNames: [],
			checkArrowFunctions: true,
			checkFunctionDeclarations: true,
			checkFunctionExpressions: true,
			checkMethodDeclarations: true,
		},
	],
	"@typescript-eslint/require-array-sort-compare": [
		`off`,
		{
			ignoreStringArrays: true,
		},
	],
	"@typescript-eslint/require-await": [`off`], // no options
	"@typescript-eslint/strict-boolean-expressions": [
		`off`,
		{
			allowString: true,
			allowNumber: true,
			allowNullableObject: true,
			allowNullableBoolean: false,
			allowNullableString: false,
			allowNullableNumber: false,
			allowNullableEnum: false,
			allowAny: false,
			allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
		},
	],
};

// 3. Stylistic 설정 -----------------------------------------------------------------------------------------
/** @type {RulesRecord} */
const STYLISTIC_RULES = {
	// 4-1. array / object
	"@stylistic/array-bracket-newline": [
		`error`,
		{
			minItems: 3,
			multiline: true,
		},
	],
	"@stylistic/array-bracket-spacing": [
		`off`,
		`never`,
		{
			singleValue: false,
			objectsInArrays: false,
			arraysInArrays: false,
		},
	],
	"@stylistic/array-element-newline": [`error`, `consistent`],
	"@stylistic/object-curly-newline": [
		`error`,
		{
			ObjectExpression: {
				minProperties: 3,
				multiline: true,
				consistent: true,
			},
			ObjectPattern: {
				minProperties: 3,
				multiline: true,
				consistent: true,
			},
			ImportDeclaration: {
				minProperties: 100,
				multiline: true,
				consistent: true,
			},
			ExportDeclaration: {
				minProperties: 100,
				multiline: true,
				consistent: true,
			},
		},
	],
	"@stylistic/object-curly-spacing": [
		`error`,
		`always`,
		{
			arraysInObjects: true,
			objectsInObjects: true,
		},
	],
	"@stylistic/object-property-newline": [
		`error`,
		{
			allowAllPropertiesOnSameLine: true,
		},
	],

	// 4-2. function / arrow
	"@stylistic/arrow-parens": [`error`, `always`],
	"@stylistic/arrow-spacing": [
		`error`,
		{
			before: true,
			after: true,
		},
	],
	"@stylistic/function-call-argument-newline": [`off`, `consistent`],
	"@stylistic/function-call-spacing": [`error`, `never`],
	"@stylistic/function-paren-newline": [`off`, `multiline-arguments`],
	"@stylistic/generator-star-spacing": [
		`error`,
		{
			before: false,
			after: true,
		},
	],
	"@stylistic/implicit-arrow-linebreak": [`error`, `beside`],
	"@stylistic/wrap-iife": [
		`error`,
		`outside`,
		{
			functionPrototypeMethods: true,
		},
	],

	// 4-3. block / brace
	"@stylistic/block-spacing": [`error`, `always`],
	"@stylistic/brace-style": [
		`error`,
		`stroustrup`,
		{
			allowSingleLine: false,
		},
	],
	"@stylistic/curly-newline": [`error`, `always`],

	// 4-4. comma / semicolon
	"@stylistic/comma-dangle": [
		`error`,
		{
			arrays: `always-multiline`,
			objects: `always-multiline`,
			imports: `always-multiline`,
			exports: `always-multiline`,
			functions: `never`,
			enums: `always-multiline`,
			generics: `never`,
			tuples: `always-multiline`,
		},
	],
	"@stylistic/comma-spacing": [
		`error`,
		{
			before: false,
			after: true,
		},
	],
	"@stylistic/comma-style": [
		`error`,
		`last`,
		{
			exceptions: {},
		},
	],
	"@stylistic/semi": [
		`error`,
		`always`,
		{
			omitLastInOneLineBlock: false,
			omitLastInOneLineClassBody: false,
		},
	],
	"@stylistic/semi-spacing": [
		`error`,
		{
			before: false,
			after: true,
		},
	],
	"@stylistic/semi-style": [`error`, `last`],

	// 4-5. spacing
	"@stylistic/computed-property-spacing": [
		`error`,
		`never`,
		{
			enforceForClassMembers: true,
		},
	],
	"@stylistic/dot-location": [`error`, `property`],
	"@stylistic/key-spacing": [
		`error`,
		{
			beforeColon: false,
			afterColon: true,
			mode: `strict`,
		},
	],
	"@stylistic/keyword-spacing": [
		`error`,
		{
			before: true,
			after: true,
			overrides: {},
		},
	],
	"@stylistic/no-multi-spaces": [
		`error`,
		{
			ignoreEOLComments: false,
			exceptions: {},
		},
	],
	"@stylistic/no-whitespace-before-property": [`error`], // no options
	"@stylistic/rest-spread-spacing": [`error`, `never`],
	"@stylistic/space-before-blocks": [`error`, `always`],
	"@stylistic/space-before-function-paren": [
		`error`,
		{
			anonymous: `never`,
			named: `never`,
			asyncArrow: `always`,
		},
	],
	"@stylistic/space-in-parens": [`error`, `never`],
	"@stylistic/space-infix-ops": [
		`error`,
		{
			int32Hint: false,
		},
	],
	"@stylistic/space-unary-ops": [
		`error`,
		{
			words: true,
			nonwords: false,
			overrides: {},
		},
	],
	"@stylistic/switch-colon-spacing": [
		`error`,
		{
			after: true,
			before: false,
		},
	],
	"@stylistic/template-curly-spacing": [`error`, `never`],
	"@stylistic/template-tag-spacing": [`error`, `never`],
	"@stylistic/yield-star-spacing": [
		`error`,
		{
			before: false,
			after: true,
		},
	],

	// 4-6. newline / linebreak
	"@stylistic/eol-last": [`error`, `always`],
	"@stylistic/linebreak-style": [`error`, `unix`],
	"@stylistic/lines-around-comment": [
		`off`,
		{
			beforeBlockComment: true,
			afterBlockComment: false,
			beforeLineComment: false,
			afterLineComment: false,
			allowBlockStart: false,
			allowBlockEnd: false,
			allowObjectStart: false,
			allowObjectEnd: false,
			allowArrayStart: false,
			allowArrayEnd: false,
			allowClassStart: false,
			allowClassEnd: false,
			applyDefaultIgnorePatterns: true,
			ignorePattern: ``,
			afterHashbangComment: false,
		},
	],
	"@stylistic/lines-between-class-members": [
		`error`,
		`always`,
		{
			exceptAfterSingleLine: false,
		},
	],
	"@stylistic/max-statements-per-line": [`error`, { max: 1 }],
	"@stylistic/multiline-ternary": [`off`, `always-multiline`],
	"@stylistic/new-parens": [`error`, `always`],
	"@stylistic/newline-per-chained-call": [`error`, { ignoreChainWithDepth: 4 }],
	"@stylistic/no-multiple-empty-lines": [
		`error`,
		{
			max: 1,
			maxEOF: 0,
			maxBOF: 0,
		},
	],
	"@stylistic/one-var-declaration-per-line": [`error`, `always`],
	"@stylistic/operator-linebreak": [
		`error`,
		`before`,
		{
			overrides: {},
		},
	],
	"@stylistic/padded-blocks": [
		`error`,
		`never`,
		{
			allowSingleLineBlocks: true,
		},
	],
	"@stylistic/padding-line-between-statements": [`off`], // complex options

	// 4-7. indent / format
	"@stylistic/indent": [
		`error`,
		`tab`,
		{
			SwitchCase: 1,
			VariableDeclarator: {
				var: 1,
				let: 1,
				const: 1,
			},
			outerIIFEBody: 1,
			MemberExpression: 1,
			FunctionDeclaration: {
				parameters: 1,
				body: 1,
			},
			FunctionExpression: {
				parameters: 1,
				body: 1,
			},
			StaticBlock: {
				body: 1,
			},
			CallExpression: {
				arguments: 1,
			},
			ArrayExpression: 1,
			ObjectExpression: 1,
			ImportDeclaration: 1,
			flatTernaryExpressions: false,
			offsetTernaryExpressions: true,
			ignoredNodes: [],
			ignoreComments: false,
			tabLength: 4,
		},
	],
	"@stylistic/indent-binary-ops": [`error`, `tab`],

	// 4-8. quotes / props
	"@stylistic/quotes": [
		`error`,
		`backtick`,
		{
			avoidEscape: true,
		},
	],
	"@stylistic/quote-props": [
		`error`,
		`as-needed`,
		{
			keywords: false,
			unnecessary: true,
			numbers: false,
		},
	],
	"@stylistic/jsx-quotes": [`error`, `prefer-double`],

	// 4-9. comment
	"@stylistic/line-comment-position": [
		`off`,
		{
			position: `above`,
			ignorePattern: ``,
			applyDefaultIgnorePatterns: true,
		},
	],
	"@stylistic/multiline-comment-style": [`off`, `starred-block`],
	"@stylistic/spaced-comment": [
		`error`,
		`always`,
		{
			line: {
				markers: [],
				exceptions: [],
			},
			block: {
				markers: [],
				exceptions: [],
				balanced: true,
			},
		},
	],

	// 4-10. misc
	"@stylistic/max-len": [
		`warn`,
		{
			code: 200,
			tabWidth: 2,
			comments: 200,
			ignorePattern: ``,
			ignoreComments: false,
			ignoreTrailingComments: false,
			ignoreUrls: true,
			ignoreStrings: true,
			ignoreTemplateLiterals: false,
			ignoreRegExpLiterals: false,
		},
	],
	"@stylistic/no-confusing-arrow": [
		`error`,
		{
			allowParens: true,
			onlyOneSimpleParam: false,
		},
	],
	"@stylistic/no-extra-parens": [
		`off`,
		`all`,
		{
			conditionalAssign: true,
			returnAssign: true,
			nestedBinaryExpressions: true,
			ternaryOperandBinaryExpressions: true,
			ignoreJSX: `none`,
			enforceForArrowConditionals: true,
			enforceForSequenceExpressions: true,
			enforceForNewInMemberExpressions: true,
			enforceForFunctionPrototypeMethods: true,
			allowParensAfterCommentPattern: ``,
		},
	],
	"@stylistic/no-extra-semi": [`error`], // no options
	"@stylistic/no-floating-decimal": [`error`], // no options
	"@stylistic/no-mixed-operators": [
		`error`,
		{
			groups: [
				[`%`, `**`],
				[`%`, `+`],
				[`%`, `-`],
				[`%`, `*`],
				[`%`, `/`],
				[`/`, `*`],
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
				[`&&`, `||`],
				[`in`, `instanceof`],
			],
			allowSamePrecedence: true,
		},
	],
	"@stylistic/no-mixed-spaces-and-tabs": [`error`], // no option
	"@stylistic/no-tabs": [
		`off`,
		{
			allowIndentationTabs: true,
		},
	],
	"@stylistic/no-trailing-spaces": [
		`error`,
		{
			skipBlankLines: false,
			ignoreComments: false,
		},
	],
	"@stylistic/nonblock-statement-body-position": [
		`error`,
		`beside`,
		{
			overrides: {},
		},
	],
	"@stylistic/wrap-regex": [`off`], // no options

	// 4-11. jsx
	"@stylistic/jsx-child-element-spacing": [`off`], // no options
	"@stylistic/jsx-closing-bracket-location": [`error`, `line-aligned`],
	"@stylistic/jsx-closing-tag-location": [`error`], // no options
	"@stylistic/jsx-curly-brace-presence": [
		`error`,
		{
			props: `never`,
			children: `never`,
			propElementValues: `always`,
		},
	],
	"@stylistic/jsx-curly-newline": [
		`error`,
		{
			multiline: `consistent`,
			singleline: `consistent`,
		},
	],
	"@stylistic/jsx-curly-spacing": [
		`error`,
		{
			when: `never`,
			allowMultiline: true,
			children: true,
			spacing: {
				objectLiterals: `never`,
			},
		},
	],
	"@stylistic/jsx-equals-spacing": [`error`, `never`],
	"@stylistic/jsx-first-prop-new-line": [`error`, `multiline-multiprop`],
	"@stylistic/jsx-function-call-newline": [`error`, `multiline`],
	"@stylistic/jsx-indent-props": [`error`, `tab`],
	"@stylistic/jsx-max-props-per-line": [
		`error`,
		{
			maximum: 1,
			when: `multiline`,
		},
	],
	"@stylistic/jsx-newline": [
		`off`,
		{
			prevent: false,
			allowMultilines: false,
		},
	],
	"@stylistic/jsx-one-expression-per-line": [
		`error`,
		{
			allow: `single-child`,
		},
	],
	"@stylistic/jsx-pascal-case": [
		`error`,
		{
			allowAllCaps: false,
			allowLeadingUnderscore: false,
			allowNamespace: false,
		},
	],
	"@stylistic/jsx-self-closing-comp": [
		`error`,
		{
			component: true,
			html: true,
		},
	],
	"@stylistic/jsx-sort-props": [
		`off`,
		{
			callbacksLast: false,
			shorthandFirst: false,
			shorthandLast: false,
			multiline: `ignore`,
			ignoreCase: false,
			noSortAlphabetically: false,
			reservedFirst: false,
			locale: `auto`,
		},
	],
	"@stylistic/jsx-tag-spacing": [
		`error`,
		{
			closingSlash: `never`,
			beforeSelfClosing: `always`,
			afterOpening: `never`,
			beforeClosing: `never`,
		},
	],
	"@stylistic/jsx-wrap-multilines": [
		`error`,
		{
			declaration: `parens-new-line`,
			assignment: `parens-new-line`,
			return: `parens-new-line`,
			arrow: `parens-new-line`,
			condition: `parens-new-line`,
			logical: `parens-new-line`,
			prop: `parens-new-line`,
			propertyValue: `parens-new-line`,
		},
	],

	// 4-12. typescript specific
	"@stylistic/member-delimiter-style": [
		`error`,
		{
			multiline: {
				delimiter: `semi`,
				requireLast: true,
			},
			singleline: {
				delimiter: `semi`,
				requireLast: false,
			},
			multilineDetection: `brackets`,
		},
	],
	"@stylistic/type-annotation-spacing": [
		`error`,
		{
			before: false,
			after: true,
			overrides: {},
		},
	],
	"@stylistic/type-generic-spacing": [`error`], // no options
	"@stylistic/type-named-tuple-spacing": [`error`], // no options
};

// 4. Unicorn 설정 -------------------------------------------------------------------------------------------
/** @type {RulesRecord} */
const UNICORN_RULES = {
	// 3-1. regex
	"unicorn/better-regex": [
		`error`,
		{
			sortCharacterClasses: true,
		},
	],
	"unicorn/escape-case": [`error`], // no options
	"unicorn/no-hex-escape": [`error`], // no options
	"unicorn/no-unsafe-regex": [`off`], // no options
	"unicorn/prefer-regexp-test": [`error`], // no options

	// 3-2. error
	"unicorn/catch-error-name": [
		`error`,
		{
			name: `error`,
		},
	],
	"unicorn/custom-error-definition": [`off`], // no options
	"unicorn/error-message": [`error`], // no options
	"unicorn/prefer-optional-catch-binding": [`error`], // no options
	"unicorn/prefer-type-error": [`error`], // no options
	"unicorn/throw-new-error": [`error`], // no options

	// 3-3. function
	"unicorn/consistent-function-scoping": [
		`warn`,
		{
			checkArrowFunctions: true,
		},
	],
	"unicorn/no-anonymous-default-export": [`error`], // no options
	"unicorn/prefer-native-coercion-functions": [`error`], // no options
	"unicorn/prefer-prototype-methods": [`error`], // no options
	"unicorn/prefer-reflect-apply": [`error`], // no options

	// 3-4. array
	"unicorn/explicit-length-check": [
		`error`,
		{
			"non-zero": `greater-than`,
		},
	],
	"unicorn/no-array-callback-reference": [`error`], // no options
	"unicorn/no-array-for-each": [`off`], // no options
	"unicorn/no-array-method-this-argument": [`error`], // no options
	"unicorn/no-array-push-push": [`error`], // no options
	"unicorn/no-array-reduce": [
		`error`,
		{
			allowSimpleOperations: true,
		},
	],
	"unicorn/no-for-loop": [`error`], // no options
	"unicorn/no-instanceof-array": [`error`], // no options
	"unicorn/no-new-array": [`error`], // no options
	"unicorn/no-useless-length-check": [`error`], // no options
	"unicorn/prefer-array-find": [
		`error`,
		{
			checkFromLast: false,
		},
	],
	"unicorn/prefer-array-flat": [`error`], // no options
	"unicorn/prefer-array-flat-map": [`error`], // no options
	"unicorn/prefer-array-index-of": [`error`], // no options
	"unicorn/prefer-array-some": [`error`], // no options
	"unicorn/prefer-at": [
		`error`,
		{
			getLastElementFunctions: [],
			checkAllIndexAccess: false,
		},
	],
	"unicorn/prefer-includes": [`error`], // no options
	"unicorn/prefer-negative-index": [`error`], // no options
	"unicorn/prefer-spread": [`error`], // no options

	// 3-5. string
	"unicorn/prefer-code-point": [`error`], // no options
	"unicorn/prefer-string-replace-all": [`error`], // no options
	"unicorn/prefer-string-slice": [`error`], // no options
	"unicorn/prefer-string-starts-ends-with": [`error`], // no options
	"unicorn/prefer-string-trim-start-end": [`error`], // no options
	"unicorn/string-content": [
		`off`,
		{
			patterns: {},
		},
	],
	"unicorn/text-encoding-identifier-case": [`error`], // no options

	// 3-6. number
	"unicorn/no-zero-fractions": [`error`], // no options
	"unicorn/number-literal-case": [`error`], // no options
	"unicorn/numeric-separators-style": [
		`error`,
		{
			hexadecimal: {
				minimumDigits: 0,
				groupLength: 3,
			},
			binary: {
				minimumDigits: 0,
				groupLength: 4,
			},
			octal: {
				minimumDigits: 0,
				groupLength: 4,
			},
			number: {
				minimumDigits: 5,
				groupLength: 3,
			},
			onlyIfContainsSeparator: false,
		},
	],
	"unicorn/prefer-math-trunc": [`error`], // no options
	"unicorn/prefer-modern-math-apis": [`error`], // no options
	"unicorn/prefer-number-properties": [
		`error`,
		{
			checkInfinity: true,
			checkNaN: true,
		},
	],

	// 3-7. object
	"unicorn/consistent-destructuring": [`error`], // no options
	"unicorn/no-object-as-default-parameter": [`error`], // no options
	"unicorn/no-static-only-class": [`error`], // no options
	"unicorn/no-this-assignment": [`error`], // no options
	"unicorn/no-unreadable-array-destructuring": [`error`], // no options
	"unicorn/no-useless-fallback-in-spread": [`error`], // no options
	"unicorn/no-useless-spread": [`error`], // no options
	"unicorn/prefer-object-from-entries": [
		`error`,
		{
			functions: [],
		},
	],

	// 3-8. promise / async
	"unicorn/no-await-expression-member": [`error`], // no options
	"unicorn/no-thenable": [`error`], // no options
	"unicorn/no-useless-promise-resolve-reject": [`error`], // no options
	"unicorn/prefer-top-level-await": [`off`], // no options

	// 3-9. dom / browser
	"unicorn/no-document-cookie": [`error`], // no options
	"unicorn/no-invalid-remove-event-listener": [`error`], // no options
	"unicorn/prefer-add-event-listener": [
		`error`,
		{
			excludedPackages: [`koa`, `sax`],
		},
	],
	"unicorn/prefer-blob-reading-methods": [`error`], // no options
	"unicorn/prefer-dom-node-append": [`error`], // no options
	"unicorn/prefer-dom-node-dataset": [`error`], // no options
	"unicorn/prefer-dom-node-remove": [`error`], // no options
	"unicorn/prefer-dom-node-text-content": [`error`], // no options
	"unicorn/prefer-keyboard-event-key": [`error`], // no options
	"unicorn/prefer-modern-dom-apis": [`error`], // no options
	"unicorn/prefer-query-selector": [`error`], // no options

	// 3-10. node / module
	"unicorn/no-new-buffer": [`error`], // no options
	"unicorn/no-process-exit": [`off`], // no options
	"unicorn/prefer-event-target": [`error`], // no options
	"unicorn/prefer-export-from": [
		`error`,
		{
			ignoreUsedVariables: false,
		},
	],
	"unicorn/prefer-module": [`error`], // no options
	"unicorn/prefer-node-protocol": [`error`], // no options

	// 3-11. style / format
	"unicorn/empty-brace-spaces": [`error`], // no options
	"unicorn/no-console-spaces": [`error`], // no options
	"unicorn/no-lonely-if": [`error`], // no options
	"unicorn/no-negated-condition": [`off`], // no options
	"unicorn/no-nested-ternary": [`off`], // no options
	"unicorn/no-null": [
		`off`,
		{
			checkStrictEquality: false,
		},
	],
	"unicorn/no-unreadable-iife": [`off`], // no options
	"unicorn/no-useless-switch-case": [`error`], // no options
	"unicorn/no-useless-undefined": [
		`error`,
		{
			checkArguments: true,
			checkArrowFunctionBody: true,
		},
	],
	"unicorn/prefer-default-parameters": [`error`], // no options
	"unicorn/prefer-logical-operator-over-ternary": [`error`], // no options
	"unicorn/prefer-switch": [
		`off`,
		{
			minimumCases: 3,
			emptyDefaultCase: `no-default-comment`,
		},
	],
	"unicorn/prefer-ternary": [`error`, `always`],
	"unicorn/template-indent": [
		`error`,
		{
			indent: `\t`,
			tags: [
				`outdent`,
				`dedent`,
				`gql`,
				`sql`,
				`html`,
				`styled`,
			],
			functions: [`dedent`, `stripIndent`],
			selectors: [],
			comments: [`HTML`, `indent`],
		},
	],

	// 3-12. file / naming
	"unicorn/expiring-todo-comments": [
		`error`,
		{
			terms: [
				`todo`,
				`fixme`,
				`xxx`,
			],
			ignoreDatesOnPullRequests: true,
			allowWarningComments: true,
		},
	],
	"unicorn/filename-case": [
		`error`,
		{
			case: `kebabCase`,
			multipleFileExtensions: true,
		},
	],
	"unicorn/import-style": [
		`error`,
		{
			styles: {},
			extendDefaultStyles: true,
			checkImport: true,
			checkDynamicImport: true,
			checkExportFrom: false,
			checkRequire: true,
		},
	],
	"unicorn/new-for-builtins": [`error`], // no options
	"unicorn/no-abusive-eslint-disable": [`error`], // no options
	"unicorn/no-empty-file": [`error`], // no options
	"unicorn/no-keyword-prefix": [
		`off`,
		{
			disallowedPrefixes: [`new`, `class`],
			checkProperties: true,
			onlyCamelCase: true,
		},
	],
	"unicorn/no-unused-properties": [`off`], // no options
	"unicorn/prefer-json-parse-buffer": [`off`], // no options
	"unicorn/prevent-abbreviations": [
		`off`,
		{
			replacements: {},
			extendDefaultReplacements: true,
			allowList: {},
			extendDefaultAllowList: true,
			checkDefaultAndNamespaceImports: `internal`,
			checkShorthandImports: `internal`,
			checkShorthandProperties: false,
			checkProperties: false,
			checkVariables: true,
			checkFilenames: true,
		},
	],
	"unicorn/relative-url-style": [`error`, `never`],
	"unicorn/require-array-join-separator": [`error`], // no options
	"unicorn/require-number-to-fixed-digits-argument": [`error`], // no options
	"unicorn/require-post-message-target-origin": [`error`], // no options
	"unicorn/prefer-set-has": [`error`], // no options
	"unicorn/prefer-set-size": [`error`], // no options
	"unicorn/prefer-date-now": [`error`], // no options
};

// 9. 최종 설정 병합 ----------------------------------------------------------------------------------------
/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
	// 9-1. Ignore 패턴
	{
		ignores: [
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

	// 9-2. Js 설정
	{
		files: [
			`**/*.js`,
			`**/*.mjs`,
			`**/*.cjs`,
			`**/*.jsx`,
		],
		linterOptions: {
			noInlineConfig: false,
			reportUnusedDisableDirectives: `error`,
			reportUnusedInlineConfigs: `error`,
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"@stylistic": stylistic,
			unicorn: unicorn,
		},
		rules: {
			...js.configs.recommended.rules,
			...JS_RULES,
			...STYLISTIC_RULES,
			...UNICORN_RULES,
		},
		settings: {},
		languageOptions: {
			ecmaVersion: `latest`,
			sourceType: `module`,
			globals: {
				...globals.es2021,
				...globals.browser,
				...globals.node,
				...globals.worker,
				APP_ENV: `readonly`,
				APP_VERSION: `readonly`,
				DEBUG: `readonly`,
			},
			parserOptions: {
				ecmaVersion: `latest`,
				sourceType: `module`,
				ecmaFeatures: {
					jsx: true,
					globalReturn: false,
					impliedStrict: true,
				},
				lib: [`es2022`],
				cacheLifetime: {
					glob: `Infinity`,
				},
				allowImportExportEverywhere: false,
				extraFileExtensions: [],
			},
		},
	},

	// 9-3. Ts 설정
	{
		files: [
			`**/*.ts`,
			`**/*.tsx`,
			`**/*.mts`,
			`**/*.cts`,
		],
		linterOptions: {
			noInlineConfig: false,
			reportUnusedDisableDirectives: `error`,
			reportUnusedInlineConfigs: `error`,
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"@stylistic": stylistic,
			unicorn: unicorn,
		},
		rules: {
			...js.configs.recommended.rules,
			...JS_RULES,
			...TS_RULES,
			...STYLISTIC_RULES,
			...UNICORN_RULES,
		},
		settings: {},
		languageOptions: {
			ecmaVersion: `latest`,
			sourceType: `module`,
			parser: tsParser,
			globals: {
				...globals.es2021,
				...globals.browser,
				...globals.node,
				...globals.worker,
				APP_ENV: `readonly`,
				APP_VERSION: `readonly`,
				DEBUG: `readonly`,
			},
			parserOptions: {
				ecmaVersion: `latest`,
				sourceType: `module`,
				ecmaFeatures: {
					jsx: true,
					globalReturn: false,
					impliedStrict: true,
				},
				lib: [`es2022`],
				cacheLifetime: {
					glob: `Infinity`,
				},
				allowImportExportEverywhere: false,
				extraFileExtensions: [],
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				warnOnUnsupportedTypeScriptVersion: true,
				emitDecoratorMetadata: true,
				experimentalDecorators: true,
				disallowAutomaticSingleRunInference: false,
				jsDocParsingMode: `all`,
				jsxPragma: `React`,
				jsxFragmentName: null,
			},
		},
	},
]);
