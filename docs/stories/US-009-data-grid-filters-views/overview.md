# US-009 - Data Grid, Filters & Views

**Lane:** high-risk  
**Phase:** 8  
**Status:** planned  
**Affects:** bảng dữ liệu mẫu, bộ lọc, sắp xếp, phân trang, hiển thị cột,
chi tiết nhóm kết quả, trải nghiệm mobile/desktop

## Current Behavior

US-006 đã tạo bề mặt quản lý metadata mẫu và US-007 đã thêm nhập kết quả động
theo nhóm/chỉ tiêu. US-008 đã bổ sung ảnh minh chứng cho từng mẫu.

Ứng dụng vẫn chưa có bảng dữ liệu chính đủ dùng hằng ngày theo Phase 8 của
`original_specs/SPEC-001.md`. Người dùng có thể xem và thao tác từng mẫu, nhưng
chưa có bề mặt scan dữ liệu có phân trang phía server, search/filter/sort, chế
độ compact, tùy chọn ẩn/hiện cột, và cách mở chi tiết nhóm kết quả mà không làm
vỡ layout mobile.

## Target Behavior

Admin, Editor và Viewer có một bảng dữ liệu mẫu chính để tra cứu hằng ngày:

- danh sách mẫu dùng phân trang phía server và không tải toàn bộ dataset;
- search theo mã mẫu, khách hàng, công ty, loại mẫu, trạng thái, và thông tin
  liên quan trong phạm vi hợp lý;
- filter theo trạng thái mẫu, trạng thái thanh toán, loại mẫu, kit, ngày nhận,
  và nhóm kết quả khi dữ liệu đã có;
- sort theo các cột được whitelist, mặc định ổn định và dễ đối chiếu;
- desktop hỗ trợ chọn nhóm/chỉ tiêu để bung cột kết quả;
- mobile dùng compact/card hoặc group detail mode, không bung toàn bộ cột kết
  quả ra khỏi viewport;
- tùy chọn ẩn/hiện cột được lưu ở local/session storage, không thay đổi dữ liệu
  server;
- Viewer chỉ đọc, Admin và Editor đi theo quyền hiện có khi mở hành động chi
  tiết mẫu, kết quả hoặc ảnh.

## Affected Users

- Admin: cần rà soát toàn bộ mẫu, trạng thái xử lý, ảnh, kết quả, và mở nhanh
  chi tiết để xử lý ngoại lệ.
- Editor: cần tìm mẫu đang xử lý, lọc mẫu theo trạng thái/ngày nhận/kit, và mở
  chi tiết nhóm kết quả để nhập hoặc kiểm tra.
- Viewer: cần xem dữ liệu mẫu, ảnh và kết quả ở chế độ chỉ đọc.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/ui-contract.md`
- `docs/product/tech-stack.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/result-engine.md`
- `docs/TEST_MATRIX.md`
- `original_specs/SPEC-001.md`

## Non-Goals

- Dashboard/pivot/analytics của US-010.
- Excel/CSV export của US-011.
- Report view cho mẫu đã duyệt.
- Thay đổi thuật toán `KQ_CHUNG` hoặc schema nhập kết quả của US-007.
- Thay đổi provider ảnh, giới hạn upload, hoặc chính sách Cloudinary của
  US-008.
- Offline cache/PWA cho dashboard.
- Cấp quyền mới ngoài ma trận role hiện có.
