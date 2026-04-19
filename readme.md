# Jlint

## Overview

Jlint is a VS Code extension that formats multiple document types through shared
rules and language-specific formatters.

## Structure

* `src/cores/` coordinates formatter selection and execution flow
* `src/langs/` contains language-specific formatting logic
* `src/rules/` contains shared cleanup and normalization rules
* `src/assets/` and `src/exports/` provide shared helpers and barrel exports

## Notes

* The extension focuses on editor commands rather than a standalone formatter CLI.
* Shared rules are kept separate from language modules to limit coupling.
