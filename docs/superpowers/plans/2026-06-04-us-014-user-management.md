# US-014 User Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only user-management screen that reads real users and supports full user lifecycle operations through server-only Supabase admin code.

**Architecture:** Keep domain validation and transition rules in focused pure modules under `lab-kit-app/lib/user-management/`. Use server-only data/action modules for Supabase reads and writes, then compose a Next.js 16 App Router page with small UI components under `/dashboard/users`. Existing `public.audit_events` is the audit table; no new migration is planned.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Bun, Vitest, Supabase JS v2, Tailwind CSS, shadcn-style primitives, lucide-react.

---

## Chunk 1: Domain Model And Validation

### Task 1: Schemas And Last-Admin Guard

**Files:**
- Create: `lab-kit-app/lib/user-management/schemas.test.ts`
- Create: `lab-kit-app/lib/user-management/schemas.ts`
- Create: `lab-kit-app/lib/user-management/last-admin.test.ts`
- Create: `lab-kit-app/lib/user-management/last-admin.ts`

- [ ] **Step 1: Write failing tests**

Cover create/update validation, username normalization, accepted roles, and blocking demotion/deactivation of the final active admin.

- [ ] **Step 2: Run RED**

Run: `cd lab-kit-app && bun run test -- lib/user-management/schemas.test.ts lib/user-management/last-admin.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement minimal pure modules**

Use Zod and existing `normalizeUsername`, `APP_ROLES`, and `AppRole`.

- [ ] **Step 4: Run GREEN**

Run the same focused tests.

Expected: PASS.

## Chunk 2: User Rows And Server Actions

### Task 2: User Row Mapper And Admin Data Port

**Files:**
- Create: `lab-kit-app/lib/user-management/users.test.ts`
- Create: `lab-kit-app/lib/user-management/users.ts`
- Create: `lab-kit-app/app/dashboard/users/actions.ts`

- [ ] **Step 1: Write failing tests**

Cover mapping `profiles` plus `tenant_memberships`, summary counts, filter matching, and action dependency behavior with fake ports.

- [ ] **Step 2: Run RED**

Run: `cd lab-kit-app && bun run test -- lib/user-management/users.test.ts`

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement pure mapper and action service**

Keep Supabase specifics behind an injectable port so core write behavior is testable without network calls.

- [ ] **Step 4: Run GREEN**

Run focused user-management tests.

Expected: PASS.

### Task 3: Server-Only Supabase Implementation

**Files:**
- Create: `lab-kit-app/lib/user-management/server.ts`
- Modify: `lab-kit-app/app/dashboard/users/actions.ts`

- [ ] **Step 1: Write failing tests for service behavior where possible**

Test that actions fail closed for non-admin sessions and call the pure service with parsed data.

- [ ] **Step 2: Implement server query and writes**

Use `getCurrentSession`, `getSupabaseAdminClient`, Supabase Admin Auth
`createUser`/`updateUserById`, `profiles`, `tenant_memberships`, and
`audit_events`.

- [ ] **Step 3: Revalidate**

Call `revalidatePath("/dashboard/users")` after successful mutations.

## Chunk 3: Admin UI

### Task 4: Page And Components

**Files:**
- Create: `lab-kit-app/app/dashboard/users/page.tsx`
- Create: `lab-kit-app/app/dashboard/users/_components/users-page-content.tsx`
- Create: `lab-kit-app/app/dashboard/users/_components/user-management-client.tsx`
- Create: `lab-kit-app/app/dashboard/users/_components/user-summary-strip.tsx`
- Create: `lab-kit-app/app/dashboard/users/_components/user-table.tsx`
- Create: `lab-kit-app/app/dashboard/users/_components/user-form-dialogs.tsx`
- Modify: `lab-kit-app/components/layout/navigation-items.ts`
- Modify: `lab-kit-app/components/layout/topbar.tsx`

- [ ] **Step 1: Write RED tests for exported UI helpers if extracted**

Use node-safe tests for filtering and presentation helpers.

- [ ] **Step 2: Implement server page**

Require admin role. Load real current users and pass them to the client UI.

- [ ] **Step 3: Implement client UI**

Use a dense, modern admin layout: header action, metrics strip, search, role/status filters, table/list, create dialog, edit dialog.

- [ ] **Step 4: Add navigation**

Add Users route to desktop and mobile navigation, visible in shell.

## Chunk 4: Verification And Harness Closeout

### Task 5: Gates

**Files:**
- Modify: `docs/stories/US-014-user-management-role-administration/validation.md`
- Modify: Harness DB story row via `scripts/bin/harness-cli story update`

- [ ] **Step 1: Run tests**

Run: `cd lab-kit-app && bun run test`

- [ ] **Step 2: Run quality**

Run: `cd lab-kit-app && bun run quality`

- [ ] **Step 3: Run live checks**

Use Supabase MCP to inspect identity/audit tables and advisors.

- [ ] **Step 4: Browser verification**

Run the Next dev server and verify `/dashboard/users` desktop and mobile.

- [ ] **Step 5: Harness update**

Update US-014 evidence and matrix only after proof passes.
