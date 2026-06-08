# Validation

## Proof Strategy

US-009B hoàn tất khi bảng mẫu chính MVP render được từ contract US-009A, có URL
state, states cơ bản, và row actions đúng quyền.

Proof bắt buộc:

- `DashboardDataTable` được dùng hoặc ngoại lệ được duyệt;
- Build Web Apps plugin capability được invoke trước UI work;
- `code-deduplication` được invoke trước reusable UI/hooks/helpers nếu có;
- Viewer chỉ thấy hành động read-only;
- Admin/Editor dùng hành động hiện có;
- filter/search/sort/page cập nhật URL state;
- loading, empty, error, permission-denied states rõ ràng.

## Test Plan

- Integration/UI: render table từ fixture, filter reset, URL state, sort/page
  interaction, Viewer read-only actions.
- Browser: desktop viewport không overlap, không tràn ngang bất thường.
- Platform: typecheck, lint strict, build, React Doctor.

## Fixtures

- Dữ liệu query từ US-009A.
- User Admin, Editor, Viewer.
- Mẫu có và không có ảnh/kết quả để row summary không vỡ layout.

## Commands

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
bun run react-doctor
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009B --integration 1 --e2e 1 --platform 1
scripts/bin/harness-cli story verify US-009B
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- RED: focused UI tests failed before implementation because
  `sample-grid-page-content`, `loading`, and `error` did not exist, and the
  samples page still loaded metadata instead of `getSampleGridPage()`.
- GREEN focused tests:
  `bun run test app/dashboard/samples/page.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx app/dashboard/samples/loading.test.tsx app/dashboard/samples/error.test.tsx`
  passed 4 files / 8 tests.
- Full test suite: `cd lab-kit-app && bun run test` passed 62 files / 195
  tests.
- Quality gates passed:
  `bun run typecheck`, `bun run lint:strict`, `bun run format:check`,
  `bun run docstring:check`, `bun run build`, and `bun run react-doctor`.
- React Doctor ran through the package script and exited 0; it reported 3
  non-blocking warnings.
- Authenticated browser E2E with `agent-browser`: admin login succeeded, opening
  `/dashboard/samples` rendered the Sample Grid MVP with row `T6_90007`,
  search submit updated URL state to
  `/dashboard/samples?page=1&search=T6_90007&status=all&billingStatus=all&sort=receivedAt&dir=desc`,
  the row remained visible, no Next.js error overlay appeared, and the
  `Kết quả & ảnh` row action opened
  `/dashboard/samples/daa166fb-d089-4b7a-9b58-a7e1a71affd0/results` with
  `Ảnh minh chứng` visible.
- Implementation uses `DashboardDataTable` for the grid MVP, consumes
  `getSampleGridPage()` from US-009A/A.1, preserves URL state for
  search/filter/sort/page, renders loading/error/permission states, and keeps
  Viewer row actions read-only while Admin/Editor actions go to the existing
  results/images flow.
