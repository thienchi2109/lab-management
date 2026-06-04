# Agent Instructions

## Project Rules

- Code files must not exceed 350 lines. Treat this as a hard limit and keep
  new or modified code split into focused files before crossing it.
- All Vietnamese user-facing text, documentation, issue/PR text, comments, and
  agent responses for this repo must use full Vietnamese diacritics. Do not
  write Vietnamese without accents.
- Always prefer context-mode tools first for gathering, searching, reading, or
  summarizing context. Use `rtk` as the fallback or for short shell commands
  when context-mode is not appropriate.
- Before modifying code, read Code Review Graph first for a compact map of
  relevant files, symbols, flows, and impact. Use GitNexus/`rg` only after the
  graph narrows the blast radius.
- Do not edit migration files after they have been applied to a live database.
  Any correction must use a follow-up, forward-only migration.
- React Doctor is a mandatory quality gate before commit and push. Enable the
  tracked hooks once with `scripts/setup-git-hooks.sh`; hooks run from
  `lab-kit-app/` and call `bun run react-doctor:staged` on pre-commit and
  `bun run react-doctor:diff` on pre-push.
- Run React Doctor through the package scripts, not `bunx` or `bun x`.
  The scripts intentionally use
  `npm exec --yes --package react-doctor@latest -- react-doctor ...` because
  Bun can crash on React Doctor's optional native dependency installation in
  this environment. For a full manual gate, run `cd lab-kit-app && bun run
  react-doctor` or `bun run quality`.

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

## Code Review Graph

The repo is registered with Code Review Graph as alias `lab-management`.

Before code edits, use the graph as the first codebase-reading layer:

1. Run `code-review-graph` context first, starting with minimal context for the
   task or changed files.
2. Use the graph result to choose the files/symbols to read next.
3. Use GitNexus/`rg` for precise call relationships or text search only after
   the graph has narrowed the candidate area.

Keep the graph current through the CLI:

- Full rebuild: `rtk code-review-graph build --repo /root/lab-management`
- Incremental refresh: `rtk code-review-graph update --repo /root/lab-management`
- Status check: `rtk code-review-graph status --repo /root/lab-management`

## GitNexus

The repo is indexed by GitNexus as `lab-management`.

Use GitNexus after Code Review Graph has narrowed the candidate area:

1. Run `mcp__gitnexus.context` for the target symbol before changing shared or
   non-obvious code.
2. Run `mcp__gitnexus.detect_changes` before commit for code changes to verify
   the affected symbols and flows match the intended scope.
3. For renames, use `mcp__gitnexus.rename` in dry-run mode before editing.

Keep the GitNexus index current through the CLI:

- Full analysis: `rtk gitnexus analyze /root/lab-management`
- Force rebuild: `rtk gitnexus analyze --force /root/lab-management`
- Status check: `cd /root/lab-management && rtk gitnexus status`
