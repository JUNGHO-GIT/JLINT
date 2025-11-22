/**
 * @file eslint.config.js
 * @since 2025-11-22
 */

// @ts-nocheck
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

// 공통: 무시할 경로 패턴 ----------------------------------------------------------
// 프로젝트 전역에서 공통으로 무시할 폴더/파일 패턴
const COMMON_IGNORES = [
	"**/node_modules/**",
	"**/dist/**",
	"**/build/**",
	"**/.next/**",
	"**/.turbo/**",
	"**/coverage/**",
	"**/.git/**",
	"**/.cache/**",
	"**/out/**",
	"**/*.min.js",
	"**/*.bundle.js",
	"**/vendor/**",
	"**/.node/**"
];

// 공통: JS/TS 파일 매칭 패턴 -------------------------------------------------------
// 모든 JS/TS 소스(선언 파일 제외)에 적용
const COMMON_JS_TS_FILES = [
	"**/*.{js,mjs,jsx,ts,tsx}",
	"!**/*.d.ts"
];

// CJS 전용: Node 런타임용 CJS 스크립트 -------------------------------------------
const COMMON_CJS_FILES = [
	"**/*.cjs"
];

// 공통: 언어 옵션 (ESM 기반 JS/TS) -------------------------------------------------
// 최신 ECMAScript + 모듈 + JSX 지원
const COMMON_LANGUAGE_OPTIONS_ESM = {
	"ecmaVersion": "latest",
	"sourceType": "module",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module",
		"ecmaFeatures": {
			"jsx": true,
			"globalReturn": false,
			"impliedStrict": false
		},
		"allowImportExportEverywhere": false,
		"extraFileExtensions": []
	},
	"globals": {
		...globals.es2024,
		...globals.browser,
		...globals.node,
		...globals.worker,
		"APP_ENV": "readonly",
		"APP_VERSION": "readonly",
		"DEBUG": "readonly"
	}
};

// 공통: 린터 옵션 ------------------------------------------------------------------
// 인라인 설정 허용/사용되지 않는 disable 주석 처리 정책 (ESLint v9 Severity 숫자 사용)
const COMMON_LINTER_OPTIONS = {
	"noInlineConfig": false,
	"reportUnusedDisableDirectives": 1,
	"reportUnusedInlineConfigs": 0
};

