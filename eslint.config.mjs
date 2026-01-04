/**
 * @file eslint.config.mjs
 * @description ESLint Configuration File (Flat Config - Refactored & Optimized)
 * @author Jungho
 * @since 2025-12-07
 */

// @ts-check
import { defineConfig } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";
import stylistic from "@stylistic/eslint-plugin";
import html from "eslint-plugin-html";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 0. path ---------------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1-1. Js ----------------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_JS = {
  // 1-1. array
  "array-callback-return": [
    `error`,
    {
      allowImplicit: false,
      checkForEach: true,
      allowVoid: false,
    },
  ],
  "no-array-constructor": [`error`],
  "no-sparse-arrays": [`error`],

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
    `off`,
    {
      allowKeywords: true,
      allowPattern: ``,
    },
  ],
  "grouped-accessor-pairs": [ `error`, `getBeforeSet` ],
  "no-extend-native": [
    `error`,
    {
      exceptions: [],
    },
  ],
  "no-iterator": [`error`],
  "no-new-object": [`error`],
  "no-proto": [`error`],
  "no-prototype-builtins": [`error`],
  "object-shorthand": [ `error`, `never` ],
  "prefer-object-has-own": [`error`],
  "prefer-object-spread": [`error`],

  // 1-3. function
  "arrow-body-style": [
    `off`,
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
  "no-caller": [`error`],
  "no-empty-function": [
    `off`,
    {
      allow: [],
    },
  ],
  "no-extra-bind": [`error`],
  "no-func-assign": [`error`],
  "no-loop-func": [`error`],
  "no-new-func": [`error`],
  "no-return-assign": [ `error`, `always` ],
  "no-return-await": [`error`],
  "prefer-arrow-callback": [
    `error`,
    {
      allowNamedFunctions: false,
      allowUnboundThis: true,
    },
  ],
  "prefer-rest-params": [`error`],
  "prefer-spread": [`error`],

  // 1-4. class
  "class-methods-use-this": [
    `off`,
    {
      exceptMethods: [],
      enforceForClassFields: true,
    },
  ],
  "constructor-super": [`error`],
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
  "no-class-assign": [`error`],
  "no-constructor-return": [`error`],
  "no-dupe-class-members": [`error`],
  "no-new": [`error`],
  "no-new-native-nonconstructor": [`error`],
  "no-new-symbol": [`error`],
  "no-new-wrappers": [`error`],
  "no-this-before-super": [`error`],
  "no-useless-constructor": [`error`],

  // 1-5. variable
  "block-scoped-var": [`error`],
  "init-declarations": [
    `off`,
    `always`,
    {
      ignoreForLoopInit: false,
    },
  ],
  "no-const-assign": [`error`],
  "no-delete-var": [`error`],
  "no-global-assign": [
    `error`,
    {
      exceptions: [],
    },
  ],
  "no-import-assign": [`error`],
  "no-label-var": [`error`],
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
  "no-shadow-restricted-names": [`error`],
  "no-undef": [
    `error`,
    {
      typeof: false,
    },
  ],
  "no-undef-init": [`error`],
  "no-undefined": [`off`],
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
      varsIgnorePattern: `^_`,
      args: `after-used`,
      argsIgnorePattern: `^_`,
      caughtErrors: `all`,
      caughtErrorsIgnorePattern: `^_`,
      destructuredArrayIgnorePattern: `^_`,
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
  "no-useless-assignment": [`error`],
  "no-var": [`error`],
  "one-var": [ `error`, `never` ],
  "operator-assignment": [ `error`, `always` ],
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
  "vars-on-top": [`off`],

  // 1-6. async
  "no-async-promise-executor": [`error`],
  "no-await-in-loop": [`error`],
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
  "require-await": [`off`],

  // 1-7. control-flow
  "consistent-return": [
    `error`,
    {
      treatUndefinedAsUnspecified: false,
    },
  ],
  curly: [ `error`, `all` ],
  "default-case": [
    `error`,
    {
      commentPattern: `^no default$`,
    },
  ],
  "default-case-last": [`error`],
  "default-param-last": [`off`],
  "for-direction": [`error`],
  "guard-for-in": [`error`],
  "no-case-declarations": [`error`],
  "no-cond-assign": [ `error`, `except-parens` ],
  "no-constant-binary-expression": [`error`],
  "no-constant-condition": [
    `warn`,
    {
      checkLoops: false,
    },
  ],
  "no-continue": [`off`],
  "no-dupe-else-if": [`error`],
  "no-duplicate-case": [`error`],
  "no-else-return": [
    `error`,
    {
      allowElseIf: true,
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
  "no-extra-label": [`error`],
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
  "no-lone-blocks": [`error`],
  "no-lonely-if": [`error`],
  "no-unreachable": [`error`],
  "no-unreachable-loop": [ `error`, {}],
  "no-unsafe-finally": [`error`],
  "no-useless-catch": [`error`],
  "no-useless-return": [`error`],
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
  "no-compare-neg-zero": [`error`],
  "no-eq-null": [`off`],
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
      allow: [ `!!`, `~` ],
    },
  ],
  "no-implied-eval": [`error`],
  "no-nested-ternary": [`off`],
  "no-plusplus": [
    `off`,
    {
      allowForLoopAfterthoughts: false,
    },
  ],
  "no-script-url": [`error`],
  "no-self-assign": [
    `error`,
    {
      props: true,
    },
  ],
  "no-self-compare": [`error`],
  "no-sequences": [
    `error`,
    {
      allowInParentheses: true,
    },
  ],
  "no-ternary": [`off`],
  "no-throw-literal": [`error`],
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
      allowTaggedTemplates: true,
    },
  ],
  "no-useless-call": [`error`],
  "no-useless-computed-key": [
    `error`,
    {
      enforceForClassMembers: true,
    },
  ],
  "no-useless-concat": [`error`],
  "no-useless-rename": [
    `error`,
    {
      ignoreImport: false,
      ignoreExport: false,
      ignoreDestructuring: false,
    },
  ],
  "no-void": [
    `off`,
    {
      allowAsStatement: false,
    },
  ],
  "prefer-exponentiation-operator": [`error`],

  // 1-9. string / regex / template
  "no-control-regex": [`error`],
  "no-div-regex": [`off`],
  "no-empty-character-class": [`error`],
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
  "no-multi-str": [`error`],
  "no-regex-spaces": [`error`],
  "no-template-curly-in-string": [`error`],
  "no-useless-backreference": [`error`],
  "no-useless-escape": [`error`],
  "prefer-named-capture-group": [`off`],
  "prefer-numeric-literals": [`error`],
  "prefer-regex-literals": [
    `error`,
    {
      disallowRedundantWrapping: false,
    },
  ],
  "prefer-template": [`error`],
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
  "no-restricted-globals": [`off`],
  "no-restricted-imports": [
    `off`,
    {
      paths: [],
      patterns: [],
    },
  ],
  "no-restricted-properties": [`off`],
  "sort-imports": [
    `off`,
    {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: [ `none`, `all`, `multiple`, `single` ],
      allowSeparatedGroups: false,
    },
  ],
  strict: [ `error`, `never` ],

  // 1-11. naming
  camelcase: [
    `error`,
    {
      properties: `never`,
      ignoreDestructuring: false,
      ignoreImports: false,
      ignoreGlobals: false,
      allow: [`^.*_.*$`],
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
  "consistent-this": [ `off`, `self` ],
  "id-blacklist": [`off`],
  "id-denylist": [`off`],
  "id-length": [
    `off`,
    {
      min: 3,
      max: 40,
      properties: `always`,
      exceptions: [
        `i`, `j`, `k`, `x`, `y`, `_`,
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
  "handle-callback-err": [ `off`, `^(err|error)$` ],
  "no-alert": [`warn`],
  "no-console": [
    `warn`,
    {
      allow: [ `warn`, `error` ],
    },
  ],
  "no-debugger": [`error`],
  "no-dupe-args": [`error`],
  "no-dupe-keys": [`error`],
  "no-empty-static-block": [`error`],
  "no-ex-assign": [`error`],
  "no-inner-declarations": [ `error`, `functions` ],
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
  "no-loss-of-precision": [`error`],
  "no-nonoctal-decimal-escape": [`error`],
  "no-obj-calls": [`error`],
  "no-octal": [`error`],
  "no-octal-escape": [`error`],
  "no-param-reassign": [
    `error`,
    {
      props: true,
      ignorePropertyModificationsFor: [],
      ignorePropertyModificationsForRegex: [],
    },
  ],
  "no-setter-return": [`error`],
  "no-unexpected-multiline": [`error`],
  "no-unmodified-loop-condition": [`off`],
  "no-unused-labels": [`error`],
  "no-unused-private-class-members": [`error`],
  "no-with": [`error`],
  radix: [ `error`, `always` ],
  "require-yield": [`error`],
  "symbol-description": [`error`],
  "unicode-bom": [ `error`, `never` ],
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
      max: 300,
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
      ignore: [ -1, 0, 1, 3 ],
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

// 1-2. Ts ----------------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_TS = {
  // 2-1. type-safety
  "@typescript-eslint/no-inferrable-types": [`off`],
  "@typescript-eslint/typedef": [
    `warn`,
    {
      variableDeclaration: true,
      memberVariableDeclaration: true,
      parameter: true,
      arrayDestructuring: false,
      arrowParameter: false,
      objectDestructuring: false,
      propertyDeclaration: false,
      variableDeclarationIgnoreFunction: true,
    },
  ],
  "@typescript-eslint/await-thenable": [`error`],
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
  "@typescript-eslint/no-unsafe-argument": [`error`],
  "@typescript-eslint/no-unsafe-assignment": [`off`],
  "@typescript-eslint/no-unsafe-call": [`off`],
  "@typescript-eslint/no-unsafe-declaration-merging": [`error`],
  "@typescript-eslint/no-unsafe-enum-comparison": [`error`],
  "@typescript-eslint/no-unsafe-function-type": [`off`],
  "@typescript-eslint/no-unsafe-member-access": [`off`],
  "@typescript-eslint/no-unsafe-return": [`error`],
  "@typescript-eslint/no-unsafe-unary-minus": [`error`],
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
  "@typescript-eslint/adjacent-overload-signatures": [`error`],
  "@typescript-eslint/array-type": [
    `warn`,
    {
      default: `array`,
      readonly: `array`,
    },
  ],
  "@typescript-eslint/consistent-generic-constructors": [ `off`, `constructor` ],
  "@typescript-eslint/consistent-indexed-object-style": [ `warn`, `record` ],
  "@typescript-eslint/consistent-type-assertions": [
    `error`,
    {
      assertionStyle: `as`,
      objectLiteralTypeAssertions: `allow`,
      arrayLiteralTypeAssertions: `allow`,
    },
  ],
  "@typescript-eslint/consistent-type-definitions": [ `off`, `interface` ],
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
    `off`,
    {
      allowKeywords: true,
      allowPattern: ``,
      allowPrivateClassPropertyAccess: true,
      allowProtectedClassPropertyAccess: true,
      allowIndexSignaturePropertyAccess: true,
    },
  ],
  "@typescript-eslint/member-ordering": [
    `off`,
    {
      default: [],
    },
  ],
  "@typescript-eslint/method-signature-style": [ `warn`, `property` ],
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
  "@typescript-eslint/ban-tslint-comment": [`warn`],
  "@typescript-eslint/no-array-constructor": [`error`],
  "@typescript-eslint/no-array-delete": [`error`],
  "@typescript-eslint/no-base-to-string": [
    `error`,
    {
      ignoredTypeNames: [`RegExp`],
    },
  ],
  "@typescript-eslint/no-confusing-non-null-assertion": [`error`],
  "@typescript-eslint/no-confusing-void-expression": [
    `error`,
    {
      ignoreArrowShorthand: false,
      ignoreVoidOperator: false,
      ignoreVoidReturningFunctions: false,
    },
  ],
  "@typescript-eslint/no-duplicate-enum-values": [`error`],
  "@typescript-eslint/no-duplicate-type-constituents": [
    `error`,
    {
      ignoreIntersections: false,
      ignoreUnions: false,
    },
  ],
  "@typescript-eslint/no-dynamic-delete": [`error`],
  "@typescript-eslint/no-empty-function": [
    `off`,
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
  "@typescript-eslint/no-extra-non-null-assertion": [`error`],
  "@typescript-eslint/no-extraneous-class": [
    `error`,
    {
      allowConstructorOnly: false,
      allowEmpty: false,
      allowStaticOnly: false,
      allowWithDecorator: false,
    },
  ],
  "@typescript-eslint/no-for-in-array": [`error`],
  "@typescript-eslint/no-implied-eval": [`error`],
  "@typescript-eslint/no-import-type-side-effects": [`error`],
  "@typescript-eslint/no-invalid-this": [
    `off`,
    {
      capIsConstructor: true,
    },
  ],
  "@typescript-eslint/no-invalid-void-type": [
    `off`,
    {
      allowInGenericTypeArguments: true,
      allowAsThisParameter: true,
    },
  ],
  "@typescript-eslint/no-loop-func": [`error`],
  "@typescript-eslint/no-meaningless-void-operator": [
    `error`,
    {
      checkNever: false,
    },
  ],
  "@typescript-eslint/no-misused-new": [`error`],
  "@typescript-eslint/no-mixed-enums": [`error`],
  "@typescript-eslint/no-namespace": [
    `error`,
    {
      allowDeclarations: false,
      allowDefinitionFiles: true,
    },
  ],
  "@typescript-eslint/no-non-null-asserted-nullish-coalescing": [`error`],
  "@typescript-eslint/no-non-null-asserted-optional-chain": [`error`],
  "@typescript-eslint/no-redundant-type-constituents": [`error`],
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
  "@typescript-eslint/no-useless-constructor": [`error`],
  "@typescript-eslint/no-useless-empty-export": [`error`],

  // 2-4. lint-parity
  "@typescript-eslint/no-loss-of-precision": [`error`],
  "@typescript-eslint/no-unused-expressions": [
    `error`,
    {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: false,
    },
  ],
  "@typescript-eslint/no-unused-vars": [
    `error`,
    {
      vars: `all`,
      varsIgnorePattern: `^_`,
      args: `after-used`,
      argsIgnorePattern: `^_`,
      caughtErrors: `all`,
      caughtErrorsIgnorePattern: `^_`,
      destructuredArrayIgnorePattern: `^_`,
      ignoreRestSiblings: false,
      ignoreClassWithStaticInitBlock: false,
      reportUsedIgnorePattern: false,
    },
  ],
  "@typescript-eslint/no-use-before-define": [
    `off`,
    {
      functions: false,
      classes: true,
      variables: true,
      allowNamedExports: true,
      enums: true,
      typedefs: false,
      ignoreTypeReferences: true,
    },
  ],

  // 2-5. preference
  "@typescript-eslint/no-explicit-any": [
    `off`,
    {
      fixToUnknown: true,
      ignoreRestArgs: true,
    },
  ],
  "@typescript-eslint/no-non-null-assertion": [`warn`],
  "@typescript-eslint/no-unnecessary-condition": [
    `off`,
    {
      allowConstantLoopConditions: false,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      checkTypePredicates: false,
    },
  ],
  "@typescript-eslint/no-unnecessary-parameter-property-assignment": [`warn`],
  "@typescript-eslint/no-unnecessary-qualifier": [`warn`],
  "@typescript-eslint/no-unnecessary-template-expression": [`warn`],
  "@typescript-eslint/no-unnecessary-type-arguments": [`warn`],
  "@typescript-eslint/no-unnecessary-type-assertion": [
    `warn`,
    {
      typesToIgnore: [],
    },
  ],
  "@typescript-eslint/no-unnecessary-type-constraint": [`warn`],
  "@typescript-eslint/prefer-as-const": [`warn`],
  "@typescript-eslint/prefer-find": [`error`],
  "@typescript-eslint/prefer-for-of": [`warn`],
  "@typescript-eslint/prefer-function-type": [`error`],
  "@typescript-eslint/prefer-includes": [`warn`],
  "@typescript-eslint/prefer-literal-enum-member": [
    `error`,
    {
      allowBitwiseExpressions: false,
    },
  ],
  "@typescript-eslint/prefer-namespace-keyword": [`error`],
  "@typescript-eslint/prefer-nullish-coalescing": [
    `error`,
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreBooleanCoercion: false,
      ignoreConditionalTests: false,
      ignoreIfStatements: false,
      ignoreMixedLogicalExpressions: false,
      ignorePrimitives: {
        bigint: false,
        boolean: false,
        number: false,
        string: false,
      },
      ignoreTernaryTests: false,
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
  "@typescript-eslint/prefer-reduce-type-parameter": [`warn`],
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
      allowAny: true,
      allowBoolean: true,
      allowNullish: true,
      allowNumber: true,
      allowRegExp: true,
      allowNever: true,
    },
  ],
  "@typescript-eslint/return-await": [ `error`, `in-try-catch` ],

  // 2-6. off
  "@typescript-eslint/class-literal-property-style": [ `off`, `fields` ],
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
  "@typescript-eslint/naming-convention": [`off`],
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
  "@typescript-eslint/non-nullable-type-assertion-style": [`off`],
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
  "@typescript-eslint/prefer-enum-initializers": [`off`],
  "@typescript-eslint/prefer-regexp-exec": [`off`],
  "@typescript-eslint/prefer-return-this-type": [`off`],
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
  "@typescript-eslint/require-await": [`off`],
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

// 1-3. React --------------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_REACT = {
  // 5-1. React Core
  "react/boolean-prop-naming": [`off`],
  "react/button-has-type": [
    `error`,
    {
      button: true,
      submit: true,
      reset: true,
    },
  ],
  "react/default-props-match-prop-types": [
    `error`,
    {
      allowRequiredDefaults: false,
    },
  ],
  "react/destructuring-assignment": [ `error`, `always` ],
  "react/display-name": [
    `off`,
    {
      ignoreTranspilerName: false,
    },
  ],
  "react/forbid-component-props": [`off`],
  "react/forbid-dom-props": [`off`],
  "react/forbid-elements": [`off`],
  "react/forbid-foreign-prop-types": [`error`],
  "react/forbid-prop-types": [
    `error`,
    {
      forbid: [ `any`, `array`, `object` ],
      checkContextTypes: true,
      checkChildContextTypes: true,
    },
  ],
  "react/function-component-definition": [
    `error`,
    {
      namedComponents: `arrow-function`,
      unnamedComponents: `arrow-function`,
    },
  ],
  "react/hook-use-state": [
    `error`,
    {
      allowDestructuredState: true,
    },
  ],
  "react/iframe-missing-sandbox": [`error`],
  "react/no-access-state-in-setstate": [`error`],
  "react/no-adjacent-inline-elements": [`error`],
  "react/no-array-index-key": [`error`],
  "react/no-arrow-function-lifecycle": [`error`],
  "react/no-children-prop": [`off`],
  "react/no-danger": [`warn`],
  "react/no-danger-with-children": [`error`],
  "react/no-deprecated": [`error`],
  "react/no-did-mount-set-state": [`error`],
  "react/no-did-update-set-state": [`error`],
  "react/no-direct-mutation-state": [`error`],
  "react/no-find-dom-node": [`error`],
  "react/no-invalid-html-attribute": [`error`],
  "react/no-is-mounted": [`error`],
  "react/no-multi-comp": [
    `off`,
    {
      ignoreStateless: true,
    },
  ],
  "react/no-namespace": [`error`],
  "react/no-redundant-should-component-update": [`error`],
  "react/no-render-return-value": [`error`],
  "react/no-set-state": [`off`],
  "react/no-string-refs": [`error`],
  "react/no-this-in-sfc": [`error`],
  "react/no-typos": [`error`],
  "react/no-unescaped-entities": [`error`],
  "react/no-unknown-property": [`error`],
  "react/no-unsafe": [`error`],
  "react/no-unstable-nested-components": [
    `error`,
    {
      allowAsProps: true,
    },
  ],
  "react/no-unused-class-component-methods": [`error`],
  "react/no-unused-prop-types": [`error`],
  "react/no-unused-state": [`error`],
  "react/no-will-update-set-state": [`error`],
  "react/prefer-es6-class": [ `error`, `always` ],
  "react/prefer-exact-props": [`off`],
  "react/prefer-read-only-props": [`off`],
  "react/prefer-stateless-function": [
    `error`,
    {
      ignorePureComponents: true,
    },
  ],
  "react/prop-types": [
    `off`,
    {
      ignore: [],
      customValidators: [],
      skipUndeclared: false,
    },
  ],
  "react/react-in-jsx-scope": [`off`],
  "react/require-default-props": [
    `off`,
    {
      forbidDefaultForRequired: true,
    },
  ],
  "react/require-optimization": [`off`],
  "react/require-render-return": [`error`],
  "react/sort-comp": [
    `error`,
    {
      order: [
        `static-methods`,
        `instance-variables`,
        `lifecycle`,
        `/^handle.+$/`,
        `getters`,
        `setters`,
        `/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/`,
        `instance-methods`,
        `everything-else`,
        `rendering`,
      ],
      groups: {
        lifecycle: [
          `displayName`,
          `propTypes`,
          `contextTypes`,
          `childContextTypes`,
          `mixins`,
          `statics`,
          `defaultProps`,
          `constructor`,
          `getDefaultProps`,
          `getInitialState`,
          `state`,
          `getChildContext`,
          `getDerivedStateFromProps`,
          `componentWillMount`,
          `UNSAFE_componentWillMount`,
          `componentDidMount`,
          `componentWillReceiveProps`,
          `UNSAFE_componentWillReceiveProps`,
          `shouldComponentUpdate`,
          `componentWillUpdate`,
          `UNSAFE_componentWillUpdate`,
          `getSnapshotBeforeUpdate`,
          `componentDidUpdate`,
          `componentDidCatch`,
          `componentWillUnmount`,
        ],
        rendering: [ `/^render.+$/`, `render` ],
      },
    },
  ],
  "react/sort-prop-types": [
    `off`,
    {
      ignoreCase: true,
      callbacksLast: false,
      requiredFirst: false,
      sortShapeProp: true,
    },
  ],
  "react/state-in-constructor": [ `error`, `always` ],
  "react/static-property-placement": [ `error`, `static public field` ],
  "react/style-prop-object": [`error`],
  "react/void-dom-elements-no-children": [`error`],

  // 5-2. JSX
  "react/jsx-boolean-value": [ `error`, `always` ],
  "react/jsx-filename-extension": [
    `error`,
    {
      extensions: [ `.jsx`, `.tsx` ],
    },
  ],
  "react/jsx-fragments": [ `error`, `syntax` ],
  "react/jsx-handler-names": [
    `off`,
    {
      eventHandlerPrefix: `handle`,
      eventHandlerPropPrefix: `on`,
    },
  ],
  "react/jsx-key": [
    `error`,
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
      warnOnDuplicates: true,
    },
  ],
  "react/jsx-max-depth": [`off`],
  "react/jsx-no-bind": [
    `error`,
    {
      ignoreDOMComponents: false,
      ignoreRefs: false,
      allowArrowFunctions: true,
      allowFunctions: false,
      allowBind: false,
    },
  ],
  "react/jsx-no-comment-textnodes": [`error`],
  "react/jsx-no-constructed-context-values": [`error`],
  "react/jsx-no-duplicate-props": [
    `error`,
    {
      ignoreCase: true,
    },
  ],
  "react/jsx-no-leaked-render": [
    `error`,
    {
      validStrategies: [ `ternary`, `coerce` ],
    },
  ],
  "react/jsx-no-literals": [`off`],
  "react/jsx-no-script-url": [
    `error`,
    [
      {
        name: `Link`,
        props: [`to`],
      },
    ],
  ],
  "react/jsx-no-target-blank": [
    `error`,
    {
      enforceDynamicLinks: `always`,
    },
  ],
  "react/jsx-no-undef": [`error`],
  "react/jsx-no-useless-fragment": [
    `error`,
    {
      allowExpressions: true,
    },
  ],
  "react/jsx-props-no-spreading": [
    `off`,
    {
      html: `enforce`,
      custom: `enforce`,
      explicitSpread: `ignore`,
      exceptions: [],
    },
  ],
  "react/jsx-uses-react": [`off`],
  "react/jsx-uses-vars": [`error`],

  // 5-3. React Hooks
  "react-hooks/rules-of-hooks": [`error`],
  "react-hooks/exhaustive-deps": [`warn`],

  // 5-4. JSX A11y
  "jsx-a11y/alt-text": [
    `error`,
    {
      elements: [ `img`, `object`, `area`, `input[type="image"]` ],
      img: [],
      object: [],
      area: [],
      "input[type='image']": [],
    },
  ],
  "jsx-a11y/anchor-has-content": [
    `error`,
    {
      components: [],
    },
  ],
  "jsx-a11y/anchor-is-valid": [
    `error`,
    {
      components: [`Link`],
      specialLink: [`to`],
      aspects: [ `noHref`, `invalidHref`, `preferButton` ],
    },
  ],
  "jsx-a11y/aria-activedescendant-has-tabindex": [`error`],
  "jsx-a11y/aria-props": [`error`],
  "jsx-a11y/aria-proptypes": [`error`],
  "jsx-a11y/aria-role": [
    `error`,
    {
      ignoreNonDOM: false,
    },
  ],
  "jsx-a11y/aria-unsupported-elements": [`error`],
  "jsx-a11y/autocomplete-valid": [
    `off`,
    {
      inputComponents: [],
    },
  ],
  "jsx-a11y/click-events-have-key-events": [`error`],
  "jsx-a11y/heading-has-content": [
    `error`,
    {
      components: [``],
    },
  ],
  "jsx-a11y/html-has-lang": [`error`],
  "jsx-a11y/iframe-has-title": [`error`],
  "jsx-a11y/img-redundant-alt": [`error`],
  "jsx-a11y/interactive-supports-focus": [`error`],
  "jsx-a11y/label-has-associated-control": [
    `error`,
    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: `either`,
      depth: 25,
    },
  ],
  "jsx-a11y/media-has-caption": [
    `error`,
    {
      audio: [],
      video: [],
      track: [],
    },
  ],
  "jsx-a11y/mouse-events-have-key-events": [`error`],
  "jsx-a11y/no-access-key": [`error`],
  "jsx-a11y/no-autofocus": [
    `error`,
    {
      ignoreNonDOM: true,
    },
  ],
  "jsx-a11y/no-distracting-elements": [
    `error`,
    {
      elements: [ `marquee`, `blink` ],
    },
  ],
  "jsx-a11y/no-interactive-element-to-noninteractive-role": [
    `error`,
    {
      tr: [ `none`, `presentation` ],
    },
  ],
  "jsx-a11y/no-noninteractive-element-interactions": [
    `error`,
    {
      handlers: [
        `onClick`,
        `onMouseDown`,
        `onMouseUp`,
        `onKeyPress`,
        `onKeyDown`,
        `onKeyUp`,
      ],
    },
  ],
  "jsx-a11y/no-noninteractive-element-to-interactive-role": [
    `error`,
    {
      ul: [
        `listbox`, `menu`, `menubar`, `radiogroup`, `tablist`, `tree`, `treegrid`,
      ],
      ol: [
        `listbox`, `menu`, `menubar`, `radiogroup`, `tablist`, `tree`, `treegrid`,
      ],
      li: [ `menuitem`, `option`, `row`, `tab`, `treeitem` ],
      table: [`grid`],
      td: [`gridcell`],
    },
  ],
  "jsx-a11y/no-noninteractive-tabindex": [
    `error`,
    {
      tags: [],
      roles: [`tabpanel`],
    },
  ],
  "jsx-a11y/no-redundant-roles": [`error`],
  "jsx-a11y/no-static-element-interactions": [
    `error`,
    {
      handlers: [
        `onClick`,
        `onMouseDown`,
        `onMouseUp`,
        `onKeyPress`,
        `onKeyDown`,
        `onKeyUp`,
      ],
    },
  ],
  "jsx-a11y/role-has-required-aria-props": [`error`],
  "jsx-a11y/role-supports-aria-props": [`error`],
  "jsx-a11y/scope": [`error`],
  "jsx-a11y/tabindex-no-positive": [`error`],
};

// 1-4. Stylistic -------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_STYLISTIC = {
  // 4-1. array / object
  "@stylistic/array-bracket-newline": [
    `error`,
    {
      minItems: 6,
      multiline: true,
    },
  ],
  "@stylistic/array-bracket-spacing": [
    `error`,
    `always`,
    {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: false,
    },
  ],
  "@stylistic/array-element-newline": [ `error`, `consistent` ],
  "@stylistic/object-curly-newline": [
    `error`,
    {
      ObjectExpression: {
        minProperties: 6,
        multiline: true,
        consistent: true,
      },
      ObjectPattern: {
        minProperties: 6,
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
  "@stylistic/arrow-parens": [ `error`, `always` ],
  "@stylistic/arrow-spacing": [
    `error`,
    {
      before: true,
      after: true,
    },
  ],
  "@stylistic/function-call-argument-newline": [ `off`, `consistent` ],
  "@stylistic/function-call-spacing": [ `error`, `never` ],
  "@stylistic/function-paren-newline": [ `off`, `multiline-arguments` ],
  "@stylistic/generator-star-spacing": [
    `error`,
    {
      before: false,
      after: true,
    },
  ],
  "@stylistic/implicit-arrow-linebreak": [ `error`, `beside` ],
  "@stylistic/wrap-iife": [
    `error`,
    `outside`,
    {
      functionPrototypeMethods: true,
    },
  ],

  // 4-3. block / brace
  "@stylistic/block-spacing": [ `error`, `always` ],
  "@stylistic/brace-style": [
    `error`,
    `stroustrup`,
    {
      allowSingleLine: false,
    },
  ],
  "@stylistic/curly-newline": [
    `error`,
    {
      consistent: true,
      multiline: true,
      IfStatementConsequent: { multiline: true, consistent: true },
      IfStatementAlternative: { multiline: true, consistent: true },
      ForStatement: { multiline: true, consistent: true },
      ForInStatement: { multiline: true, consistent: true },
      ForOfStatement: { multiline: true, consistent: true },
      WhileStatement: { multiline: true, consistent: true },
      DoWhileStatement: { multiline: true, consistent: true },
      SwitchStatement: { multiline: true, consistent: true },
      SwitchCase: { multiline: true, consistent: true },
      WithStatement: { multiline: true, consistent: true },
      TryStatementBlock: { multiline: true, consistent: true },
      TryStatementHandler: { multiline: true, consistent: true },
      TryStatementFinalizer: { multiline: true, consistent: true },
      FunctionDeclaration: { multiline: true, consistent: true },
      FunctionExpression: { multiline: true, consistent: true },
      ArrowFunctionExpression: { multiline: true, consistent: true },
      Property: { multiline: true, consistent: true },
      ClassBody: { multiline: true, consistent: true },
      StaticBlock: { multiline: true, consistent: true },
      TSModuleBlock: { multiline: true, consistent: true },
      BlockStatement: { multiline: true, consistent: true },
    },
  ],

  // 4-4. comma / semicolon
  "@stylistic/comma-dangle": [
    `error`,
    {
      arrays: `always-multiline`,
      objects: `always-multiline`,
      imports: `always-multiline`,
      exports: `always-multiline`,
      functions: `always-multiline`,
      enums: `always-multiline`,
      generics: `always-multiline`,
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
  "@stylistic/semi-style": [ `error`, `last` ],

  // 4-5. spacing
  "@stylistic/computed-property-spacing": [
    `error`,
    `never`,
    {
      enforceForClassMembers: true,
    },
  ],
  "@stylistic/dot-location": [ `error`, `property` ],
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
  "@stylistic/no-whitespace-before-property": [`error`],
  "@stylistic/rest-spread-spacing": [ `error`, `never` ],
  "@stylistic/space-before-blocks": [ `error`, `always` ],
  "@stylistic/space-before-function-paren": [
    `error`,
    {
      anonymous: `never`,
      named: `never`,
      asyncArrow: `always`,
    },
  ],
  "@stylistic/space-in-parens": [ `error`, `never` ],
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
  "@stylistic/template-curly-spacing": [ `error`, `never` ],
  "@stylistic/template-tag-spacing": [ `error`, `never` ],
  "@stylistic/yield-star-spacing": [
    `error`,
    {
      before: false,
      after: true,
    },
  ],

  // 4-6. newline / linebreak
  "@stylistic/eol-last": [ `error`, `always` ],
  "@stylistic/linebreak-style": [ `error`, `unix` ],
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
      exceptAfterSingleLine: true,
    },
  ],
  "@stylistic/max-statements-per-line": [ `error`, { max: 1 }],
  "@stylistic/multiline-ternary": [ `off`, `always-multiline` ],
  "@stylistic/new-parens": [ `error`, `always` ],
  "@stylistic/newline-per-chained-call": [ `error`, { ignoreChainWithDepth: 4 }],
  "@stylistic/no-multiple-empty-lines": [
    `error`,
    {
      max: 1,
      maxEOF: 0,
      maxBOF: 0,
    },
  ],
  "@stylistic/one-var-declaration-per-line": [ `error`, `always` ],
  "@stylistic/operator-linebreak": [
    `error`,
    `after`,
    {
      overrides: {
        ":": `before`,
        "|": `before`,
        "||": `before`,
        "?": `before`,
        "??": `after`,
        "&": `before`,
        "&&": `after`,
      },
    },
  ],
  "@stylistic/padded-blocks": [`off`],
  "@stylistic/padding-line-between-statements": [`off`],

  // 4-7. indent / format
  "@stylistic/indent-binary-ops": [`off`],
  "@stylistic/indent": [
    `error`,
    2,
    {
      SwitchCase: 1,
      VariableDeclarator: {
        var: 1,
        let: 1,
        const: 1,
      },
      FunctionDeclaration: {
        parameters: 1,
        body: 1,
      },
      FunctionExpression: {
        parameters: 1,
        body: 1,
      },
      CallExpression: {
        arguments: 1,
      },
      ArrayExpression: 1,
      ObjectExpression: 1,
      MemberExpression: 0,
      ImportDeclaration: 1,
      StaticBlock: {
        body: 1,
      },
      outerIIFEBody: 1,
      flatTernaryExpressions: false,
      offsetTernaryExpressions: false,
      ignoredNodes: [`ConditionalExpression`],
      tabLength: 2,
      ignoreComments: false,
    },
  ],

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
  "@stylistic/jsx-quotes": [ `error`, `prefer-double` ],

  // 4-9. comment
  "@stylistic/line-comment-position": [
    `off`,
    {
      position: `above`,
      ignorePattern: ``,
      applyDefaultIgnorePatterns: true,
    },
  ],
  "@stylistic/multiline-comment-style": [ `off`, `starred-block` ],
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
      code: 500,
      tabWidth: 2,
      comments: 500,
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
  "@stylistic/no-extra-semi": [`error`],
  "@stylistic/no-floating-decimal": [`error`],
  "@stylistic/no-mixed-operators": [
    `error`,
    {
      groups: [
        [ `%`, `**` ],
        [ `%`, `+` ],
        [ `%`, `-` ],
        [ `%`, `*` ],
        [ `%`, `/` ],
        [ `/`, `*` ],
        [
          `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`,
        ],
        [
          `==`, `!=`, `===`, `!==`, `>`, `>=`, `<`, `<=`,
        ],
        [ `&&`, `||` ],
        [ `in`, `instanceof` ],
      ],
      allowSamePrecedence: true,
    },
  ],
  "@stylistic/no-mixed-spaces-and-tabs": [`off`],
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
  "@stylistic/wrap-regex": [`off`],

  // 4-11. jsx
  "@stylistic/jsx-child-element-spacing": [`off`],
  "@stylistic/jsx-closing-bracket-location": [ `error`, `line-aligned` ],
  "@stylistic/jsx-closing-tag-location": [`error`],
  "@stylistic/jsx-curly-brace-presence": [ `error`, `always` ],
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
  "@stylistic/jsx-equals-spacing": [ `error`, `never` ],
  "@stylistic/jsx-first-prop-new-line": [ `error`, `multiline-multiprop` ],
  "@stylistic/jsx-function-call-newline": [ `error`, `multiline` ],
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
      overrides: {
        arrow: {
          before: true,
          after: true,
        },
      },
    },
  ],
  "@stylistic/type-generic-spacing": [`error`],
  "@stylistic/type-named-tuple-spacing": [`error`],
};

// 1-5. Unicorn ---------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_UNICORN = {
  // 3-1. regex
  "unicorn/better-regex": [
    `error`,
    {
      sortCharacterClasses: true,
    },
  ],
  "unicorn/escape-case": [`error`],
  "unicorn/no-hex-escape": [`error`],
  "unicorn/no-unsafe-regex": [`off`],
  "unicorn/prefer-regexp-test": [`error`],

  // 3-2. error
  "unicorn/catch-error-name": [
    `error`,
    {
      name: `error`,
    },
  ],
  "unicorn/custom-error-definition": [`off`],
  "unicorn/error-message": [`error`],
  "unicorn/prefer-optional-catch-binding": [`error`],
  "unicorn/prefer-type-error": [`error`],
  "unicorn/throw-new-error": [`error`],

  // 3-3. function
  "unicorn/consistent-function-scoping": [
    `warn`,
    {
      checkArrowFunctions: false,
    },
  ],
  "unicorn/no-anonymous-default-export": [`error`],
  "unicorn/prefer-native-coercion-functions": [`error`],
  "unicorn/prefer-prototype-methods": [`error`],
  "unicorn/prefer-reflect-apply": [`error`],

  // 3-4. array
  "unicorn/explicit-length-check": [
    `error`,
    {
      "non-zero": `greater-than`,
    },
  ],
  "unicorn/no-array-callback-reference": [`error`],
  "unicorn/no-array-for-each": [`off`],
  "unicorn/no-array-method-this-argument": [`error`],
  "unicorn/no-array-push-push": [`error`],
  "unicorn/no-array-reduce": [
    `off`,
    {
      allowSimpleOperations: true,
    },
  ],
  "unicorn/no-for-loop": [`error`],
  "unicorn/no-instanceof-array": [`error`],
  "unicorn/no-new-array": [`error`],
  "unicorn/no-useless-length-check": [`error`],
  "unicorn/prefer-array-find": [
    `error`,
    {
      checkFromLast: false,
    },
  ],
  "unicorn/prefer-array-flat": [`error`],
  "unicorn/prefer-array-flat-map": [`error`],
  "unicorn/prefer-array-index-of": [`error`],
  "unicorn/prefer-array-some": [`error`],
  "unicorn/prefer-at": [
    `error`,
    {
      getLastElementFunctions: [],
      checkAllIndexAccess: false,
    },
  ],
  "unicorn/prefer-includes": [`error`],
  "unicorn/prefer-negative-index": [`error`],
  "unicorn/prefer-spread": [`error`],

  // 3-5. string
  "unicorn/prefer-code-point": [`error`],
  "unicorn/prefer-string-replace-all": [`error`],
  "unicorn/prefer-string-slice": [`error`],
  "unicorn/prefer-string-starts-ends-with": [`error`],
  "unicorn/prefer-string-trim-start-end": [`error`],
  "unicorn/string-content": [
    `off`,
    {
      patterns: {},
    },
  ],
  "unicorn/text-encoding-identifier-case": [`error`],

  // 3-6. number
  "unicorn/no-zero-fractions": [`error`],
  "unicorn/number-literal-case": [`error`],
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
  "unicorn/prefer-math-trunc": [`error`],
  "unicorn/prefer-modern-math-apis": [`error`],
  "unicorn/prefer-number-properties": [
    `error`,
    {
      checkInfinity: true,
      checkNaN: true,
    },
  ],

  // 3-7. object
  "unicorn/consistent-destructuring": [`error`],
  "unicorn/no-object-as-default-parameter": [`error`],
  "unicorn/no-static-only-class": [`error`],
  "unicorn/no-this-assignment": [`error`],
  "unicorn/no-unreadable-array-destructuring": [`error`],
  "unicorn/no-useless-fallback-in-spread": [`error`],
  "unicorn/no-useless-spread": [`error`],
  "unicorn/prefer-object-from-entries": [
    `error`,
    {
      functions: [],
    },
  ],

  // 3-8. promise / async
  "unicorn/no-await-expression-member": [`error`],
  "unicorn/no-thenable": [`error`],
  "unicorn/no-useless-promise-resolve-reject": [`error`],
  "unicorn/prefer-top-level-await": [`off`],

  // 3-9. dom / browser
  "unicorn/no-document-cookie": [`error`],
  "unicorn/no-invalid-remove-event-listener": [`error`],
  "unicorn/prefer-add-event-listener": [
    `error`,
    {
      excludedPackages: [ `koa`, `sax` ],
    },
  ],
  "unicorn/prefer-blob-reading-methods": [`error`],
  "unicorn/prefer-dom-node-append": [`error`],
  "unicorn/prefer-dom-node-dataset": [`error`],
  "unicorn/prefer-dom-node-remove": [`error`],
  "unicorn/prefer-dom-node-text-content": [`error`],
  "unicorn/prefer-keyboard-event-key": [`error`],
  "unicorn/prefer-modern-dom-apis": [`error`],
  "unicorn/prefer-query-selector": [`error`],

  // 3-10. node / module
  "unicorn/no-new-buffer": [`error`],
  "unicorn/no-process-exit": [`off`],
  "unicorn/prefer-event-target": [`error`],
  "unicorn/prefer-export-from": [
    `error`,
    {
      ignoreUsedVariables: false,
    },
  ],
  "unicorn/prefer-module": [`error`],
  "unicorn/prefer-node-protocol": [`error`],

  // 3-11. style / format
  "unicorn/empty-brace-spaces": [`error`],
  "unicorn/no-console-spaces": [`error`],
  "unicorn/no-lonely-if": [`error`],
  "unicorn/no-negated-condition": [`off`],
  "unicorn/no-nested-ternary": [`off`],
  "unicorn/no-null": [
    `off`,
    {
      checkStrictEquality: false,
    },
  ],
  "unicorn/no-unreadable-iife": [`off`],
  "unicorn/no-useless-switch-case": [`error`],
  "unicorn/no-useless-undefined": [
    `error`,
    {
      checkArguments: true,
      checkArrowFunctionBody: true,
    },
  ],
  "unicorn/prefer-default-parameters": [`error`],
  "unicorn/prefer-logical-operator-over-ternary": [`error`],
  "unicorn/prefer-switch": [
    `off`,
    {
      minimumCases: 3,
      emptyDefaultCase: `no-default-comment`,
    },
  ],
  "unicorn/prefer-ternary": [ `error`, `always` ],
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
      functions: [ `dedent`, `stripIndent` ],
      selectors: [],
      comments: [ `HTML`, `indent` ],
    },
  ],

  // 3-12. file / naming
  "unicorn/expiring-todo-comments": [
    `error`,
    {
      terms: [ `todo`, `fixme`, `xxx` ],
      ignoreDatesOnPullRequests: true,
      allowWarningComments: true,
    },
  ],
  "unicorn/filename-case": [`off`],
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
  "unicorn/new-for-builtins": [`error`],
  "unicorn/no-abusive-eslint-disable": [`error`],
  "unicorn/no-empty-file": [`error`],
  "unicorn/no-keyword-prefix": [
    `off`,
    {
      disallowedPrefixes: [ `new`, `class` ],
      checkProperties: true,
      onlyCamelCase: true,
    },
  ],
  "unicorn/no-unused-properties": [`off`],
  "unicorn/prefer-json-parse-buffer": [`off`],
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
  "unicorn/relative-url-style": [ `error`, `never` ],
  "unicorn/require-array-join-separator": [`error`],
  "unicorn/require-number-to-fixed-digits-argument": [`error`],
  "unicorn/require-post-message-target-origin": [`error`],
  "unicorn/prefer-set-has": [`error`],
  "unicorn/prefer-set-size": [`error`],
  "unicorn/prefer-date-now": [`error`],
};

