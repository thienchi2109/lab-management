# Validation

## Proof Strategy

Story is complete only when report images are proven separate from sample
evidence images, with correct role boundaries and provider safety.

Proof must show:

- Admin can upload and delete report images.
- Viewer can view but cannot upload/delete.
- Max 20 current images in the report gallery is enforced per tenant boundary.
- 5 MB limit and supported MIME types are enforced.
- Report image storage does not use fake samples or mutate `sample_images`.
- Cloudinary secrets/signatures are not exposed.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Metadata validation, max count, MIME type, size limit, public id/url validation. |
| Integration | Admin create/delete with audit, Viewer write/delete denied, list is tenant-scoped. |
| E2E | Admin uploads/deletes; Viewer sees gallery read-only; mobile has no horizontal overflow. |
| Platform | Supabase migration/RLS/advisor proof; Cloudinary smoke when safe. |
| Performance | Gallery reads at most 20 records and optimized image delivery URLs. |
| Logs/Audit | Create/delete audit contains safe field names, no secrets. |

## Fixtures

- Admin account.
- Viewer account.
- One organization with 0, 1 and 20 report images.
- Mock Cloudinary upload/delete responses.
- Optional safe live Cloudinary credentials for smoke.

## Commands

```text
cd lab-kit-app && bun run test --run \
  lib/report-images/operations.test.ts \
  lib/report-images/server.test.ts \
  app/api/reports/images/route.test.ts \
  app/api/reports/images/[imageId]/route.test.ts \
  app/api/reports/images/signature/route.test.ts \
  app/dashboard/analytics/page-report-kit.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run lint:strict
cd lab-kit-app && bun run format:check
cd lab-kit-app && bun run docstring:check
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run build
```

## Acceptance Evidence

Implemented on 2026-06-27.

- RED proof: focused tests initially failed because `report-images` modules and
  routes did not exist; later signature/page bootstrap tests failed because the
  route and client props were missing.
- Focused tests passed: 6 files, 16 tests.
- Quality gates passed: typecheck, lint:strict, format:check, docstring:check,
  react-doctor:diff, build.
- Supabase live project proof used namespace `mcp__supabase_lab_management` with
  project ref `tuuqgpzgollcerqqszjr`. Forward-only migration
  `20260627025715_report_images` was applied. Live proof confirmed
  `public.report_images` exists, RLS is enabled, Viewer/Admin/Editor select
  policy exists, Admin insert/delete policies exist, and
  `create_report_image_with_audit` / `delete_report_image_with_audit` are
  `security definer` RPCs granted to `service_role`.
- Supabase advisors after migration: security warning only for leaked password
  protection disabled; performance advisor reported existing background index
  notices plus newly unused `report_images` indexes because the table was just
  created.
- Browser proof with `agent-browser`: admin login `admin / 123456@`, opened
  `/dashboard/analytics`, verified gallery renders, uploaded
  `/root/images/Capture.PNG`, saw success message and image card, then deleted
  it through the confirm dialog and saw the empty state.
- Cloudinary proof: live browser upload used signed report image signature route
  and direct upload; tests assert API secret is not returned.
