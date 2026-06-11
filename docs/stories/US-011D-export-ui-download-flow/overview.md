# US-011D - Export UI & Download Flow

**Lane:** normal
**Phase:** 10
**Status:** planned
**Affects:** nút export trong dashboard/data grid, trạng thái tải xuống, lỗi
quyền, lỗi vượt giới hạn và phản hồi mobile-first

## Current Behavior

Bảng mẫu và analytics chưa có flow tải file. Người dùng chưa thấy quyền export,
format được hỗ trợ, trạng thái đang tạo file hoặc lỗi khi dataset vượt giới hạn.

## Target Behavior

- Thêm UI export tại bề mặt phù hợp của bảng mẫu và/hoặc analytics theo contract
  đã sẵn sàng từ US-011A-C.
- Dùng shared dashboard components hiện có; không tạo local button/dialog/table
  nếu đã có shared contract phù hợp.
- Disable hoặc ẩn action theo permission gate, có thông báo rõ khi người dùng
  không được export.
- Hỗ trợ chọn format CSV/XLSX bằng control nhỏ, không làm rối toolbar chính.
- Hiển thị pending, success và error state; lỗi vượt hard cap phải gợi ý thu hẹp
  filter thay vì retry vô hạn.
- Flow mobile không ép bảng rộng hoặc che row actions hiện có.

## Affected Users

- Admin/Editor cần thao tác nhanh từ grid đang lọc.
- Viewer cần thấy trạng thái read-only nhất quán với quyền export được cấp hoặc
  không được cấp.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`

## Non-Goals

- Tạo endpoint export mới.
- Thay đổi query contract của sample grid/analytics.
- Thêm chart, pivot behavior hoặc report view mới.
- Lưu lịch sử file export trên server.

## Frontend, Reuse, And Caching Constraints

- Bắt buộc dùng shared dashboard controls khi có thể.
- Không thêm TanStack Query chỉ để gọi export; ưu tiên action/request trực tiếp
  với trạng thái local rõ ràng.
- Bất kỳ UI mới nào phải qua Build Web Apps/browser verification khi implement.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Permission/action state và format selector nếu tách được helper/component. |
| Integration | UI gọi đúng endpoint, truyền filter hiện hành và xử lý lỗi có cấu trúc. |
| E2E | Download happy path và lỗi không có quyền hoặc vượt giới hạn. |
| Platform | React Doctor diff, responsive/browser screenshot nếu có UI. |
| Release | Story record cập nhật proof sau khi implement. |