// 1-6. Custom -------------------------------------------------------------------------------------
/** @type {import("eslint").Linter.RulesRecord} * */
const RULES_CUSTOM = {
  "no-restricted-syntax": [
    `error`,
    {
      selector: `ForStatement`,
      message: `전통적인 for 루프는 지양하세요. Array.from(), map(), forEach() 또는 while 문을 고려하세요.`,
    },
    {
      selector: `VariableDeclarator[id.typeAnnotation=null][init.type='MemberExpression']`,
      message: `변수에 값을 할당할 때는 명시적인 타입을 지정해야 합니다 (예: const val: string = obj.val).`,
    },
    {
      selector: `VariableDeclarator[id.typeAnnotation=null][init.type='ChainExpression']`,
      message: `변수에 값을 할당할 때는 명시적인 타입을 지정해야 합니다 (예: const val: string = obj.val).`,
    },
    {
      selector: `VariableDeclarator[id.typeAnnotation=null][init.type='Identifier']`,
      message: `변수에 값을 할당할 때는 명시적인 타입을 지정해야 합니다 (예: const val: string = obj.val).`,
    },
    {
      selector: `CallExpression[callee.type='MemberExpression'][callee.property.name='reduce'] > MemberExpression.callee > Identifier[name='reduce']`,
      message: `Array.prototype.reduce() 사용 대신 map(), filter(), find() 등을 사용하는 것을 고려하세요.`,
    },
  ],
};

