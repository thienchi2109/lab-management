# Design

## Interface Contract

Users page nên là admin operations surface:

- table/list nhấn mạnh identity, role, active state và action;
- create/edit dialog dùng labels rõ, helper text ngắn và inline errors;
- destructive or permission-sensitive controls cần disabled/guard copy rõ;
- mobile layout vẫn cho admin nhận diện đúng user trước khi thao tác.

## Security Boundary

Không thay đổi authorization trong polish story. Nếu polish phát hiện UX cần đổi
RBAC, create/update lifecycle hoặc audit side effects, tạo follow-up high-risk
story thay vì sửa trong US-016E.

## Testing Focus

Kiểm tra admin-only render, role/status form states, last active admin guard và
browser mobile no-overflow.
