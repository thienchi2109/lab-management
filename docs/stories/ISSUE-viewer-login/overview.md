# Overview

## Current Behavior

Người dùng phải nhập username và mật khẩu để đăng nhập.

## Target Behavior

Trang đăng nhập có thêm nút `Đăng nhập với vai trò người xem`. Khi nhấn nút
này, server đăng nhập bằng tài khoản viewer được cấu hình server-only và đưa
người dùng vào dashboard với quyền `viewer` hiện có.

## Affected Users

- Viewer.
- Admin hoặc Editor không bị đổi luồng đăng nhập hiện tại.

## Affected Product Docs

- `docs/product/roles-permissions.md`

## Non-Goals

- Không tạo role mới.
- Không bỏ đăng nhập username/password hiện tại.
- Không ghi mật khẩu viewer vào file tracked.
