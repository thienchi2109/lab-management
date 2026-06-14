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
cd lab-kit-app && bun run test components/ui/overlay-frame.test.tsx \
  app/dashboard/layout.test.tsx \
  app/dashboard/samples/_components/sample-create-overlay-bridge.test.tsx \
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx \
  app/dashboard/samples/_components/sample-metadata-dialogs.test.tsx \
  app/dashboard/samples/_components/sample-metadata-client.test.tsx \
  app/dashboard/samples/page.test.tsx
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
cd lab-kit-app && bun run build
```

## Current Evidence

Created on 2026-06-14 after splitting the retired combined story.

- Harness intake #42 recorded with lane `normal`.
- Harness story row `ISSUE-12A-samples-view-edit-side-sheet` created.
- No app code changed.
- No migration created or applied.

## Acceptance Evidence

Implemented on 2026-06-14.

- TDD RED evidence:
  - Global primitive test failed before `SideSheetFrame` sticky footer support.
  - Bridge tests failed before view/edit metadata request events were handled.
  - Samples grid tests failed before read/update row actions were exposed.
  - Build failed once after implementation because `SampleGridRow.status` was a
    broad `string`; fixed at the Samples boundary with a typed mapper using
    metadata schema guards.
- Unit/integration proof:
  - `cd lab-kit-app && bun run test components/ui/overlay-frame.test.tsx app/dashboard/layout.test.tsx app/dashboard/samples/_components/sample-create-overlay-bridge.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx app/dashboard/samples/_components/sample-metadata-dialogs.test.tsx app/dashboard/samples/_components/sample-metadata-client.test.tsx app/dashboard/samples/page.test.tsx`
    passed: 7 files / 29 tests.
  - `cd lab-kit-app && bun run test` passed: 104 files / 378 tests.
- Platform proof:
  - `cd lab-kit-app && bun run react-doctor:diff` passed with no issues found.
  - `cd lab-kit-app && bun run docstring:check` passed.
  - `cd lab-kit-app && bun run build` passed.
- Browser proof:
  - Agent Browser verified `/dashboard/samples` as admin.
  - Row `Xem chi tiết` opens the read-only right side sheet for `T6_33455`.
  - Row `Cập nhật` opens the edit right side sheet for `T6_33455` with form
    fields and footer actions.
- Quality caveat:
  - `cd lab-kit-app && bun run quality` reached typecheck, lint strict, and
    format successfully, then failed at full React Doctor because local
    `.env.local` and `.next/dev` artifacts contain secret-looking values. This
    is a local environment artifact; `react-doctor:diff` passed for the story
    diff.
- Scope proof:
  - No migration created or applied.
  - No soft delete, bulk selection, or RLS change included.
