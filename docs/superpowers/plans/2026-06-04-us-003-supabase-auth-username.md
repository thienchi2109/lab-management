# US-003 Supabase Auth Username Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Supabase Auth username/password login, protected dashboard routing, and typed Admin/Editor/Viewer RBAC helpers.

**Architecture:** Supabase Auth remains the session/JWT provider. The UI accepts username/password, while a server-only service client resolves username aliases to internal auth emails before calling Supabase Auth. App logic is split into small files for validation, Supabase client factories, auth actions, session helpers, and permissions.

**Tech Stack:** Next.js App Router, Bun, Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js`, Zod, Bun test.

---

## Chunk 1: Harness And Schema Contract

### Task 1: Write Username Schema Test

**Files:**
- Modify: `scripts/validate-supabase-schema.mjs`
- Create: `supabase/migrations/202606040003_username_auth_alias.sql`

- [ ] Add failing validator assertions for `profiles.username`, normalized unique index, and username check constraint.
- [ ] Run `node scripts/validate-supabase-schema.mjs`; expected failure mentions missing username alias contract.
- [ ] Add forward-only migration with `alter table public.profiles add column username text`, backfill-safe check, and unique lower(username) index.
- [ ] Run validator again; expected pass.
- [ ] Apply migration through Supabase MCP only after offline validation passes.

## Chunk 2: Pure Auth Logic

### Task 2: Test Validation And RBAC Helpers

**Files:**
- Create: `lab-kit-app/lib/auth/auth-types.ts`
- Create: `lab-kit-app/lib/auth/login-schema.ts`
- Create: `lab-kit-app/lib/auth/permissions.ts`
- Create: `lab-kit-app/lib/auth/login-schema.test.ts`
- Create: `lab-kit-app/lib/auth/permissions.test.ts`
- Modify: `lab-kit-app/package.json`

- [ ] Add `test: "bun test"` script.
- [ ] Write failing Bun tests for username normalization and invalid login input.
- [ ] Implement Zod login schema.
- [ ] Write failing Bun tests for role parsing and `hasRole`.
- [ ] Implement role helper functions.
- [ ] Run `cd lab-kit-app && bun test`; expected pass.

## Chunk 3: Supabase Integration

### Task 3: Test Env Parsing And Lazy Clients

**Files:**
- Create: `lab-kit-app/lib/env.ts`
- Create: `lab-kit-app/lib/supabase/server.ts`
- Create: `lab-kit-app/lib/supabase/admin.ts`
- Create: `lab-kit-app/lib/auth/session.ts`
- Modify: `lab-kit-app/.env.example`

- [ ] Write failing tests for env parsing without leaking server-only Supabase keys to public config.
- [ ] Implement lazy env parsing and Supabase client factories.
- [ ] Keep all SDK initialization inside functions so `next build` can evaluate modules without runtime secrets.
- [ ] Keep `.env.example` entries for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.

## Chunk 4: Routes And UI

### Task 4: Login, Logout, And Protected Dashboard

**Files:**
- Create: `lab-kit-app/app/login/page.tsx`
- Create: `lab-kit-app/app/login/actions.ts`
- Create: `lab-kit-app/app/auth/signout/route.ts`
- Create: `lab-kit-app/middleware.ts`
- Modify: `lab-kit-app/app/page.tsx`
- Modify: `lab-kit-app/app/dashboard/layout.tsx`
- Modify: `lab-kit-app/components/layout/topbar.tsx`

- [ ] Write failing tests or small proof scripts for login action input handling where practical.
- [ ] Implement login page as a Server Component with a small form.
- [ ] Implement `loginWithUsername` Server Action.
- [ ] Implement sign-out route.
- [ ] Protect `/dashboard` in middleware and dashboard layout.
- [ ] Add authenticated user context display in the shell without exposing email when username exists.

## Chunk 5: Verification And Closeout

### Task 5: Verify And Record Harness Evidence

**Files:**
- Modify: `docs/stories/US-003-auth-session-rbac-shell/validation.md`
- Modify: `docs/stories/backlog.md`

- [ ] Run `cd lab-kit-app && bun test`.
- [ ] Run `cd lab-kit-app && bun run quality`.
- [ ] Run `scripts/bin/harness-cli query matrix`.
- [ ] Run Supabase MCP security and performance advisors.
- [ ] Update validation evidence and story status.
- [ ] Commit focused changes and push branch.
