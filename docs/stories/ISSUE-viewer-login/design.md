# Design

## Domain Model

Supabase Auth vẫn là nguồn session. Role vẫn đến từ `tenant_memberships`, bao
gồm `admin`, `editor`, và `viewer`.

## Application Flow

1. Login page render form username/password hiện tại.
2. Bên dưới nút đăng nhập hiện tại, render form riêng POST `/auth/viewer-login`.
3. Route handler đọc `VIEWER_LOGIN_USERNAME` và `VIEWER_LOGIN_PASSWORD` từ env
   server-only.
4. Server resolve username viewer thành email nội bộ rồi gọi Supabase
   `signInWithPassword`.
5. Đăng nhập thành công redirect `/dashboard`; lỗi fail-closed về
   `/login?error=invalid`.

## Interface Contract

- `POST /auth/login`: giữ nguyên username/password.
- `POST /auth/viewer-login`: không nhận credential từ browser.
- UI copy: `Đăng nhập với vai trò người xem`.

## Data Model

Không đổi schema, migration, RLS hoặc membership.

## UI / Platform Impact

Thêm một nút phụ ở login form. Dùng shared `Button` hiện có, không thêm
component dùng lại mới.

## Observability

Không log password, JWT, internal email hoặc secret. Lỗi route trả về thông báo
đăng nhập không hợp lệ sẵn có.

## Alternatives Considered

1. Tạo cookie/session viewer giả: bị loại vì bỏ qua Supabase Auth và dễ phá
   boundary session/RLS.
2. Hard-code credential viewer trong source: bị loại vì làm lộ secret.
3. Env server-only cho tài khoản viewer: chọn vì giữ session thật và không lộ
   credential ra client.
