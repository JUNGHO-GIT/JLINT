/**
 * @file common.ts
 * @description 공통 설정과 언어 규칙 타입
 * @author Jungho
 * @since 2026-1-4
 */

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export type QuoteType = `single` | `double`;

export type CommonType = {
  activateLint: boolean;
  removeComments: boolean;
  insertLine: boolean;
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
  | `Sql`
  | `Typescript`
  | `Typescriptreact`
  | `Xml`
  | `Yaml`;

export type RemoveCommentsRule = (
  cntnPrm: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => Promise<string>;

export type PrettierFormatRule = (
  commonParam: CommonType,
  cntnPrm: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => Promise<string>;

export type TextTransformRule = (
  cntnPrm: string,
  fileExt: string,
) => Promise<string>;

export type LanguageRules = {
  removeComments: RemoveCommentsRule;
  prettierFormat: PrettierFormatRule;
  insertLine: TextTransformRule;
  insertSpace: TextTransformRule;
};
