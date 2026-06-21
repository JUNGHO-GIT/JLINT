/**
 * @file common.ts
 * @description 공통 설정과 언어 규칙 타입
 * @author Jungho
 * @since 2026-1-4
 */

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export type QuoteType = `single` | `double`;

export type CommonType = {
  activateLint: boolean;
  removeComments: boolean;
  insertLine: boolean;
  insertParen: boolean;
  useTabs: boolean;
  indentSize: number;
  quoteType: QuoteType;
};

export type LanguageName =
  | `Css`
  | `Html`
  | `Java`
  | `Javascript`
  | `Javascriptreact`
  | `Json`
  | `Jsp`
  | `Python`
  | `Rust`
  | `Sql`
  | `Typescript`
  | `Typescriptreact`
  | `Xml`
  | `Yaml`;

export type RemoveCommentsRule = (
  contents: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => Promise<string>;

export type PrettierFormatRule = (
  commonParam: CommonType,
  contents: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => Promise<string>;

export type TextTransformRule = (
  contents: string,
  fileExt: string,
) => Promise<string>;

export type LanguageRules = {
  removeComments: RemoveCommentsRule;
  prettierFormat: PrettierFormatRule;
  insertLine: TextTransformRule;
  insertSpace: TextTransformRule;
};
