# Exec Plan

## Goal

Triển khai slice nhỏ nhất để sample grid lọc được theo một hoặc nhiều nhóm chỉ
tiêu, giữ server-side pagination, tenant boundary và URL state hiện có.

## Scope

- Parser/query contract: `lib/sample-grid/query.ts`.
- Domain operation contract: `lib/sample-grid/operations.ts`.
- Supabase adapter: `lib/sample-grid/server.ts`.
- UI filter: `app/dashboard/samples/_components/sample-grid-page-content.tsx`
  và component/helper gần nhất nếu cần.
- Tests focused tương ứng trong `lib/sample-grid/*test.ts` và
  `sample-grid-page-content.test.tsx`.

## TDD Flow

1. RED: thêm parser tests cho `resultGroupIds` lặp, dedupe, invalid values và
   max count.
2. RED: thêm operations test chứng minh `listSampleGridPage` truyền
   `filters.resultGroupIds` xuống port và pagination vẫn đúng.
3. RED: thêm server adapter test cho tenant filter, bảng nối
   `sample_result_groups`, no duplicate rows/count khi nhiều nhóm khớp.
4. RED: thêm UI test chứng minh form render filter nhóm, giữ URL state, reset
   `page=1`, giữ `resultColumns` và có đường xóa filter.
5. GREEN: cập nhật parser/type contract.
6. GREEN: cập nhật operations/port type không đổi behavior ngoài filter mới.
7. GREEN: cập nhật Supabase adapter theo contract 04D.
8. CHECKPOINT: dùng taste skill trước khi chỉnh UI; xác nhận design read là
   dashboard/data-grid utilitarian.
9. GREEN: cập nhật UI filter bằng shared dashboard primitives, không đổi
   `DashboardDataTable`.
10. REFACTOR: tách helper nhỏ nếu file gần vượt 350 dòng; chạy
    `code-deduplication` trước khi thêm helper dùng chung.
11. VERIFY: chạy focused tests, typecheck, React Doctor diff và browser/manual
    smoke nếu implementation có UI.

## Stop Conditions

- 04D chưa có schema/RPC contract đủ để query `sample_result_groups` an toàn.
- Live DB write/migration phát sinh trong 04B; phần đó phải chuyển về 04D hoặc
  follow-up forward-only migration.
- UI implementation muốn tạo table mới thay vì dùng `DashboardDataTable`.
- UI design chưa dùng taste skill trước khi sửa filter layout.
- Cần thêm shared helper/component mới nhưng chưa chạy `code-deduplication`.
- Query/filter thay đổi export contract rộng hơn 04B mà chưa có follow-up rõ.
- Validation cần yếu hơn focused tests đã nêu.

## Expected Commands

```bash
cd lab-kit-app
bun run test --run lib/sample-grid app/dashboard/samples/_components/sample-grid-page-content.test.tsx
bun run typecheck
bun run react-doctor:diff
```

Nếu có staged TS/TSX source trước commit:

```bash
cd lab-kit-app
bun run react-doctor:staged
bun run docstring:check
```
