# Design

## Domain Model

Form tạo/sửa mẫu cần reference metadata theo tổ chức, không cần toàn bộ sample
grid dataset. Quyền tạo/sửa mẫu thuộc admin/editor; viewer là read-only.

## Application Flow

Dashboard shell chỉ render navigation và children. Khi admin/editor kích hoạt
CTA tạo mẫu, overlay mới gọi loader metadata tối thiểu. Sau khi tạo/sửa mẫu,
flow hiện có revalidate dữ liệu liên quan.

## Interface Contract

Giữ nguyên contract tạo/sửa mẫu hiện có. Nếu thêm read endpoint hoặc server
action cho metadata tối thiểu, response chỉ gồm reference options cần cho form
và lỗi 403 rõ khi vai trò không được phép.

## Data Model

Không migration. Query phải tenant-scoped theo organization từ session server.
Không đọc toàn bộ bảng `samples` trong loader metadata tạo mẫu nếu form không
cần danh sách mẫu.

## UI / Platform Impact

CTA tạo mẫu không đổi với admin/editor. Viewer không thấy hoặc không kích hoạt
luồng tạo mẫu. Không thay đổi layout responsive, bottom nav, hoặc sample grid.

## Observability

Không thêm production logs trong story này. Có thể dùng request waterfall của
Vercel/Supabase làm bằng chứng ngoài code nếu người vận hành cho phép.

## Alternatives Considered

1. Giữ metadata ở dashboard layout và cache dài hơn: giảm ít vì request vẫn nằm
   trên đường đăng nhập.
2. Thêm TanStack Query ngay: chưa đủ nhu cầu cache cụ thể; có thể làm phức tạp
   invalidation sau tạo/sửa mẫu.
