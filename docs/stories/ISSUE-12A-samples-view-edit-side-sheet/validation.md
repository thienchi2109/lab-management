# Validation

## Proof Strategy

- UI proof cho view side sheet read-only.
- Role proof cho Admin/Editor/Viewer actions.
- Regression proof rằng edit side sheet hiện có vẫn hoạt động.
- No-schema proof: không tạo hoặc apply migration.

## Planned Test Plan

- `lab-kit-app/app/dashboard/samples/_components/sample-metadata-client.test.tsx`
  - RED: chưa có action xem chi tiết mở side sheet.
  - Green: view side sheet hiển thị metadata mẫu.
  - Green: Viewer không thấy action cập nhật.
  - Green: Admin/Editor thấy action cập nhật.

- `lab-kit-app/app/dashboard/samples/actions.test.ts`
  - Giữ proof update action hiện có.

## Planned Commands

```bash
cd lab-kit-app && bun run test -- \
  app/dashboard/samples/actions.test.ts \
  app/dashboard/samples/_components/sample-metadata-client.test.tsx
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
```

## Current Evidence

Created on 2026-06-14 after splitting the retired combined story.

- Harness intake #42 recorded with lane `normal`.
- Harness story row `ISSUE-12A-samples-view-edit-side-sheet` created.
- No app code changed.
- No migration created or applied.

## Acceptance Evidence

Pending implementation.