// 2-0. Ignore -----------------------------------------------------------------------------------
const IGNORE_PATTERNS = {
  ignores: [
    `**/node_modules/**`,
    `**/.history/**`,
    `**/.mongo/**`,
    `**/.bookmark/**`,
    `**/.backup/**`,
    `**/.etc/**`,
    `**/.tmp/**`,
    `**/.temp/**`,
    `**/.nyc_output/**`,
    `**/.parcel-cache/**`,
    `**/.idea/**`,
    `**/.gradle/**`,
    `**/.bin/**`,
    `**/.gen/**`,
    `**/.vscode/**`,
    `**/dist/**`,
    `**/.dist/**`,
    `**/build/**`,
    `**/.build/**`,
    `**/.next/**`,
    `**/.turbo/**`,
    `**/coverage/**`,
    `**/.coverage/**`,
    `**/.git/**`,
    `**/.cache/**`,
    `**/out/**`,
    `**/.out/**`,
    `**/vendor/**`,
    `coverage/**`,
    `**/.nuxt/**`,
    `**/.svelte-kit/**`,
    `**/.astro/**`,
    `**/.vite/**`,
    `**/.vercel/**`,
    `**/.netlify/**`,
    `**/.firebase/**`,
    `**/storybook-static/**`,
    `**/.serverless/**`,
    `**/.output/**`,
    `**/target/**`,
    `**/.yarn/**`,
    `**/.pnp.cjs`,
    `**/.pnp.loader.mjs`,
    `**/.pnpm-store/**`,
    `**/.bun/**`,
    `**/.swc/**`,
    `**/.rollup.cache/**`,
    `**/*.tsbuildinfo`,
    `**/*.min.js`,
    `**/*.min.css`,
    `**/*.bundle.js`,
    `**/*.bundle.css`,
    `**/*.map`,
    `**/.eslintcache`,
    `!**/*.d.ts`,
  ],
};

