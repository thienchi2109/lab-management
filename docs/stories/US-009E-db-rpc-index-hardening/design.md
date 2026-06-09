# Design

## Domain Model

US-009E là conditional hardening slice. Sau US-009D, slice này đóng theo hướng
no-op vì chưa có bằng chứng schema/query hiện tại không đủ an toàn hoặc đủ
nhanh. Nó vẫn giữ contract mở lại nếu dữ liệu thật, benchmark, advisor, hoặc
query plan sau này chứng minh cần hardening.

## Application Flow

1. Đọc proof US-009A đến US-009D và live Supabase state.
2. Nếu chưa có bằng chứng cần DB change, không tạo migration và ghi no-op
   evidence.
3. Nếu mở lại, agent chứng minh target Supabase namespace, project-ref, migration history,
   và target object.
4. Tạo migration forward-only nhỏ.
5. Apply migration bằng đúng MCP namespace.
6. Chạy security/performance/tenant proof.
7. Cập nhật slice đang phụ thuộc để dùng contract mới.

## Interface Contract

- RPC/view/index nếu có phải phục vụ contract đã được slice trước định nghĩa.
- Không mở filter/sort động ngoài whitelist.
- Không trả dữ liệu ngoài tenant scope.
- Không cấp quyền mới ngoài role matrix hiện có nếu chưa có quyết định riêng.

## Data Model

Không có migration trong closeout hiện tại. Nếu mở lại, chỉ dùng forward-only
migration và không sửa migration đã apply. Mọi write phải chứng minh trước:

- MCP namespace: `mcp__supabase_lab_management`;
- project-ref: `tuuqgpzgollcerqqszjr`;
- repo mapping;
- migration history;
- target tables/functions/indexes.

Live proof hiện tại:

- Namespace đúng: `mcp__supabase_lab_management`.
- Project-ref đúng: `tuuqgpzgollcerqqszjr`.
- URL dự án: `https://tuuqgpzgollcerqqszjr.supabase.co`.
- Migration cuối live: `20260607160012_sample_image_rpc_max_limit_guard`.
- Không có RPC `sample_grid_*` trong live DB.
- Row count live còn nhỏ: `samples` 11, `sample_results` 1,
  `sample_group_conclusions` 1.
- Index grid chính đã có: `samples_org_status_received_idx`,
  `samples_org_billing_idx`, `sample_results_sample_idx`, và
  `sample_group_conclusions_sample_idx`.

## UI / Platform Impact

Không đổi UI trong closeout hiện tại. Nếu mở lại, UI slices chỉ tiêu thụ
contract sau khi DB proof đã pass.

## Observability

Trace phải ghi proof target Supabase, lý do không tạo migration hoặc migration
name/SQL intent nếu mở lại, validation commands, và mọi performance/security
warning còn lại.

## Alternatives Considered

1. Nhét migration vào US-009A hoặc US-009D.
   - Bị loại vì làm PR vừa data contract/UI vừa DB change quá khó review.

2. Tách DB/RPC/index thành slice điều kiện.
   - Được chọn để chỉ mở khi có evidence và giữ review blast radius nhỏ.

3. Đóng conditional no-op sau US-009D.
   - Được chọn vì live DB/advisor/query plan hiện chưa chứng minh cần DB change.
