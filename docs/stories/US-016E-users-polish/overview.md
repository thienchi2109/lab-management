# US-016E - Polish user management

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/users` để admin user management rõ hơn, nhất quán hơn và có
form/dialog states tốt hơn. Không đổi RBAC, admin-only route guard, last active
admin guard, audit behavior hoặc Supabase admin path.

## Current Behavior

US-014 đã triển khai user management cho Admin: list users, search/filter,
create/update profile, role, active state và last-active-admin guard. Trang cần
polish table/form/dialog states nhưng phải giữ nguyên boundary bảo mật.

## Acceptance Criteria

- Admin table dễ scan theo user, role, active state và last active/admin state.
- Create/edit dialogs có label, helper/error text và disabled/pending states rõ.
- Role/status controls không tạo cảm giác user thường có thể tự sửa quyền.
- Editor/Viewer không truy cập được route hoặc actions như hiện tại.
- Last active admin guard vẫn rõ trong UI và tests.
- Audit/security behavior không đổi.

## Design Notes

- Đây là story UI nhưng gần authorization boundary; không đổi server action
  contract trong cùng story nếu chưa có review high-risk.
- Nếu sửa shared dialog/form components, phải chứng minh ảnh hưởng lên samples
  và result configuration.

## Non-Goals

- Không thêm invite email, password reset, SSO hoặc bulk user management.
- Không đổi role model, membership model hoặc audit schema.
- Không đổi route guard/admin-only behavior.
