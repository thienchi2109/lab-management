# Validation

## Proof Strategy

US-009A hoàn tất khi query contract được test độc lập và chứng minh không tải
toàn bộ dataset cho bảng mẫu chính.

Proof bắt buộc:

- normalize page/page size/search/filter/sort;
- page size cap;
- whitelist sort/filter phía server;
- invalid input fallback hoặc reject an toàn;
- tenant isolation;
- role read behavior cho Admin, Editor, Viewer;
- response chỉ trả dữ liệu đủ cho một page.

## Test Plan

- Unit: normalize `searchParams`, default sort, page size cap, whitelist filter
  và sort.
- Integration: query trả đúng một page, search/filter/sort kết hợp không phá
  tenant scope, invalid input không mở truy vấn ngoài whitelist.
- Platform: typecheck, lint strict, build; React Doctor nếu có TS/TSX changed.

## Fixtures

- Ít nhất hai tenant/organization.
- Mẫu ở nhiều trạng thái, loại mẫu, khách hàng/công ty, kit, và ngày nhận.
- User Admin, Editor, Viewer.

## Commands

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009A --unit 1 --integration 1 --platform 1
scripts/bin/harness-cli story verify US-009A
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- RED: `bun run test lib/sample-grid/query.test.ts lib/sample-grid/operations.test.ts lib/sample-grid/server.test.ts` failed before implementation because `./query`, `./operations`, and `./server` did not exist.
- GREEN focused tests: `bun run test lib/sample-grid/query.test.ts lib/sample-grid/operations.test.ts lib/sample-grid/server.test.ts` passed `3` files and `8` tests.
- Full tests: `bun run test` passed `59` files and `188` tests.
- Typecheck: `bun run typecheck` passed.
- Lint strict: `bun run lint:strict` passed.
- Build: `bun run build` passed.
- React Doctor: `bun run react-doctor` exited `0` with `2` non-blocking performance warnings.
- React Doctor verbose: `bun run react-doctor:verbose` reported the same
  `react-doctor/async-parallel` warnings at
  `app/api/samples/[sampleId]/images/[imageId]/route.ts:21` and
  `lib/sample-images/operations.ts:128`; both are outside US-009A.
- React Doctor diff: `bun run react-doctor:diff` found no issues for
  `feature/us-009a-data-grid-query-contract -> main`.
- Docstring gate: `bun run docstring:check` passed before staging; rerun after staging before commit.
- Harness: `scripts/bin/harness-cli story verify US-009A` passed after updating
  the durable verify command to non-recursive `true`.