// 공통: 스타일 + 기본 베스트 프랙티스 규칙 ---------------------------------------
// JS/TS 전역에 공통 적용할 ESLint 코어 규칙 세트
const BASE_RULES = {
	// getter/setter 짝 강제
	"accessor-pairs": [
		"error",
		{
			"setWithoutGet": true,
			"getWithoutSet": false,
			"enforceForClassMembers": true
		}
	],

	// 배열 요소 줄바꿈
	"array-element-newline": [
		"off",
		"error",
		{
			"multiline": false,
			"minItems": 3
		}
	],

	// 배열 괄호 줄바꿈
	"array-bracket-newline": [
		"off",
		"error",
		{
			"multiline": false,
			"minItems": 3
		}
	],

	// 배열 괄호 공백
	"array-bracket-spacing": [
		"error",
		"always",
		{
			"singleValue": true,
			"objectsInArrays": true,
			"arraysInArrays": true
		}
	],

	// 배열 콜백 반환값 강제
	"array-callback-return": [
		"error",
		{
			"allowImplicit": false,
			"checkForEach": true
		}
	],

	// 블록 앞뒤 공백
	"block-spacing": [
		"error",
		"always"
	],

	// 브레이스 스타일 (stroustrup)
	"brace-style": [
		"error",
		"stroustrup",
		{
			"allowSingleLine": true
		}
	],

	// 콜백에서 return 강제
	"callback-return": [
		"off",
		[
			"callback",
			"cb",
			"next"
		]
	],

	// 카멜케이스 규칙
	"camelcase": [
		"error",
		{
			"properties": "never",
			"ignoreDestructuring": false,
			"ignoreImports": false,
			"ignoreGlobals": false
		}
	],

	// 주석 첫 글자 대문자
	"capitalized-comments": [
		"off",
		"always",
		{
			"ignorePattern": "eslint|istanbul|ts-ignore|prettier-ignore",
			"ignoreInlineComments": true,
			"ignoreConsecutiveComments": true
		}
	],

	// class 메서드에서 this 사용 강제
	"class-methods-use-this": [
		"off",
		{
			"exceptMethods": [],
			"enforceForClassFields": false
		}
	],

	// 꼬리 콤마 규칙
	"comma-dangle": [
		"error",
		{
			"arrays": "always-multiline",
			"objects": "always-multiline",
			"imports": "always-multiline",
			"exports": "always-multiline",
			"functions": "never"
		}
	],

	// 콤마 앞뒤 공백
	"comma-spacing": [
		"error",
		{
			"before": false,
			"after": true
		}
	],

	// 콤마 스타일 (줄 끝)
	"comma-style": [
		"error",
		"last"
	],

	// 복잡도 제한
	"complexity": [
		"off",
		{
			"max": 20
		}
	],

	// 계산된 프로퍼티 공백
	"computed-property-spacing": [
		"error",
		"never",
		{
			"enforceForClassMembers": true
		}
	],

	// 항상 명시적인 return 강제
	"consistent-return": [
		"error",
		{
			"treatUndefinedAsUnspecified": false
		}
	],

	// this 별칭 일관성
	"consistent-this": [
		"off",
		"self"
	],

	// 생성자에서 super 호출 강제
	"constructor-super": [
		"error"
	],

	// 중괄호 강제 (멀티라인)
	"curly": [
		"error",
		"multi-line"
	],

	// default case 위치 (마지막)
	"default-case-last": [
		"error"
	],

	// switch 기본 case 강제
	"default-case": [
		"error",
		{
			"commentPattern": "^no default$"
		}
	],

	// default parameter 마지막 위치
	"default-param-last": [
		"error"
	],

	// 줄 끝 개행
	"eol-last": [
		"error",
		"always"
	],

	// 엄격한 비교 사용
	"eqeqeq": [
		"error",
		"always",
		{
			"null": "ignore"
		}
	],

	// for 방향 체크
	"for-direction": [
		"error"
	],

	// 함수 호출 공백
	"func-call-spacing": [
		"error",
		"never"
	],

	// 함수 이름 규칙
	"func-names": [
		"warn",
		"as-needed"
	],

	// 함수 스타일 (표현식 + 화살표 함수 허용)
	"func-style": [
		"error",
		"expression",
		{
			"allowArrowFunctions": true
		}
	],

	// 함수 인자 줄바꿈
	"function-call-argument-newline": [
		"off",
		"consistent"
	],

	// 함수 괄호 줄바꿈
	"function-paren-newline": [
		"off",
		"multiline-arguments"
	],

	// generator 별 위치
	"generator-star-spacing": [
		"error",
		{
			"before": false,
			"after": true
		}
	],

	// getter 반환 강제
	"getter-return": [
		"error",
		{
			"allowImplicit": false
		}
	],

	// grouped accessor pairs
	"grouped-accessor-pairs": [
		"error",
		"setBeforeGet"
	],

	// for-in에서 hasOwnProperty 강제
	"guard-for-in": [
		"off"
	],

	// 콜백 에러 파라미터 이름
	"handle-callback-err": [
		"off",
		"^(err|error)$"
	],

	// 식별자 블랙리스트 (deprecated, 대신 id-denylist 사용)
	"id-blacklist": [
		"off"
	],

	// 식별자 denylist
	"id-denylist": [
		"off",
		"data",
		"callback"
	],

	// 식별자 길이
	"id-length": [
		"off",
		{
			"min": 2,
			"max": 40,
			"exceptions": [
				"i",
				"j",
				"k",
				"x",
				"y",
				"_"
			]
		}
	],

	// 식별자 정규식
	"id-match": [
		"off",
		"^[_$a-zA-Z][_$a-zA-Z0-9]*$",
		{
			"properties": false,
			"onlyDeclarations": false,
			"ignoreDestructuring": false
		}
	],

	// 암시적 화살표 줄바꿈
	"implicit-arrow-linebreak": [
		"error",
		"beside"
	],

	// 들여쓰기 (탭 사용, SwitchCase 1단계)
	"indent": [
		"error",
		"tab",
		{
			"SwitchCase": 1,
			"flatTernaryExpressions": false,
			"ignoredNodes": [],
			"offsetTernaryExpressions": true
		}
	],

	// 변수 선언 초기화 위치
	"init-declarations": [
		"off",
		"always"
	],

	// JSX 따옴표
	"jsx-quotes": [
		"error",
		"prefer-double"
	],

	// key / value 공백 스타일
	"key-spacing": [
		"error",
		{
			"beforeColon": false,
			"afterColon": true,
			"mode": "strict"
		}
	],

	// 키워드 앞뒤 공백
	"keyword-spacing": [
		"error",
		{
			"before": true,
			"after": true,
			"overrides": {}
		}
	],

	// 라인 주석 위치
	"line-comment-position": [
		"off",
		{
			"position": "above",
			"ignorePattern": "",
			"applyDefaultPatterns": true
		}
	],

	// 줄바꿈 스타일 (CRLF)
	"linebreak-style": [
		"error",
		"windows"
	],

	// 주석 주변 빈 줄
	"lines-around-comment": [
		"off",
		{
			"beforeBlockComment": true,
			"afterBlockComment": false,
			"beforeLineComment": false,
			"afterLineComment": false,
			"allowBlockStart": true,
			"allowBlockEnd": true,
			"allowClassStart": true,
			"allowClassEnd": true,
			"allowObjectStart": true,
			"allowObjectEnd": true,
			"allowArrayStart": true,
			"allowArrayEnd": true
		}
	],

	// 클래스 멤버 간 빈 줄
	"lines-between-class-members": [
		"error",
		"always",
		{
			"exceptAfterSingleLine": true
		}
	],

	// 논리 할당 연산자
	"logical-assignment-operators": [
		"error",
		"always",
		{
			"enforceForIfStatements": true
		}
	],

	// 최대 줄 길이 제한
	"max-len": [
		"warn",
		{
			"code": 500,
			"tabWidth": 2,
			"ignoreUrls": true,
			"ignoreComments": false,
			"ignoreTrailingComments": false,
			"ignoreStrings": true,
			"ignoreTemplateLiterals": true,
			"ignoreRegExpLiterals": true
		}
	],

	// 최대 중첩 깊이
	"max-depth": [
		"warn",
		4
	],

	// 파일 최대 줄 수
	"max-lines": [
		"off",
		{
			"max": 1000,
			"skipBlankLines": true,
			"skipComments": true
		}
	],

	// 함수 최대 줄 수
	"max-lines-per-function": [
		"off",
		{
			"max": 150,
			"skipBlankLines": true,
			"skipComments": true,
			"IIFEs": true
		}
	],

	// 최대 파라미터 개수
	"max-params": [
		"off",
		{
			"max": 4
		}
	],

	// 최대 중첩 콜백
	"max-nested-callbacks": [
		"off",
		{
			"max": 3
		}
	],

	// 함수 내 최대 statement 수
	"max-statements": [
		"off",
		{
			"max": 40
		}
	],

	// 한 줄 내 최대 statement 수
	"max-statements-per-line": [
		"error",
		{
			"max": 1
		}
	],

	// console 사용 제한
	"no-console": [
		"warn",
		{
			"allow": [
				"warn",
				"error"
			]
		}
	],

	// debugger 금지
	"no-debugger": [
		"error"
	],

	// dup import 금지
	"no-duplicate-imports": [
		"off",
		{
			"includeExports": true
		}
	],

	// else return 금지
	"no-else-return": [
		"error",
		{
			"allowElseIf": false
		}
	],

	// 여러 개의 연속 빈 줄 제한
	"no-multiple-empty-lines": [
		"error",
		{
			"max": 1,
			"maxEOF": 0,
			"maxBOF": 0
		}
	],

	// 라인 끝 공백 금지
	"no-trailing-spaces": [
		"error",
		{
			"skipBlankLines": false,
			"ignoreComments": false
		}
	],

	// 미사용 변수 경고
	"no-unused-vars": [
		"warn",
		{
			"vars": "all",
			"args": "after-used",
			"caughtErrors": "none",
			"ignoreRestSiblings": true,
			"varsIgnorePattern": "^_",
			"argsIgnorePattern": "^_"
		}
	],

	// var 사용 금지
	"no-var": [
		"error"
	],

	// 암시적 형변환 금지
	"no-implicit-coercion": [
		"error",
		{
			"boolean": true,
			"number": true,
			"string": true,
			"allow": []
		}
	],

	// magic number 경고
	"no-magic-numbers": [
		"off",
		{
			"ignore": [
				-1,
				0,
				1,
				2
			],
			"ignoreArrayIndexes": true,
			"enforceConst": true,
			"detectObjects": false
		}
	],

	// prototype 직접 사용 방지
	"no-prototype-builtins": [
		"error"
	],

	// eval 금지
	"no-eval": [
		"error"
	],

	// 암묵적 eval 금지
	"no-implied-eval": [
		"error"
	],

	// new Function 금지
	"no-new-func": [
		"error"
	],

	// 변수 그림자 허용 안 함
	"no-shadow": [
		"error"
	],

	// 파라미터 재할당 금지
	"no-param-reassign": [
		"error",
		{
			"props": true
		}
	],

	// 쓸모없는 문자열 결합 금지
	"no-useless-concat": [
		"error"
	],

	// 불필요한 return 금지
	"no-useless-return": [
		"error"
	],

	// finally 내부에서 흐름 망가뜨리는 코드 금지
	"no-unsafe-finally": [
		"error"
	],

	// 부정 연산자 위치 오류 방지
	"no-unsafe-negation": [
		"error",
		{
			"enforceForOrderingRelations": true
		}
	],

	// 자기 자신과 비교 금지
	"no-self-compare": [
		"error"
	],

	// 자기 자신에 대입 금지
	"no-self-assign": [
		"error",
		{
			"props": true
		}
	],

	// undefined로 초기화 금지
	"no-undef-init": [
		"error"
	],

	// 정의되지 않은 변수 금지
	"no-undef": [
		"error"
	],

	// 중복 case 금지
	"no-duplicate-case": [
		"error"
	],

	// 빈 패턴 금지
	"no-empty-pattern": [
		"error"
	],

	// 빈 블록 금지 (catch 제외 허용)
	"no-empty": [
		"error",
		{
			"allowEmptyCatch": true
		}
	],

	// 불필요한 bind 금지
	"no-extra-bind": [
		"error"
	],

	// 불필요한 boolean 캐스팅 금지
	"no-extra-boolean-cast": [
		"error"
	],

	// 불필요한 괄호 (기본 off: 스타일 충돌 방지)
	"no-extra-parens": [
		"off",
		"all",
		{
			"conditionalAssign": true,
			"returnAssign": false,
			"nestedBinaryExpressions": false,
			"enforceForArrowConditionals": false
		}
	],

	// 불필요한 세미콜론 금지
	"no-extra-semi": [
		"error"
	],

	// new String/Boolean/Number 사용 금지
	"no-new-wrappers": [
		"error"
	],

	// throw에 리터럴만 던지는 것 금지
	"no-throw-literal": [
		"error"
	],

	// 여러 줄 문자열 리터럴 금지
	"no-multi-str": [
		"error"
	],

	// 여러 개의 공백 금지
	"no-multi-spaces": [
		"error",
		{
			"ignoreEOLComments": false
		}
	],

	// iterator 프로퍼티 사용 금지
	"no-iterator": [
		"error"
	],

	// label 사용 최대한 금지
	"no-labels": [
		"error",
		{
			"allowLoop": false,
			"allowSwitch": false
		}
	],

	// Array 생성자 사용 금지
	"no-array-constructor": [
		"error"
	],

	// 네이티브 객체 확장 금지
	"no-extend-native": [
		"error"
	],

	// Math(), JSON() 등 함수 호출 금지
	"no-obj-calls": [
		"error"
	],

	// 8진수 리터럴 금지
	"no-octal": [
		"error"
	],

	// 8진수 escape 금지
	"no-octal-escape": [
		"error"
	],

	// non-octal 10진수 escape 금지
	"no-nonoctal-decimal-escape": [
		"error"
	],

	// 정규식 내 유니코드 문제 방지
	"no-misleading-character-class": [
		"error"
	],

	// with 문 금지
	"no-with": [
		"error"
	],

	// 프로퍼티 앞 공백 금지 (obj .prop 같은 거)
	"no-whitespace-before-property": [
		"error"
	],

	// 도달 불가능한 코드 금지
	"no-unreachable": [
		"error"
	],

	// 도달 불가능한 loop 금지
	"no-unreachable-loop": [
		"error"
	],

	// 사용되지 않는 label 금지
	"no-unused-labels": [
		"error"
	],

	// 사용되지 않는 private class 멤버 금지
	"no-unused-private-class-members": [
		"error"
	],

	// 쓸모없는 할당 금지
	"no-useless-assignment": [
		"error"
	],

	// 쓸모없는 backreference 금지
	"no-useless-backreference": [
		"error"
	],

	// 템플릿 문자열 선호
	"prefer-template": [
		"error"
	],

	// 콜백에서 화살표 함수 선호
	"prefer-arrow-callback": [
		"error",
		{
			"allowNamedFunctions": true,
			"allowUnboundThis": true
		}
	],

	// const 선호
	"prefer-const": [
		"error",
		{
			"destructuring": "all",
			"ignoreReadBeforeAssign": true
		}
	],

	// exponentiation 연산자 선호
	"prefer-exponentiation-operator": [
		"error"
	],

	// 숫자 리터럴 개선
	"prefer-numeric-literals": [
		"error"
	],

	// Object.hasOwn 선호
	"prefer-object-has-own": [
		"error"
	],

	// object spread 선호
	"prefer-object-spread": [
		"error"
	],

	// RegExp literal 선호
	"prefer-regex-literals": [
		"error",
		{
			"disallowRedundantWrapping": true
		}
	],

	// rest 파라미터 선호
	"prefer-rest-params": [
		"error"
	],

	// spread 사용 선호
	"prefer-spread": [
		"error"
	],

	// Promise reject 에러 객체 사용
	"prefer-promise-reject-errors": [
		"error",
		{
			"allowEmptyReject": false
		}
	],

	// strict 모드
	"strict": [
		"error",
		"never"
	],

	// object 프로퍼티 따옴표
	"quote-props": [
		"error",
		"as-needed",
		{
			"keywords": false,
			"unnecessary": true,
			"numbers": false
		}
	],

	// 문자열 따옴표 스타일
	"quotes": [
		"error",
		"backtick",
		{
			"avoidEscape": true,
			"allowTemplateLiterals": true
		}
	],

	// radix 필수
	"radix": [
		"error",
		"always"
	],

	// atomic 업데이트 필요
	"require-atomic-updates": [
		"error",
		{
			"allowProperties": true
		}
	],

	// async 함수 await 강제 (off)
	"require-await": [
		"off"
	],

	// generator yield 강제
	"require-yield": [
		"error"
	],

	// unicode 정규식 사용 (off: 호환성)
	"require-unicode-regexp": [
		"off"
	],

	// rest/spread 뒤 공백 금지
	"rest-spread-spacing": [
		"error",
		"never"
	],

	// 세미콜론 앞뒤 공백
	"semi-spacing": [
		"error",
		{
			"before": false,
			"after": true
		}
	],

	// 세미콜론 위치
	"semi-style": [
		"error",
		"last"
	],

	// 세미콜론 강제
	"semi": [
		"error",
		"always"
	],

	// import 정렬
	"sort-imports": [
		"off",
		{
			"ignoreCase": false,
			"ignoreDeclarationSort": false,
			"ignoreMemberSort": false,
			"allowSeparatedGroups": true
		}
	],

	// 객체 키 정렬
	"sort-keys": [
		"off",
		"asc",
		{
			"caseSensitive": false,
			"natural": true,
			"minKeys": 2
		}
	],

	// 변수 선언 정렬
	"sort-vars": [
		"off",
		{
			"ignoreCase": true
		}
	],

	// 블록 앞 공백
	"space-before-blocks": [
		"error",
		"always"
	],

	// 함수 괄호 앞 공백
	"space-before-function-paren": [
		"error",
		{
			"anonymous": "never",
			"named": "never",
			"asyncArrow": "always"
		}
	],

	// 괄호 내부 공백
	"space-in-parens": [
		"error",
		"never"
	],

	// 연산자 주변 공백
	"space-infix-ops": [
		"error",
		{
			"int32Hint": false
		}
	],

	// 단항 연산자 공백
	"space-unary-ops": [
		"error",
		{
			"words": true,
			"nonwords": false
		}
	],

	// 주석 앞뒤 공백
	"spaced-comment": [
		"error",
		"always",
		{
			"block": {
				"balanced": true
			}
		}
	],

	// switch colon 공백
	"switch-colon-spacing": [
		"error",
		{
			"after": true,
			"before": false
		}
	],

	// 템플릿 리터럴에서 중괄호 주변 공백
	"template-curly-spacing": [
		"error",
		"never"
	],

	// 템플릿 태그와 리터럴 사이 공백
	"template-tag-spacing": [
		"error",
		"never"
	],

	// BOM 사용 금지
	"unicode-bom": [
		"error",
		"never"
	],

	// NaN 비교
	"use-isnan": [
		"error",
		{
			"enforceForSwitchCase": true,
			"enforceForIndexOf": true
		}
	],

	// typeof 비교 문자열 강제
	"valid-typeof": [
		"error",
		{
			"requireStringLiterals": true
		}
	],

	// var hoist 금지
	"vars-on-top": [
		"off"
	],

	// IIFE 감싸기 스타일
	"wrap-iife": [
		"error",
		"outside",
		{
			"functionPrototypeMethods": true
		}
	],

	// 정규식 감싸기
	"wrap-regex": [
		"off"
	],

	// generator 별 위치
	"yield-star-spacing": [
		"error",
		{
			"before": false,
			"after": true
		}
	],

	// yoda 조건 금지
	"yoda": [
		"error",
		"never",
		{
			"exceptRange": false,
			"onlyEquality": false
		}
	],

	// async Promise executor 금지
	"no-async-promise-executor": [
		"error"
	],

	// 루프 안에서 await 사용 경고
	"no-await-in-loop": [
		"warn"
	],

	// Promise executor에서 return 금지
	"no-promise-executor-return": [
		"error"
	],

	// return await 금지
	"no-return-await": [
		"error"
	],

	// 정의 전에 사용 금지
	"no-use-before-define": [
		"error",
		{
			"functions": false,
			"classes": true,
			"variables": false
		}
	],

	// 상수 조건 경고
	"no-constant-condition": [
		"warn",
		{
			"checkLoops": false
		}
	],

	// 이상한 공백 문자 금지
	"no-irregular-whitespace": [
		"error",
		{
			"skipStrings": true,
			"skipComments": false,
			"skipRegExps": true,
			"skipTemplates": true
		}
	],

	// 공백/탭 혼용 금지
	"no-mixed-spaces-and-tabs": [
		"error"
	],

	// loss of precision 방지
	"no-loss-of-precision": [
		"error"
	],

	// script URL 금지
	"no-script-url": [
		"error"
	],

	// 불필요한 ternary 금지 (스타일에 영향 적도록 기본 옵션)
	"no-unneeded-ternary": [
		"error",
		{
			"defaultAssignment": false
		}
	]
};

