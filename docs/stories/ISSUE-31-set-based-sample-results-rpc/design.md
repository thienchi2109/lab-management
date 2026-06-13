# Design

## Domain Model

Các thực thể giữ nguyên:

- `samples` xác định `sample_type_id` và tenant `organization_id`.
- `result_templates` chọn active template mới nhất theo tenant và loại mẫu.
- `result_template_metrics` xác định chỉ tiêu hợp lệ của template.
- `result_metrics` cung cấp nhóm kết quả và trạng thái active.
- `sample_results` lưu giá trị từng chỉ tiêu theo `(sample_id,
  result_metric_id)`.
- `sample_group_conclusions` lưu `KQ_CHUNG` theo `(sample_id,
  result_group_id)`.
- `audit_events` ghi một event sau khi transaction lưu thành công.

Business rules không đổi: mẫu phải thuộc tổ chức, mẫu phải có active template,
metric/group phải thuộc active template, và mọi write nhiều bảng phải nằm trong
cùng transaction của RPC.

## Application Flow

Luồng ứng dụng TypeScript hiện gọi một RPC duy nhất qua
`createSupabaseSampleResultsPort().saveResultsTransaction`.

Blast radius chính nằm trong database function:

1. Load `sample_type_id` từ `samples`.
2. Load active `result_templates.id`.
3. Parse `p_results` thành CTE `parsed_results(metric_id, value)`.
4. Tạo CTE `valid_template_metrics` từ `result_template_metrics` join
   `result_metrics`.
5. Reject nếu tồn tại result không match `valid_template_metrics`.
6. Upsert toàn bộ `parsed_results` vào `sample_results`.
7. Parse `p_conclusions` thành CTE `parsed_conclusions(group_id, kq_chung,
   calculated_from)`.
8. Reject nếu tồn tại conclusion không match nhóm trong active template.
9. Upsert toàn bộ `parsed_conclusions` vào `sample_group_conclusions`.
10. Insert một dòng `audit_events`.

## Interface Contract

RPC signature giữ nguyên:

```sql
public.save_sample_results_with_audit(
  p_organization_id uuid,
  p_actor_id uuid,
  p_sample_id uuid,
  p_results jsonb,
  p_conclusions jsonb,
  p_audit_event jsonb
) returns void
```

Caller TypeScript giữ nguyên:

- `lab-kit-app/lib/sample-results/server.ts`
- `lab-kit-app/lib/sample-results/operations.ts`
- `lab-kit-app/app/api/samples/[sampleId]/results/route.ts`

Error semantics cần giữ nguyên các thông điệp hiện có để tránh làm lộ chi tiết
DB mới ra app:

- `organization_id, actor_id, and sample_id are required`
- `sample does not belong to organization`
- `sample has no active result template`
- `result metric does not belong to active sample template`
- `result group does not belong to active sample template`

## Data Model

Không thêm bảng. Migration mới chỉ `create or replace function` cho RPC hiện có.

Live DB đã xác nhận:

- namespace MCP: `mcp__supabase_lab_management`;
- project-ref: `tuuqgpzgollcerqqszjr`;
- URL: `https://tuuqgpzgollcerqqszjr.supabase.co`;
- migration hiện có: `20260607012745 sample_results_audit_transaction_rpc`;
- privilege hiện có chỉ có `postgres` và `service_role` được `EXECUTE`;
- target tables/functions:
  - `public.save_sample_results_with_audit`;
  - `public.sample_results`;
  - `public.sample_group_conclusions`;
  - `public.audit_events`;
  - `public.samples`;
  - `public.result_templates`;
  - `public.result_template_metrics`;
  - `public.result_metrics`.

Các unique indexes phục vụ upsert đã có:

- `sample_results_sample_id_result_metric_id_key`
- `sample_group_conclusions_sample_id_result_group_id_key`
- `result_template_metrics_result_template_id_result_metric_id_key`

## UI / Platform Impact

Không có UI/frontend impact. Không cần Build Web Apps plugin.

Không thêm reusable UI, hook, service, helper, hoặc table/list surface. Không
cần code-deduplication cho UI/shared helpers trong scope hiện tại.

## Observability

Audit behavior là một phần acceptance:

- mỗi lần RPC thành công insert đúng một dòng `audit_events`;
- `action`, `entity_table`, `entity_id`, `event_payload` giữ fallback hiện tại;
- không log secret hoặc payload ra console.

Harness trace sau khi hoàn tất phải ghi rõ migration name, lệnh test, Supabase
namespace/project-ref, và kết quả apply/verification nếu có thao tác DB write.

## Alternatives Considered

1. Giữ vòng `FOR LOOP`: correctness vẫn đúng nhưng không xử lý mục tiêu hiệu
   năng của Issue #31.
2. Đổi app layer để batch từng phần nhỏ: làm rộng blast radius sang API/UI mà
   không cần thiết vì RPC có thể giữ nguyên signature.
3. Sửa migration cũ: bị loại vì migration đã apply live; repo rule yêu cầu
   migration forward-only.
