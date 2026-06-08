# Design

## Domain Model

US-009E là conditional hardening slice. Nó chỉ tồn tại để hỗ trợ data grid query
khi schema/query hiện tại không đủ an toàn hoặc đủ nhanh.

## Application Flow

1. US-009A/US-009D ghi proof rằng query hiện tại không đủ.
2. Agent chứng minh target Supabase namespace, project-ref, migration history,
   và target object.
3. Tạo migration forward-only nhỏ.
4. Apply migration bằng đúng MCP namespace.
5. Chạy security/performance/tenant proof.
6. Cập nhật slice đang phụ thuộc để dùng contract mới.

## Interface Contract

- RPC/view/index nếu có phải phục vụ contract đã được slice trước định nghĩa.
- Không mở filter/sort động ngoài whitelist.
- Không trả dữ liệu ngoài tenant scope.
- Không cấp quyền mới ngoài role matrix hiện có nếu chưa có quyết định riêng.

## Data Model

Chỉ dùng forward-only migration. Không sửa migration đã apply. Mọi write phải
chứng minh trước:

- MCP namespace: `mcp__supabase_lab_management`;
- project-ref: `tuuqgpzgollcerqqszjr`;
- repo mapping;
- migration history;
- target tables/functions/indexes.

## UI / Platform Impact

Không có UI trong slice này. UI slices chỉ tiêu thụ contract sau khi DB proof
đã pass.

## Observability

Trace phải ghi proof target Supabase, migration name, SQL intent, validation
commands, và mọi performance/security warning còn lại.

## Alternatives Considered

1. Nhét migration vào US-009A hoặc US-009D.
   - Bị loại vì làm PR vừa data contract/UI vừa DB change quá khó review.

2. Tách DB/RPC/index thành slice điều kiện.
   - Được chọn để chỉ mở khi có evidence và giữ review blast radius nhỏ.
