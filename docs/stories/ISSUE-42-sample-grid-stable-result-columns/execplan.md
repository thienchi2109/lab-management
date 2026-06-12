# Exec Plan

## Goal

Tách cấu hình cột kết quả Sample Grid khỏi dữ liệu page hiện tại bằng TDD.

## Work Phases

1. RED: thêm regression test cho `listSampleGridPage` chứng minh options ổn
   định từ port config và selected keys không biến mất khi page không có metric
   tương ứng.
2. GREEN: mở rộng `SampleGridPort` bằng method đọc result column options và đổi
   `listSampleGridPage` dùng method đó.
3. Adapter: thêm Supabase read module cho result column options, dùng schema
   result template hiện có.
4. Validation: chạy focused Vitest, typecheck, React Doctor và các gate phù hợp.
5. Harness: cập nhật validation proof và trace.

## Stop Conditions

- Phát hiện cần DDL/DML/RPC/grant/policy mới.
- Focused regression không thể fail đúng trước implementation.
- Thay đổi lan sang shared `DashboardDataTable`.
