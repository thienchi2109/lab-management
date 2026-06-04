# Supabase Schema Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the Supabase-first database foundation for US-002.

**Architecture:** Supabase Postgres is the MVP database target. Application tables live in `public`, membership helpers live in `private`, and RLS is enabled from the first migration. Live apply is gated on user-provided credentials.

**Tech Stack:** Supabase Postgres, SQL migrations, Next.js App Router, Bun, Harness CLI.

---

## Chunk 1: Offline Contract

### Task 1: Schema Validation Gate

**Files:**

- Create: `scripts/validate-supabase-schema.mjs`
- Create: `supabase/migrations/202606030001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `lab-kit-app/.env.example`

- [x] **Step 1: Write the failing test**

Run:

```bash
node scripts/validate-supabase-schema.mjs
```

Expected: FAIL with missing migration file before schema exists.

- [x] **Step 2: Add minimal schema contract**

Create the migration, seed, and env example required by the validation script.

- [x] **Step 3: Run test to verify it passes**

Run:

```bash
node scripts/validate-supabase-schema.mjs
```

Expected: PASS with `Supabase schema contract passed.`

### Task 2: Harness Story Packet

**Files:**

- Create: `docs/stories/US-002-supabase-schema/overview.md`
- Create: `docs/stories/US-002-supabase-schema/design.md`
- Create: `docs/stories/US-002-supabase-schema/execplan.md`
- Create: `docs/stories/US-002-supabase-schema/validation.md`

- [x] **Step 1: Classify US-002**

Classify as high-risk because it touches data model, RLS, external provider,
and customer showcase setup.

- [x] **Step 2: Record scope and stop conditions**

Document live apply credential gate, secret handling, and non-goals.

## Chunk 2: Harness Durable Records

### Task 3: Record Story State

**Files:**

- Update: `harness.db`

- [x] **Step 1: Record intake**

```bash
scripts/bin/harness-cli intake \
  --type "spec slice" \
  --summary "Build Supabase schema, migrations, and seed baseline for MVP showcase" \
  --lane high-risk \
  --flags "data_model,rls,external_provider,customer_showcase" \
  --docs "docs/stories/US-002-supabase-schema/overview.md,docs/product/data-model.md,docs/product/result-engine.md,docs/product/roles-permissions.md,docs/decisions/0006-nextjs-bun-supabase-stack.md" \
  --story "US-002" \
  --notes "Supabase hosted target; live apply waits for user-provided credentials."
```

- [x] **Step 2: Add story row**

```bash
scripts/bin/harness-cli story add \
  --id US-002 \
  --title "Supabase Schema, Migrations & Seed" \
  --lane high-risk \
  --contract "docs/stories/US-002-supabase-schema/overview.md" \
  --verify "node scripts/validate-supabase-schema.mjs && cd lab-kit-app && bun run quality" \
  --notes "Offline schema/RLS contract ready; live Supabase proof pending credentials."
```

- [x] **Step 3: Mark in progress with offline proof**

```bash
scripts/bin/harness-cli story update \
  --id US-002 \
  --status in_progress \
  --unit 1 \
  --integration 0 \
  --e2e 0 \
  --platform 0 \
  --evidence "Offline schema contract passed on 2026-06-03; live Supabase apply pending credentials."
```

## Chunk 3: Live Supabase Apply

### Task 4: Apply After Credentials

**Files:**

- Read: `supabase/migrations/202606030001_initial_schema.sql`
- Read: `supabase/migrations/202606040002_advisor_fixes.sql`
- Read: `supabase/seed.sql`

- [x] **Step 1: Confirm target project**

Confirm Supabase project ref/URL and whether the project is empty or disposable.

- [x] **Step 2: Apply migration**

Use Supabase MCP or the approved SQL migration path. Do not paste secrets into
tracked files.

- [x] **Step 3: Apply seed**

Seed demo reference data only after migration succeeds.

- [x] **Step 4: Inspect live schema**

Verify tables, RLS enabled state, policies, indexes, and seed rows.

- [x] **Step 5: Run advisors**

Run Supabase security and performance advisors and triage findings before
marking the story implemented.

Live result on 2026-06-04:

- Confirmed target `https://tuuqgpzgollcerqqszjr.supabase.co`.
- Applied `us_002_initial_schema`.
- Applied `us_002_advisor_fixes` as a forward-only follow-up.
- Applied `supabase/seed.sql`.
- Security advisor returned no lints.
- Performance advisor only reports expected fresh-database `unused_index` INFO
  findings after advisor fixes.
