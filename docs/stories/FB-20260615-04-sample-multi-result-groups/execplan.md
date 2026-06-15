# Exec Plan

## Goal

Hỗ trợ một mẫu kiểm nhiều nhóm chỉ tiêu, với kết quả nhập/xem tách theo từng
nhóm.

## TDD Flow

1. RED: domain tests cho create sample payload có nhiều `resultGroupIds`.
2. RED: result-entry tests chứng minh chỉ các nhóm đã chọn được render và mỗi
   nhóm có Kết Quả Chung riêng.
3. RED: query/filter tests cho lọc mẫu theo nhiều nhóm.
4. DISCOVERY: Supabase MCP read-only chứng minh schema live và migration history.
5. GREEN: nếu cần schema, tạo migration forward-only sau khi chứng minh project
   ref đúng.
6. GREEN: cập nhật sample metadata operations/server/action.
7. GREEN: cập nhật result entry loader theo group selection.
8. REFACTOR: tách domain mapper/query helper để giữ file dưới 350 dòng.

## Stop Conditions

- Dừng nếu project-ref Supabase không phải `tuuqgpzgollcerqqszjr`.
- Dừng nếu live schema đã có contract khác với product docs và cần quyết định
  data ownership.
- Dừng nếu đổi nhóm sau khi đã nhập kết quả có nguy cơ mất/ẩn dữ liệu mà chưa
  có policy.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- lib/sample-metadata lib/sample-results app/dashboard/samples
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
node scripts/validate-supabase-schema.mjs
```

