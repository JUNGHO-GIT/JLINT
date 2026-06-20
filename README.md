# Jlint

## Overview

Jlint is a VS Code extension for formatting and cleanup across common web, server, and data document types. It runs
from editor commands and combines language-specific formatters with shared syntax, logic, and final-check rules.

## Commands

- `Jlint` formats the active saved editor document.
- `Jlint: Remove Comments` removes comments from the active saved editor document.
- `alt+shift+f` runs `Jlint` when an editor has focus.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `Jlint.logLevel` | `info` | Output channel logging level: `off`, `debug`, `info`, `warn`, or `error`. |
| `Jlint.activateLint` | `true` | Enables the full formatter and shared-rule pipeline. |
| `Jlint.removeComments` | `true` | Removes comments before formatting when linting is active. |
| `Jlint.insertLine` | `false` | Inserts language-specific separator lines where supported. |
| `Jlint.quoteType` | `double` | Uses `single` or `double` quote preference for supported formatters. |

## Supported Languages

- CSS and SCSS: `css`, `scss`
- HTML and JSP: `html`, `htm`, `jsp`, `jspx`
- Java and SQL: `java`, `jav`, `sql`, `plsql`
- JSON and YAML: `json`, `jsonc`, `yaml`, `yml`, `spring-boot-properties-yaml`
- XML and MyBatis: `xml`, `mybatis`
- JavaScript and TypeScript: `javascript`, `js`, `javascriptreact`, `jsx`, `typescript`, `ts`,
  `typescriptreact`, `tsx`

## Project Structure

- `src/extension.ts` registers VS Code commands, reads workspace settings, and passes editor context to the core.
- `src/cores/` coordinates content loading, language routing, shared rules, and editor writeback.
- `src/langs/` contains modules that implement the common language-rule contract.
- `src/rules/` contains shared syntax, logic, and final-check transforms.
- `src/assets/` contains logger, notification, dynamic module-loading helpers, and shared domain types.
- `src/exports/` contains barrel exports for the extension source.

## Notes

- The extension targets saved file-backed documents. Unsaved or virtual editor documents are rejected.
- `out/`, `node_modules/`, and `*.vsix` files are generated or packaged artifacts and are not source of truth.
- Use `bunx tsc --noEmit` for the current type-check gate.
