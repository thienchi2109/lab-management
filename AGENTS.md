# Agent Instructions

## Project Rules

- Code files must not exceed 350 lines. Treat this as a hard limit and keep
  new or modified code split into focused files before crossing it.
- Always prefer context-mode tools first for gathering, searching, reading, or
  summarizing context. Use `rtk` as the fallback or for short shell commands
  when context-mode is not appropriate.
- Do not edit migration files after they have been applied to a live database.
  Any correction must use a follow-up, forward-only migration.

<!-- HARNESS:BEGIN -->
## Harness

This repo uses Harness. Before work, read:

- `README.md`
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTEXT_RULES.md`
- `scripts/bin/harness-cli query matrix` on macOS/Linux, or `.\scripts\bin\harness-cli.exe query matrix` on Windows

Use the Rust Harness CLI at `scripts/bin/harness-cli` on macOS/Linux or
`scripts/bin/harness-cli.exe` on Windows as the main operational tool.
<!-- HARNESS:END -->
