# Validation

## Proof Strategy

Story is complete only when report images are proven separate from sample
evidence images, with correct role boundaries and provider safety.

Proof must show:

- Admin can upload and delete report images.
- Viewer can view but cannot upload/delete.
- Max 20 images per organization is enforced.
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

Add commands after scripts/tests exist.

```text
TBD
```

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