// TS 전용: @typescript-eslint 규칙 --------------------------------------------------
// TypeScript 전용/타입 기반 검사 및 스타일 규칙 세트
const TS_RULES = {
	"@typescript-eslint/adjacent-overload-signatures": [
		"error"
	],
	"@typescript-eslint/array-type": [
		"warn"
	],
	"@typescript-eslint/await-thenable": [
		"error"
	],
	"@typescript-eslint/ban-ts-comment": [
		"error"
	],
	"@typescript-eslint/ban-tslint-comment": [
		"warn"
	],
	"@typescript-eslint/class-literal-property-style": [
		"off"
	],
	"@typescript-eslint/consistent-generic-constructors": [
		"off"
	],
	"@typescript-eslint/consistent-indexed-object-style": [
		"warn"
	],
	"@typescript-eslint/consistent-type-assertions": [
		"error"
	],
	"@typescript-eslint/consistent-type-definitions": [
		"warn"
	],
	"@typescript-eslint/consistent-type-exports": [
		"off"
	],
	"@typescript-eslint/consistent-type-imports": [
		"error"
	],
	"@typescript-eslint/explicit-function-return-type": [
		"off"
	],
	"@typescript-eslint/explicit-member-accessibility": [
		"off"
	],
	"@typescript-eslint/member-ordering": [
		"off"
	],
	"@typescript-eslint/method-signature-style": [
		"warn"
	],
	"@typescript-eslint/naming-convention": [
		"off"
	],
  	"@typescript-eslint/no-array-constructor": [
		"error"
	],
	"@typescript-eslint/no-confusing-non-null-assertion": [
		"error"
	],
	"@typescript-eslint/no-confusing-void-expression": [
		"error"
	],
	"@typescript-eslint/no-duplicate-enum-values": [
		"error"
	],
	"@typescript-eslint/no-duplicate-type-constituents": [
		"error"
	],
	"@typescript-eslint/no-explicit-any": [
		"warn"
	],
	"@typescript-eslint/no-extra-non-null-assertion": [
		"error"
	],
	"@typescript-eslint/no-floating-promises": [
		"error"
	],
	"@typescript-eslint/no-for-in-array": [
		"error"
	],
	"@typescript-eslint/no-inferrable-types": [
		"off"
	],
	"@typescript-eslint/no-invalid-this": [
		"error"
	],
	"@typescript-eslint/no-misused-new": [
		"error"
	],
	"@typescript-eslint/no-misused-promises": [
		"error"
	],
	"@typescript-eslint/no-namespace": [
		"error"
	],
	"@typescript-eslint/no-non-null-asserted-nullish-coalescing": [
		"error"
	],
	"@typescript-eslint/no-non-null-asserted-optional-chain": [
		"error"
	],
	"@typescript-eslint/no-non-null-assertion": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-boolean-literal-compare": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-condition": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-parameter-property-assignment": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-qualifier": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-template-expression": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-type-assertion": [
		"warn"
	],
	"@typescript-eslint/no-unnecessary-type-constraint": [
		"warn"
	],
	"@typescript-eslint/no-unsafe-argument": [
		"error"
	],
	"@typescript-eslint/no-unsafe-assignment": [
		"error"
	],
	"@typescript-eslint/no-unsafe-call": [
		"error"
	],
	"@typescript-eslint/no-unsafe-declaration-merging": [
		"error"
	],
	"@typescript-eslint/no-unsafe-enum-comparison": [
		"error"
	],
	"@typescript-eslint/no-unsafe-function-type": [
		"error"
	],
	"@typescript-eslint/no-unsafe-member-access": [
		"error"
	],
	"@typescript-eslint/no-unsafe-return": [
		"error"
	],
	"@typescript-eslint/no-unused-expressions": [
		"off"
	],
	"@typescript-eslint/non-nullable-type-assertion-style": [
		"off"
	],
	"@typescript-eslint/prefer-as-const": [
		"warn"
	],
	"@typescript-eslint/prefer-enum-initializers": [
		"off"
	],
	"@typescript-eslint/prefer-for-of": [
		"warn"
	],
	"@typescript-eslint/prefer-includes": [
		"warn"
	],
	"@typescript-eslint/prefer-nullish-coalescing": [
		"warn"
	],
	"@typescript-eslint/prefer-optional-chain": [
		"warn"
	],
	"@typescript-eslint/prefer-reduce-type-parameter": [
		"warn"
	],
	"@typescript-eslint/prefer-regexp-exec": [
		"off"
	],
	"@typescript-eslint/prefer-return-this-type": [
		"off"
	],
	"@typescript-eslint/prefer-string-starts-ends-with": [
		"off"
	],
	"@typescript-eslint/promise-function-async": [
		"off"
	],
	"@typescript-eslint/require-await": [
		"off"
	],
	"@typescript-eslint/restrict-plus-operands": [
		"error"
	],
	"@typescript-eslint/restrict-template-expressions": [
		"warn"
	],
	"@typescript-eslint/strict-boolean-expressions": [
		"warn"
	],
	"@typescript-eslint/switch-exhaustiveness-check": [
		"error"
	],
	"@typescript-eslint/unbound-method": [
		"error"
	],
	"@typescript-eslint/unified-signatures": [
		"warn"
	]
};

