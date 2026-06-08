# Design

## Domain Model

US-009A.1 mở rộng `SampleGridPage` thay vì tạo contract song song. `SampleGridRow`
giữ các id đã có và bổ sung nhãn hiển thị đủ cho bảng MVP. `SampleGridPage`
bổ sung `capabilities` để UI không cần đọc session hoặc role trực tiếp.

## Data Flow

1. `getSampleGridPage()` xác thực session và chọn membership active thuộc
   `admin`, `editor`, hoặc `viewer`.
2. Actor truyền xuống domain operation kèm `role`.
3. Supabase adapter select thêm relationship labels từ bảng hiện có.
4. Domain operation trả `capabilities` theo role.

## Boundaries

Không thêm migration hoặc RPC. Nếu join hiện tại không đủ cho metadata edit
dialog đầy đủ, phần đó vẫn là follow-up riêng và không kéo vào US-009B.

## Reuse

Tận dụng `SampleGridActor`, `SampleGridPage`, và adapter hiện có. Không thêm
helper shared ngoài `lib/sample-grid` vì capability này thuộc riêng sample grid.
