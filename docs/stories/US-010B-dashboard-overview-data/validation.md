# Validation

## Proof Strategy

US-010B hoàn tất khi `/dashboard` hiển thị dữ liệu thật bounded và role read
flow pass cho Viewer.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | mapper/view model cho cards, trend, recent samples |
| Integration | dashboard data loader dùng actor hợp lệ và limit/date window |
| E2E | anonymous redirect; Admin/Editor/Viewer mở `/dashboard`; no error overlay |
| Platform | `bun run quality`, React Doctor package script, Next build |
| Performance | recent samples có limit; trend có date window |

## Fixtures

Use existing sample/result fixtures hoặc test doubles. Browser E2E nên dùng
admin/editor/viewer auth fixtures nếu có sẵn.

## Commands

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-010B
```

## Acceptance Evidence

Pending implementation.
