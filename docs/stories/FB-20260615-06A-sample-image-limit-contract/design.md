# Design

## Direction

Khóa hợp đồng giới hạn ảnh trước khi mở rộng UI. Slice này làm rõ source of
truth cho `MAX_IMAGES_PER_SAMPLE = 20`, cập nhật test/docs, và xác nhận live DB
đang enforce gì bằng Supabase MCP read-only.

## Interface Contract

- UI chỉ cần copy/disabled-state phản ánh limit 20.
- Chưa thêm `multiple` cho input thư viện trong slice này.
- Thông báo lỗi vượt slot phải dùng tiếng Việt có dấu và không lộ chi tiết
  provider.

## Domain Contract

- Một constant dùng chung cho limit ảnh mẫu.
- Domain operation phải tính slot còn lại từ số ảnh hiện có.
- API không được tin client; server/domain vẫn chặn vượt limit.

## Required Discovery

Trước mọi Supabase write, chứng minh namespace `mcp__supabase_lab_management`,
project-ref `tuuqgpzgollcerqqszjr`, migration history và function/constraint
đang enforce giới hạn ảnh.

## Error Handling

Khi vượt limit, trả lỗi rõ ràng theo số slot còn lại. Không log secret,
signature hoặc provider response nhạy cảm.
