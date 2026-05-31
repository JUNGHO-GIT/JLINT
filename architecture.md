# Jlint Architecture

## Structure Map

```text
jlint
|-- src/
|   |-- extension.ts                -> VS Code activation, commands, settings, editor context
|   |-- cores/
|   |   |-- Contents.ts             -> file read and baseline whitespace normalization
|   |   |-- Controller.ts           -> language routing and shared-rule pipeline
|   |   `-- Main.ts                 -> end-to-end format orchestration and editor writeback
|   |-- langs/                      -> per-language LanguageRules implementations
|   |-- rules/                      -> shared syntax, logic, and final-check transforms
|   |-- assets/
|   |   |-- scripts/                -> logging, notification, packaged module loading
|   |   `-- type/domain/common.ts   -> CommonType and LanguageRules contracts
|   `-- exports/                    -> source barrel exports
|-- out/                            -> compiled extension output, generated
|-- package.json                    -> VS Code manifest, commands, settings, engines
`-- readme.md                       -> extension-facing usage documentation
```

## Flow Map

```text
Saved active VS Code document
  -> extension command validates file-backed editor
  -> extension reads Jlint and editor indentation settings
  -> Main loads normalized contents through Contents
  -> Controller resolves VS Code language id to LanguageRules
  -> language module removes comments, formats, inserts language-specific spacing
  -> shared Syntax, Logic, and FinalCheck rules run
  -> Main replaces active editor contents and saves document
```

## Comment Removal Flow

```text
Saved active VS Code document
  -> Jlint: Remove Comments command validates file-backed editor
  -> Controller resolves language id to LanguageRules
  -> language module removeComments runs
  -> command replaces active editor contents and saves document
```

## Language Routing

`Controller.ts` owns the routing map from VS Code language ids and file-extension-like ids to language modules. Each
routed module implements this contract:

```ts
type LanguageRules = {
  removeComments: RemoveCommentsRule;
  prettierFormat: PrettierFormatRule;
  insertLine: TextTransformRule;
  insertSpace: TextTransformRule;
};
```

Unsupported language ids log an error, show a notification, and return the original text.

## Boundaries

- Routing belongs in `src/cores/`.
- Language-specific formatter behavior belongs in `src/langs/`.
- Shared transforms belong in `src/rules/` and must remain language-gated when behavior is not universal.
- Shared settings and rule contracts belong in `src/assets/type/domain/common.ts`.
- VS Code command registration and editor validation belong in `src/extension.ts`.
- `out/` is generated and not edited directly.
- `node_modules/` and packaged `*.vsix` files are dependencies or release artifacts, not source of truth.
