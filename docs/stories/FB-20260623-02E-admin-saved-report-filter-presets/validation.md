# Validation

## Proof Strategy

Story is complete only when Admin persistence and Viewer non-persistence are
proven mechanically and in browser. Proof must show:

- Admin can save default preset for all chart filters.
- Viewer reads saved preset on first load.
- Viewer changes filters without writing preset.
- Viewer save attempt is impossible in UI and rejected at server boundary.
- Preset payload is validated against known chart/filter whitelist.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Preset parser, role guard, merge default filters with saved preset. |
| Integration | Admin save/read, Viewer read, Viewer write denied, invalid payload rejected. |
| E2E | Admin saves preset; Viewer opens `/dashboard/analytics` and sees saved filters; Viewer local filter does not persist after reload/new session. |
| Platform | Supabase migration/RLS/advisor proof if table/policy is added. |
| Performance | Preset read is small and organization-scoped. |
| Logs/Audit | Audit payload uses field-name-only policy or equivalent safe summary. |

## Fixtures

- Admin account.
- Viewer account.
- One organization.
- Four chart preset entries with date filters and at least one additional filter.

## Commands

Add commands after scripts/tests exist.

```text
TBD
```

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
