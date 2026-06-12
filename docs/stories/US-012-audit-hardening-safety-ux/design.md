# Design

## Domain Model

US-012 dựa trên role hiện có trong `tenant_memberships`: `admin`, `editor` và
`viewer`. Quyền ghi phải được quyết định server-side theo session và tenant
đang hoạt động. Client chỉ gửi intent nghiệp vụ, không gửi role hoặc permission
decision.

Audit event tối thiểu cần có actor, tenant, action, target, outcome, timestamp
và metadata đã lọc bỏ secret/PII. Với admin config changes, payload nên ghi
phần thay đổi đủ để truy vết nhưng không lưu token, mật khẩu, service key hoặc
nội dung nhạy cảm không cần thiết.

## Application Flow

Discovery phải lập danh sách write path hiện có theo domain: sample metadata,
sample results, image upload, result configuration, user/role management,
inventory, analytics/export và các action admin khác. Mỗi path được phân loại:

- đã có auth, role check, validation, transaction và audit;
- thiếu guard hoặc guard nằm sai lớp;
- cần UX an toàn để trạng thái bị chặn không gây hiểu nhầm.

Implementation sau này nên ưu tiên test-first cho từng bypass case trước khi
sửa production code.

## Interface Contract

Các mutation phải trả lỗi chuẩn cho các nhóm chính:

- unauthenticated;
- forbidden;
- validation error;
- conflict hoặc invariant violation;
- server error không lộ chi tiết nội bộ.

Thông điệp user-facing phải đủ rõ để người dùng biết cần đăng nhập, thiếu quyền,
sửa dữ liệu đầu vào hoặc thử lại. Log nội bộ không được ghi secret/PII.

## Data Model

Nếu audit storage hiện tại chưa đủ, cần live Supabase inspection trước khi thiết
kế migration. Trước mọi Supabase MCP write, bắt buộc chứng minh namespace
`mcp__supabase_lab_management`, project-ref `tuuqgpzgollcerqqszjr`, migration
history và target table/function.

Mọi correction DB phải dùng migration mới, forward-only.

## UI / Platform Impact

US-012 không làm UI polish tổng quát. UI impact chỉ gồm UX an toàn:

- confirm cho thao tác nguy hiểm nếu write path đã tồn tại;
- disabled/hidden affordance khi người dùng không đủ quyền;
- permission-denied state và error message rõ nghĩa;
- không hiển thị action ghi cho Viewer nếu action đó không thể thực thi.

Nếu implementation chạm TSX hoặc responsive/browser behavior, phải dùng Build
Web Apps plugin capability trước phần UI/frontend và chạy React Doctor qua
package script.

## Observability

Audit proof phải chứng minh event được ghi cho admin config changes và các
write path chính. Trace/log proof phải chứng minh lỗi permission và validation
không lộ secret, token, email nội bộ không cần thiết hoặc service-role key.

## Alternatives Considered

1. Giữ US-012 gồm cả UI polish: loại vì US-016 đã tách roadmap UI riêng.
2. Chỉ làm audit log: quá hẹp, không khóa được bypass permission và error
   contract trước release.
3. Tách nhiều story nhỏ: có thể cần sau discovery nếu blast radius quá rộng;
   US-012 vẫn là packet điều phối và có thể spawn follow-up story hẹp.