// 2-1. HTML ------------------------------------------------------------------------------------
const SETTINGS_HTML = {
  files: [ `**/*.html`, `**/*.htm` ],
  rules: {
    ...RULES_JS,
    ...RULES_STYLISTIC,
    ...RULES_UNICORN,
    ...RULES_CUSTOM,
  },
  plugins: {
    html: html,
    unicorn: unicorn,
    "@stylistic": stylistic,
  },
  linterOptions: {
    noInlineConfig: false,
    reportUnusedDisableDirectives: `error`,
    reportUnusedInlineConfigs: `error`,
  },
  languageOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
    globals: {
      ...globals.es2025,
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
      lib: [ `dom`, `esnext` ],
      cacheLifetime: { glob: `Infinity` },
      allowImportExportEverywhere: false,
      extraFileExtensions: [],
      project: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true,
      },
    },
  },
  settings: {
    "html/html-extensions": [ `.html`, `.htm` ],
    "html/javascript-mime-types": [
      `text/javascript`,
      `application/javascript`,
      `application/ecmascript`,
      `text/ecmascript`,
    ],
  },
};

// 2-2. Js -------------------------------------------------------------------------------------
const SETTINGS_JS = {
  files: [ `**/*.js`, `**/*.cjs`, `**/*.mjs` ],
  rules: {
    ...RULES_JS,
    ...RULES_STYLISTIC,
    ...RULES_UNICORN,
    ...RULES_CUSTOM,
  },
  plugins: {
    unicorn: unicorn,
    "@stylistic": stylistic,
  },
  linterOptions: {
    noInlineConfig: false,
    reportUnusedDisableDirectives: `error`,
    reportUnusedInlineConfigs: `error`,
  },
  languageOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
    globals: {
      ...globals.es2025,
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
      lib: [ `dom`, `esnext` ],
      cacheLifetime: { glob: `Infinity` },
      allowImportExportEverywhere: false,
      extraFileExtensions: [],
      project: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true,
      },
    },
  },
  settings: {
    react: {
      version: `detect`,
    },
  },
};