// 최종 export: 프로젝트 전체 설정 --------------------------------------------------
export default defineConfig([
	// 0. global ------------------------------------------------------------------
	{
		// 설정 블록 이름
		"name": "global-ignores",
		// 전역 ignore 패턴
		"ignores": [
			...COMMON_IGNORES
		]
	},

	// 1. base-js-ts --------------------------------------------------------------
	{
		// 설정 블록 이름
		"name": "base-js-ts",
		// 기준 경로 (flat config에서 상대 경로 기준)
		"basePath": ".",
		// ESLint JS 추천 규칙 상속
		"extends": [
			js.configs.recommended
		],
		// 대상 파일: JS/TS 전역
		"files": [
			...COMMON_JS_TS_FILES
		],
		// 무시할 파일 패턴 (config 파일 등)
		"ignores": [
			"**/*.config.js",
			"**/*.config.cjs",
			"**/*.config.mjs"
		],
		// 언어 옵션 (ESM JS/TS 공통)
		"languageOptions": {
			...COMMON_LANGUAGE_OPTIONS_ESM,
			"parser": tsParser,
			"parserOptions": {
				...COMMON_LANGUAGE_OPTIONS_ESM.parserOptions,
				"project": "./tsconfig.json"
			}
		},
		// 린터 동작 옵션
		// @ts-ignore
		"linterOptions": {
			...COMMON_LINTER_OPTIONS
		},
		// 플러그인 설정 (추후 확장용 자리)
		"plugins": {
			"@typescript-eslint": tseslint
		},
		"rules": {
			...BASE_RULES,
			...tseslint.configs.recommended.rules,
			...TS_RULES
		},
		// 플러그인별 커스텀 설정 자리
		"settings": {}
	}
]);
