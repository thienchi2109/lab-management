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
- Do not treat a failed first tool-discovery attempt as proof that context-mode
  is unavailable. Continue tracing the available MCP/tool namespaces until
  context-mode is found or every discovery path has failed. If context-mode
  truly cannot be reached, report the complete failure to the user; otherwise,
  avoid false negatives and use context-mode.
- For Vercel CLI work in this repo, always use the repo-specific Vercel access
  token via a temporary environment variable such as `VERCEL_TOKEN=... vercel
  ...`. Do not use global Vercel auth, do not run `vercel login` or
  `vercel logout`, and do not switch the global account because other repos on
  this machine depend on that credential.
- Before modifying code, read Code Review Graph first for a compact map of
  relevant files, symbols, flows, and impact. Use GitNexus/`rg` only after the
  graph narrows the blast radius.
- Always prefer shared components and shared helpers over local duplication.
  Before adding reusable UI, utilities, services, hooks, or helpers, invoke the
  `code-deduplication` skill, search for existing equivalent behavior, and
  centralize repeated code when the shared contract is clear and issue scope
  permits it.
- Do not edit migration files after they have been applied to a live database.
  Any correction must use a follow-up, forward-only migration.
- Before any Supabase MCP write operation, including `apply_migration`, DDL,
  DML, RPC changes, grants, policy changes, or cleanup SQL, you must prove the
  target project first. Query and state the exact MCP namespace, project-ref,
  repo mapping, current migration history, and target tables/functions before
  executing the write. For this repo the expected namespace is
  `mcp__supabase_lab_management` and the expected project-ref is
  `tuuqgpzgollcerqqszjr`. If the namespace or project-ref is missing,
  ambiguous, or different, stop immediately and ask the user; never fall back to
  the generic `mcp__supabase` namespace for this repo.
- React Doctor is a mandatory quality gate before commit and push. Enable the
  tracked hooks once with `scripts/setup-git-hooks.sh`; hooks run from
  `lab-kit-app/` and call `bun run react-doctor:staged` on pre-commit and
  `bun run react-doctor:diff` on pre-push.
- The pre-push hook also runs `bun run docstring:check`. The docstring gate
  checks changed TS/TSX source files against `origin/main...HEAD` and requires
  JSDoc blocks for changed named exports. Barrel re-exports are ignored.
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

Use the generated GitNexus guidance as reference material only. Do not append
the generated `gitnexus:start` block to `AGENTS.md`, and do not commit a
generated `CLAUDE.md`, unless the task explicitly asks for a tooling/docs
change. The repo-specific source of truth remains this file: Code Review Graph
first, GitNexus after narrowing, and `rtk` for CLI commands.

Practical GitNexus checks for this repo:

- Before shared or non-obvious code edits, inspect the narrowed target with the
  most specific GitNexus tool available for symbol context or impact.
- Before commit, run `mcp__gitnexus.detect_changes` on the staged diff and
  compare it with `git diff --cached --name-only`. If GitNexus omits newly
  added files or only reports tracked shared symbols, state that limitation and
  rely on Code Review Graph plus direct diff review for the missing files.
- Treat GitNexus risk/process output as review evidence, not as permission to
  widen issue scope. High or broad impact should trigger narrower tests or a
  follow-up issue, not opportunistic refactors.
- For renames, use `mcp__gitnexus.rename` in dry-run mode first, then review
  both graph-backed edits and lower-confidence text matches before applying.

Keep the GitNexus index current through the CLI:

- Full analysis: `rtk gitnexus analyze /root/lab-management`
- Force rebuild: `rtk gitnexus analyze --force /root/lab-management`
- Status check: `cd /root/lab-management && rtk gitnexus status`
