# Copilot Instructions for JLINT

## Overview
JLINT is a multi-language linter and formatter VS Code extension supporting JavaScript, TypeScript, Java, JSP, HTML, CSS, JSON, and XML. The extension is designed for high performance and ease of use, leveraging Babel and Prettier for core formatting and linting logic.

## Architecture
- **Entry Point:** `src/extension.ts` initializes the extension and registers commands.
- **Core Logic:**
  - `src/core/Controller.ts` and `src/core/Main.ts` handle the main linting/formatting workflow.
  - `src/contents/Contents.ts` manages content extraction and manipulation.
- **Rules:**
  - Language-specific rules are in `src/rules/langs/` (e.g., `Html.ts`, `Javascript.ts`).
  - Utility logic for rules is in `src/rules/utils/`.
  - Syntax definitions (e.g., for SQL-in-XML) are in `src/rules/syntax/`.
- **Type Definitions:**
  - Shared types/interfaces are in `src/assets/types/`.
- **Testing:**
  - Tests are in `src/test/`, with the main entry at `runTest.ts` and suites in `suite/`.

## Developer Workflows
- **Build:**
  - Run `tsc -p .` or use the VS Code build task labeled `build`.
- **Test:**
  - Run tests via `src/test/runTest.ts` (see test runner setup for details).
- **Debug:**
  - Use VS Code's extension debugging features; set breakpoints in TypeScript source.

## Project Conventions
- **Language Rule Pattern:**
  - Each language rule file exports a class with lint/format methods and follows a similar structure for consistency.
- **Error Handling:**
  - Errors are surfaced to users via a modal (see UI logic in the extension entry and core files).
- **Formatting:**
  - Visual separators are inserted for code block clarity (see core logic for implementation).
- **Customization:**
  - User settings are respected; see configuration handling in the extension entry.

## Integration Points
- **External Libraries:**
  - Babel and Prettier are used for parsing/formatting.
- **VS Code API:**
  - Extension uses VS Code API for editor integration, command registration, and UI.

## Examples
- To add a new language rule, create a file in `src/rules/langs/`, export a class with lint/format logic, and register it in the core controller.
- To update error message UI, modify modal logic in the core or extension entry files.

---
For more details, see `README.md` and the referenced source files above.
