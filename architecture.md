# JLINT Architecture

## 1. Overview

JLINT is a Universal Language Formatter implemented as a Visual Studio Code extension. It provides formatting and linting capabilities for multiple programming languages by applying a sequence of content processing, language-specific rules, syntax adjustments, and logic refinements.

## 2. Project Structure

The project follows a modular structure under the `src` directory:

```text
src/
├── extension.ts                    # Entry Point (VSCode Extension Activation)
├── assets/
│   ├── scripts/                    # Utility Scripts
│   │   ├── logger.ts               # Logging System
│   │   ├── modules.ts              # Module Loading Utilities
│   │   └── notify.ts               # User Notifications
│   └── types/                      # Type Definitions
│       ├── alias.d.ts              # Type Aliases
│       ├── extension.d.ts          # Extension Types
│       └── plugin.d.ts             # Plugin Types
├── cores/                          # Core Logic
│   ├── Contents.ts                 # Content Reading & Pre-processing
│   ├── Controller.ts               # Language Controller & Delegation
│   └── Main.ts                     # Main Formatting Pipeline Orchestrator
├── exports/                        # Centralized Exports
│   ├── ExportCores.ts              # Core Module Exports
│   ├── ExportLangs.ts              # Language Module Exports
│   ├── ExportLibs.ts               # Library Exports
│   ├── ExportRules.ts              # Rule Exports
│   └── ExportScripts.ts            # Script Exports
├── langs/                          # Language Specific Formatters
│   ├── Css.ts
│   ├── Html.ts
│   ├── Java.ts
│   ├── Javascript.ts
│   ├── Javascriptreact.ts
│   ├── Json.ts
│   ├── Jsp.ts
│   ├── Sql.ts
│   ├── Typescript.ts
│   ├── Typescriptreact.ts
│   ├── Xml.ts
│   └── Yaml.ts
└── rules/                          # General Rules
    ├── Logic.ts                    # Logic Refinements
    └── Syntax.ts                   # Syntax Adjustments
```

## 3. Architecture Flow

The formatting process follows a linear pipeline orchestrated by `src/cores/Main.ts`:

1. **Activation & Trigger**:
    - The extension is activated via `src/extension.ts`.
    - The `extension.Jlint` command is triggered by the user.
    - Configuration (tab size, quote type, etc.) and file context are gathered.

2. **Core Pipeline (`Main.ts`)**:
    The `main` function executes the following steps in order:

    - **Step 1: Content Retrieval (`getContents`)**
        - Reads the file content.
        - Performs basic cleanup: trimming trailing spaces, normalizing line endings, and adjusting indentation based on configuration.

    - **Step 2: Language Processing (`getLanguage`)**
        - Located in `src/cores/Controller.ts`.
        - Identifies the file language based on the extension.
        - Dynamically selects and executes the corresponding module from `src/langs/` (e.g., `Css`, `Html`, `Java`, `Javascript`, etc.).

    - **Step 3: Syntax Rules (`getSyntax`)**
        - Applies general syntax rules defined in `src/rules/Syntax.ts`.

    - **Step 4: Logic Rules (`getLogic`)**
        - Applies logical code improvements defined in `src/rules/Logic.ts`.

3. **Output**:
    - The final formatted content is written back to the file using `fs.writeFileSync`.

## 4. Key Features

- **Universal Support**: Extensible architecture allowing easy addition of new languages in `src/langs/`.
- **Configurable**: Supports user settings for tab size, quote type, comment removal, etc.
- **Modular Design**: Separation of concerns between core logic, language specifics, and general rules.
