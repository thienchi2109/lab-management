# FB-20260615-02A - Query contract và export parity cho bộ lọc mẫu

## Status

implemented

## Lane

normal

## Product Contract

Slice này thuộc story cha `FB-20260615-02` và khóa contract query trước khi làm
server option/UI. Trang Mẫu dùng cùng filter contract cho list, pagination và
export.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/stories/FB-20260615-02-sample-search-filters/overview.md`

## Acceptance Criteria

- `parseSampleGridQuery` có default date range 10 ngày gần nhất khi URL chưa có
  filter ngày.
- Sort mặc định cố định ngày mới nhất trước; UI không cần truyền sort
  direction.
- Query contract hỗ trợ `receivedFrom`, `receivedTo`, `sampleTypeId`,
  customer/company text hoặc ID theo contract hiện có, và nhiều
  `resultGroupIds`.
- Parser bỏ qua hoặc normalize input không hợp lệ về state an toàn.
- Export parser nhận cùng filter contract để export đúng dữ liệu đã lọc.
- Contract cũ cho filter trạng thái mẫu/thanh toán không được phát sinh từ
  filter UI mới.

## Design Notes

- Commands: không mutate dữ liệu.
- Queries: query string là nguồn URL state cho trang Mẫu.
- API: `POST /api/export/samples` dùng cùng filter whitelist.
- Tables: không đổi schema.
- Domain rules: không đổi thuật toán Kết Quả Chung.
- UI surfaces: không render UI trong slice này.

## Frontend, Reuse, And Caching Constraints

- Không thêm TanStack Query.
- Không thêm component UI mới trong slice này.
- Giữ shared query/export helper nếu contract bị trùng giữa list và export.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `lib/sample-grid/query.test.ts`, `lib/export/query.test.ts`. |
| Integration | Export route/parser giữ cùng filter contract. |
| E2E | Không yêu cầu. |
| Platform | `bun run typecheck`, `bun run react-doctor:diff`. |
| Release | Chưa yêu cầu. |

## Harness Delta

Không có.

## Evidence

- 2026-06-17: Implemented query/export contract parity cho `FB-20260615-02A`.
  Evidence: `cd lab-kit-app && bun run test --run lib/sample-grid/query.test.ts
  lib/export/query.test.ts app/api/export/samples/route.test.ts && bun run
  typecheck && bun run react-doctor:diff` pass với 3 test files / 22 tests,
  TypeScript pass, React Doctor diff không có issue.