// 2-3. Ts -------------------------------------------------------------------------------------
const SETTINGS_TS = {
  files: [ `**/*.ts`, `**/*.cts`, `**/*.mts`, `**/*.d.ts` ],
  rules: {
    ...RULES_TS,
    ...RULES_STYLISTIC,
    ...RULES_UNICORN,
    ...RULES_CUSTOM,
  },
  plugins: {
    unicorn: unicorn,
    "@stylistic": stylistic,
    "@typescript-eslint": tseslint,
  },
  linterOptions: {
    noInlineConfig: false,
    reportUnusedDisableDirectives: `error`,
    reportUnusedInlineConfigs: `error`,
  },
  languageOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
    parser: tsParser,
    globals: {
      ...globals.es2025,
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
      lib: [ `dom`, `esnext` ],
      cacheLifetime: { glob: `Infinity` },
      allowImportExportEverywhere: false,
      extraFileExtensions: [],
      project: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true,
      },
    },
  },
  settings: {
    react: {
      version: `detect`,
    },
  },
};

// 2-4. React (JSX) -----------------------------------------------------------------------------
const SETTINGS_JSX = {
  files: [`**/*.jsx`],
  rules: {
    ...RULES_JS,
    ...RULES_REACT,
    ...RULES_STYLISTIC,
    ...RULES_UNICORN,
    ...RULES_CUSTOM,
  },
  plugins: {
    unicorn: unicorn,
    react: react,
    "@stylistic": stylistic,
    "react-hooks": reactHooks,
    "jsx-a11y": jsxA11y,
  },
  linterOptions: {
    noInlineConfig: false,
    reportUnusedDisableDirectives: `error`,
    reportUnusedInlineConfigs: `error`,
  },
  languageOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
    globals: {
      ...globals.es2025,
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
      lib: [ `dom`, `esnext` ],
      cacheLifetime: { glob: `Infinity` },
      allowImportExportEverywhere: false,
      extraFileExtensions: [],
      project: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true,
      },
    },
  },
  settings: {
    react: {
      version: `detect`,
    },
  },
};

