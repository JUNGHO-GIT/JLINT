# JLINT Architecture

## Structure Map

```text
JLINT
|-- src/
|   |-- cores/       -> formatter routing and orchestration
|   |-- langs/       -> language-specific formatters
|   |-- rules/       -> reusable cleanup and transform rules
|   |-- assets/      -> helpers and shared types
|   `-- exports/     -> public barrels
|-- out/             -> compiled extension output
`-- package.json     -> extension metadata and scripts
```

## Flow Map

```text
Active document
  -> core router selects formatter path
  -> shared rules run
  -> language module completes formatting
  -> VS Code receives the result
```

## Boundaries

- Routing belongs in `src/cores/`.
- Shared transforms belong in `src/rules/`.
- `out/` is generated and not edited directly.