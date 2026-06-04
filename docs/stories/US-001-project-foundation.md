# US-001 — Project Foundation & Quality Gates

**Lane:** tiny  
**Phase:** 0  
**Status:** implemented  
**Affects:** project scaffold, developer tooling  
**Risk flags:** 0 (no auth, no data model, no domain logic)

## Goal

Scaffold the Next.js App Router project with Bun, configure quality gates,
install shadcn/ui, create dashboard shell layout, and add a health check
endpoint.

## Acceptance Criteria

- [x] Next.js App Router project created with TypeScript
- [x] Bun configured as package manager
- [x] Tailwind CSS + shadcn/ui initialized
- [x] ESLint configured with strict rules (no-explicit-any: error)
- [x] tsconfig strict mode enabled
- [x] Quality gate scripts in package.json (typecheck, lint:strict, format:check, build, quality)
- [x] Dashboard shell layout with desktop header navbar and mobile bottom navbar
- [x] Health check endpoint at /api/health returning 200
- [x] `bun run quality` passes
- [x] No `any` in new code

## Files Expected

| Path | Action |
| --- | --- |
| lab-kit-app/package.json | NEW |
| lab-kit-app/tsconfig.json | NEW |
| lab-kit-app/eslint.config.mjs | NEW |
| lab-kit-app/next.config.ts | NEW |
| lab-kit-app/app/layout.tsx | NEW |
| lab-kit-app/app/page.tsx | NEW |
| lab-kit-app/app/(dashboard)/layout.tsx | NEW |
| lab-kit-app/app/(dashboard)/page.tsx | NEW |
| lab-kit-app/app/api/health/route.ts | NEW |
| lab-kit-app/components/layout/topbar.tsx | NEW |
| lab-kit-app/components/layout/bottom-nav.tsx | NEW |

## Validation

```bash
bun run typecheck
bun run lint:strict
bun run format:check
bun run build
curl http://localhost:3000/api/health
```

Latest proof:

- `bun install` completed with Bun `1.3.14`.
- `bun run quality` passed on 2026-06-03.
- `/api/health` returned HTTP 200 with `{"status":"healthy",...}` on 2026-06-03.
- Foundation commit: `b71e9db feat(foundation): scaffold Next.js application & configure strict quality gates (US-001)`.
- Harness verify command: `cd lab-kit-app && bun run quality`.

Replay Harness DB row on a fresh environment:

```bash
scripts/bin/harness-cli init
scripts/bin/harness-cli intake \
  --type "spec slice" \
  --summary "Complete Phase 0 project foundation and quality gates" \
  --lane tiny \
  --flags "0" \
  --docs "docs/stories/US-001-project-foundation.md,docs/product/tech-stack.md,docs/product/overview.md" \
  --story "US-001" \
  --notes "No auth, database, or domain logic; scaffold and quality gates only."
scripts/bin/harness-cli story add \
  --id US-001 \
  --title "Project Foundation & Quality Gates" \
  --lane tiny \
  --contract "docs/stories/US-001-project-foundation.md" \
  --verify "cd lab-kit-app && bun run quality" \
  --notes "Phase 0 scaffold and tooling."
scripts/bin/harness-cli story update \
  --id US-001 \
  --status implemented \
  --unit 0 \
  --integration 0 \
  --e2e 0 \
  --platform 1 \
  --evidence "bun run quality passed and /api/health returned HTTP 200 on 2026-06-03; foundation commit b71e9db."
```

## Product Docs

- docs/product/tech-stack.md
- docs/product/overview.md

## Notes

This is purely scaffolding. No domain logic, no database connection, no auth.
The dashboard shell is a visual skeleton only.
