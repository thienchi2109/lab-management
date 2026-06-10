# US-016D - Polish samples grid

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/samples` để bảng mẫu, filters, row actions và responsive card
states dễ thao tác hơn. Không đổi sample grid query contract, URL state, result
entry/image flow hoặc quyền read/write.

## Current Behavior

US-009B đến US-009D đã xây sample grid MVP, responsive modes, group detail và
desktop column mode. Trang có nhiều dữ liệu, filter và row action nên cần polish
cẩn thận để tăng scanability nhưng không phá table contract.

## Acceptance Criteria

- `DashboardDataTable` tiếp tục là table surface chính hoặc có ngoại lệ được
  duyệt.
- Search/filter/sort/page vẫn cập nhật URL state như hiện tại.
- Desktop table dễ scan hơn với spacing, column hierarchy và row action rõ.
- Mobile/card mode không bung nhiều cột và primary action dễ chạm.
- Loading, empty, error và permission states rõ ràng.
- Viewer vẫn chỉ có hành động read-only; Admin/Editor giữ flow kết quả/ảnh.

## Design Notes

- Đây là story có rủi ro UI cao nhất trong roadmap vì liên quan table/list và
  responsive modes.
- Nếu cần sửa `DashboardDataTable`, tách hoặc ghi rõ blast radius vì có thể ảnh
  hưởng analytics/users.
- Không làm đẹp bằng cách ẩn thông tin nghiệp vụ quan trọng.

## Non-Goals

- Không đổi sample grid query/RPC/index.
- Không đổi result entry hoặc image upload behavior.
- Không thêm bulk actions, saved views hoặc column presets mới.