// 2-5. React (TSX) -----------------------------------------------------------------------------
const SETTINGS_TSX = {
  files: [`**/*.tsx`],
  rules: {
    ...RULES_TS, // Applied Typescript Rules
    ...RULES_REACT,
    ...RULES_STYLISTIC,
    ...RULES_UNICORN,
    ...RULES_CUSTOM,
  },
  plugins: {
    unicorn: unicorn,
    react: react,
    "@stylistic": stylistic,
    "@typescript-eslint": tseslint,
    "react-hooks": reactHooks,
    "jsx-a11y": jsxA11y,
  },
  linterOptions: {
    noInlineConfig: false,
    reportUnusedDisableDirectives: `error`,
    reportUnusedInlineConfigs: `error`,
  },
  languageOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
    parser: tsParser, // Applied Typescript Parser
    globals: {
      ...globals.es2025,
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
      lib: [ `dom`, `esnext` ],
      cacheLifetime: { glob: `Infinity` },
      allowImportExportEverywhere: false,
      extraFileExtensions: [],
      project: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
        globalReturn: false,
        impliedStrict: true,
      },
    },
  },
  settings: {
    react: {
      version: `detect`,
    },
  },
};

// 3. Export Config -----------------------------------------------------------------------------
/** @type {import("eslint").Linter.Config[]} * */
export default defineConfig([
  // 3-1. Ignores
  IGNORE_PATTERNS,

  // 3-2. HTML
  SETTINGS_HTML,

  // 3-3. JS
  SETTINGS_JS,

  // 3-4. TS
  SETTINGS_TS,

  // 3-5. React (JSX)
  SETTINGS_JSX,

  // 3-6. React (TSX)
  SETTINGS_TSX,
]);
