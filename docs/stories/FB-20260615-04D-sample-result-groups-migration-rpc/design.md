# Design

## Domain Model

04D tạo contract lưu quan hệ nhiều-nhiều giữa mẫu và nhóm chỉ tiêu bằng bảng
`public.sample_result_groups`. Bảng này là nguồn sự thật để các slice sau lọc
sample grid, tải result entry và đồng bộ form tạo/sửa mẫu.

```text
samples ── sample_result_groups ── result_groups
```

Mỗi dòng thuộc đúng một `organization_id`, có `sample_id`, `result_group_id` và
`created_at`. Khóa chính kép là `(sample_id, result_group_id)` để tránh gắn lặp
cùng một nhóm cho một mẫu.

## Application Flow

1. 04A đã ép create/update sample input có `resultGroupIds`.
2. 04D migration tạo bảng nối và backfill mẫu hiện có.
3. RPC `create_sample_metadata_with_code` nhận `p_result_group_ids uuid[]`,
   validate nhóm cùng tổ chức, active và không rỗng, rồi insert mẫu và bảng nối
   trong cùng transaction.
4. RPC `save_sample_results_with_audit` dùng `sample_result_groups` làm whitelist
   nhóm/chỉ tiêu được phép ghi kết quả.
5. 04B/04C/04E chỉ đọc hoặc ghi qua contract này, không tự tạo schema.

## Interface Contract

- Namespace live bắt buộc: `mcp__supabase_lab_management`.
- Project-ref live bắt buộc: `tuuqgpzgollcerqqszjr`.
- Trước mọi write, agent phải chứng minh namespace, migration history hiện tại,
  bảng/functions target và trạng thái thiếu/có của `sample_result_groups`.
- Không dùng namespace generic `mcp__supabase` cho repo này.
- Migration phải forward-only; không sửa file migration đã apply.
- RPC dùng `SECURITY DEFINER` và pin `search_path` theo pattern hiện có.
- Grants/revokes phải giữ nguyên boundary hiện có: role app chỉ gọi RPC được
  phép, không mở quyền bảng nối ngoài policy cần thiết.

## Data Model

- `sample_id uuid not null references public.samples(id) on delete cascade`.
- `result_group_id uuid not null references public.result_groups(id)`.
- `organization_id uuid not null references public.organizations(id) on delete cascade`.
- `created_at timestamptz not null default now()`.
- Primary key: `(sample_id, result_group_id)`.
- Index đọc chính:
  - `(organization_id, sample_id)`.
  - `(organization_id, result_group_id)`.
- RLS:
  - enable RLS.
  - read/write phải fail-closed khi `auth.uid()` null.
  - tenant membership phải khớp `organization_id`.

## Backfill

- Với mẫu có template active suy ra được nhóm qua
  `result_template_metrics -> result_metrics -> result_groups`, insert các nhóm
  đó vào bảng nối.
- Nếu không suy được nhóm nào, fallback insert toàn bộ `result_groups` active
  của organization để mẫu cũ vẫn xem/nhập kết quả được.
- Backfill phải idempotent bằng `on conflict do nothing`.

## Observability

- Audit payload của create sample chỉ ghi field name `resultGroupIds`, không ghi
  danh sách giá trị nhóm vào audit.
- Validation sau migration phải chứng minh:
  - bảng tồn tại;
  - RLS enabled;
  - indexes/PK/FK tồn tại;
  - RPC signature mới tồn tại;
  - mẫu cũ có mapping hoặc fallback.

## Alternatives Considered

- Lưu danh sách group IDs trong `samples.metadata`: không dùng vì khó join/filter
  an toàn và không có FK/RLS rõ.
- Dựa tiếp vào `sample_type_id -> result_templates`: không dùng vì một mẫu có
  thể chọn nhiều nhóm trực tiếp, không còn bị quyết định duy nhất bởi template.
- Làm 04B query bằng template hiện tại trước khi có bảng nối: không dùng vì sẽ
  tạo behavior tạm sai với product contract.
