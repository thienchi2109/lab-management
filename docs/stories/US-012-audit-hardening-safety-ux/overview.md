# US-012 - Kiểm toán, gia cố bảo mật và UX an toàn

## Trạng thái

planned

## Lane

high-risk

## Product Contract

US-012 khóa lớp an toàn cuối trước release: mọi write path quan trọng phải có
permission check server-side, audit evidence, response lỗi chuẩn và không lộ bí
mật. UX trong story này chỉ là UX an toàn liên quan đến quyền, lỗi và thao tác
nguy hiểm; UI polish tổng quát đã thuộc US-016.

## Current Behavior

Roadmap gốc đặt chung audit, hardening, UX và UI polish trong Phase 11. Sau khi
US-016 tách riêng polish UI theo route, US-012 cần thu hẹp còn audit,
authorization hardening, RLS/bypass review, secret-safety và UX an toàn.

Một số story trước đã thêm audit hoặc guard cục bộ, nhưng chưa có packet tổng
thể để rà soát đồng nhất các write path, vai trò `admin`/`editor`/`viewer`,
result configuration, export, lỗi chuẩn và trạng thái bị chặn do thiếu quyền.

## Target Behavior

- Mọi write path quan trọng xác thực session, kiểm tra role server-side và
  không tin role từ client payload.
- Viewer không thể tạo/sửa/xóa qua API hoặc server action trực tiếp.
- Editor không thể sửa result configuration hoặc user/role settings.
- Admin config changes có audit evidence đủ actor, tenant, action, target,
  outcome và payload an toàn.
- Error response cho auth, permission, validation và server failure dùng cấu
  trúc nhất quán, không lộ secret/PII.
- UX an toàn hiển thị rõ trạng thái không đủ quyền, lỗi có thể khắc phục, và
  confirm cho thao tác nguy hiểm.
- RLS, role bypass và secret exposure được rà soát bằng live Supabase proof
  trước mọi DB write.

## Affected Users

- Admin: cần audit rõ ràng khi thay đổi cấu hình hoặc quyền.
- Editor: được phép nhập/sửa nghiệp vụ nhưng bị chặn khỏi cấu hình hệ thống.
- Viewer: chỉ đọc dữ liệu và không thấy hoặc không thực thi được affordance ghi.

## Affected Product Docs

- `docs/product/roles-permissions.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`
- `docs/stories/US-016-ui-polish-roadmap/overview.md`
- `original_specs/SPEC-001-NextJS-MVP-Phased-Roadmap.md`

## Non-Goals

- Không làm visual UI polish, typography, spacing, dashboard redesign hoặc
  responsive cleanup tổng quát; phần đó thuộc US-016.
- Không đổi role model ngoài `admin`, `editor`, `viewer`.
- Không thêm workflow nghiệp vụ mới.
- Không rewrite auth/session architecture nếu chỉ cần hardening hẹp.
- Không sửa migration đã apply; mọi DB correction phải là migration mới,
  forward-only.
