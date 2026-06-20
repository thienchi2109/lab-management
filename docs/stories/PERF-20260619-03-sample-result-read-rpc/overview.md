# PERF-20260619-03 - RPC đọc kết quả mẫu

## Status

implemented

## Lane

high-risk

## Current Behavior

Trang kết quả mẫu đang tải dữ liệu qua nhiều read query riêng lẻ. Trên
production, luồng mở kết quả mẫu có độ trễ cao và chịu ảnh hưởng lớn từ request
waterfall qua Supabase REST/RLS.

## Target Behavior

Trang kết quả mẫu dùng một read RPC tenant-scoped để trả payload đọc kết quả
cần thiết cho UI, giảm waterfall mà không hạ RLS hoặc bỏ kiểm tra quyền ở app
layer.

## Implementation

- Thêm RPC `public.get_sample_result_entry_payload(p_organization_id uuid, p_sample_id uuid)`.
- RPC trả metadata mẫu, template đang active, nhóm/chỉ tiêu được chọn, kết quả
  đã lưu và `sample_group_conclusions`.
- Server port `createSupabaseSampleResultsPort` đọc payload qua một RPC thay vì
  nhiều query REST riêng lẻ.
- RPC là `SECURITY DEFINER`, `search_path=public`, tenant-scoped theo
  `organization_id` và chỉ grant execute cho `service_role`.

## Affected Users

- Admin.
- Editor.
- Viewer.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/result-engine.md`
- `docs/product/roles-permissions.md`
- `docs/product/data-model.md`

## Non-Goals

- Không đổi contract lưu kết quả hiện có.
- Không tắt RLS.
- Không đổi rule tính Kết Quả Chung.
- Không gom thêm các trang khác vào cùng RPC.
