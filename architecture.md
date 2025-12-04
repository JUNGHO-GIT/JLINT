# Architecture

## Overview

`JLINT` follows a **Pipeline-Controller-Module** architecture to ensure high performance and extensibility. It processes code through a linear pipeline of pre-processing, language-specific handling, and global rule application.

## Project Structure

```text
src/
├── extension.ts           # Entry Point (Activation & Configuration)
├── cores/                 # Core Logic (Pipeline & Orchestration)
├── langs/                 # Language Modules (Formatters & Linters)
├── rules/                 # Global Rules (Syntax & Logic)
├── exports/               # Centralized Exports
└── assets/                # Utilities (Logger, Notify, Types)
```

## Core Components

| Component | Role | Related Features (from Readme) |
| :--- | :--- | :--- |
| **Main (Core)** | Orchestrates the entire formatting pipeline | **Fast & Efficient** |
| **Controller (Core)** | Detects language & delegates to modules | **Multi-Language** |
| **Contents (Core)** | Handles file reading & pre-processing | **Easy to Use** |
| **Langs Modules** | Implements specific language rules | **Multi-Language** (JS, Java, HTML...) |
| **Logic (Rules)** | Applies visual separators & logic fixes | **Visual Separation** |
| **Syntax (Rules)** | Corrects general syntax errors | **Fast & Efficient** |

## Data Flow

1. **User Action**: Triggers formatting via `Alt+Shift+F`.
2. **Extension Layer**: Captures editor context and invokes `Main.ts`.
3. **Pre-processing**: `Contents.ts` normalizes line endings and indentation.
4. **Delegation**: `Controller.ts` selects the appropriate module from `langs/`.
5. **Rule Application**: Global `Syntax` and `Logic` rules are applied.
6. **Output**: Formatted code is written back to the editor.
