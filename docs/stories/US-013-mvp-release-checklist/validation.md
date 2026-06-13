# US-013 Validation Report

Date: 2026-06-13

## Scope

Production release checklist for Lab Management MVP on Vercel, Supabase and
Cloudinary.

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `scripts/bin/harness-cli query matrix` | pass | US-013 tracked in Harness matrix. |
| `bun run test` | pass | 93 files / 338 tests passed. |
| `bun run quality` | pass | Typecheck, ESLint strict, Prettier, React Doctor and Next build passed after hiding ignored local `.env.local` and `.next` artifacts. |
| `vercel pull --yes --environment=production` | pass | Used repo-specific `VERCEL_TOKEN`; no global auth. |
| `vercel build --prod` | pass | Prebuilt `.vercel/output` created. |
| `vercel deploy --prebuilt --prod --yes` | pass | Deployment `dpl_A3P763tgSnTd9VNetZhwMmBJEua4` ready. |
| `vercel inspect https://aquatic-lab.vercel.app` | pass | Production alias points to ready deployment. |

## Results

| Check | Result | Notes |
| --- | --- | --- |
| Typecheck | pass | Included in `bun run quality`. |
| Unit | pass | `bun run test`: 93 files / 338 tests. |
| Integration | partial | Supabase reads, export APIs and Cloudinary signature passed; water-quality config gap remains. |
| E2E | partial | Browser smoke covered login, dashboard, samples grid, PCR result-entry render, export and Cloudinary signature. |
| Platform | pass | Vercel production deployment ready and aliased. |
| Release | partial | Production deploy works, but water-quality result-entry acceptance cannot be verified until issue #70 is resolved. |

## Evidence

- Production URL: `https://aquatic-lab.vercel.app`
- Deployment ID: `dpl_A3P763tgSnTd9VNetZhwMmBJEua4`
- Inspect URL:
  `https://vercel.com/aquatic-lab-s-projects/aquatic-lab/A3P763tgSnTd9VNetZhwMmBJEua4`
- Supabase migrations read from `mcp__supabase_lab_management`; latest migration
  `20260613032412 lock_sample_results_rpc_selected_template_id`.
- Production seed counts: 1 organization, 3 profiles, 3 memberships, 1 admin, 1
  editor, 1 viewer, 1 result group, 2 result metrics, 1 result template, 11
  samples before smoke checks.
- Export samples returned CSV 200.
- Export normalized results returned CSV 200.
- Cloudinary signature endpoint returned 200 with signed upload payload.

## Gaps

- Issue #69 tracks the remaining React Doctor warning in
  `lib/sample-grid/operations.ts:120`.
- Issue #70 tracks the missing water-quality result configuration needed to
  verify the full Phase 12 acceptance criterion.
- Backup/restore was checked as an operational requirement, but restore was not
  executed against production. Any restore drill must use a branch or separate
  restore project.
