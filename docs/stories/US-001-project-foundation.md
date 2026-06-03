# US-001 — Project Foundation & Quality Gates

**Lane:** tiny  
**Phase:** 0  
**Status:** ready  
**Affects:** project scaffold, developer tooling  
**Risk flags:** 0 (no auth, no data model, no domain logic)

## Goal

Scaffold the Next.js App Router project with Bun, configure quality gates,
install shadcn/ui, create dashboard shell layout, and add a health check
endpoint.

## Acceptance Criteria

- [ ] Next.js App Router project created with TypeScript
- [ ] Bun configured as package manager
- [ ] Tailwind CSS + shadcn/ui initialized
- [ ] ESLint configured with strict rules (no-explicit-any: error)
- [ ] tsconfig strict mode enabled
- [ ] Quality gate scripts in package.json (typecheck, lint:strict, format:check, build, quality)
- [ ] Dashboard shell layout with responsive sidebar + topbar
- [ ] Health check endpoint at /api/health returning 200
- [ ] `bun run quality` passes
- [ ] No `any` in new code

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
| lab-kit-app/components/layout/sidebar.tsx | NEW |
| lab-kit-app/components/layout/topbar.tsx | NEW |

## Validation

```bash
bun run typecheck
bun run lint:strict
bun run format:check
bun run build
curl http://localhost:3000/api/health
```

## Product Docs

- docs/product/tech-stack.md
- docs/product/overview.md

## Notes

This is purely scaffolding. No domain logic, no database connection, no auth.
The dashboard shell is a visual skeleton only.
