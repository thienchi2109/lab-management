# US-011 - Export Excel/CSV Parent Tracker

**Lane:** high-risk
**Phase:** 10
**Status:** planned
**Affects:** điều phối các slice Phase 10 cho export mẫu và kết quả chuẩn hóa,
bao gồm contract truy vấn, phân quyền, API tạo file, UI tải xuống, audit và
giới hạn dataset lớn

## Current Behavior

Product docs đã xác định export Excel/CSV là nhu cầu MVP. API contract hiện nêu
`POST /api/export/samples` và `POST /api/export/results-normalized`, nhưng repo
chưa có story packet, intake, read contract, route handler, UI tải xuống, audit
hoặc proof cho export.

US-009 đã tạo nền cho bảng mẫu và US-010 đang xử lý analytics/pivot. US-011 phải
tái sử dụng filter/query contract đã có thay vì tạo một đường truy vấn riêng có
nguy cơ lệch dữ liệu.

## Target Behavior

US-011 là parent tracker cho Phase 10. Runtime implementation phải đi qua các
slice nhỏ, merge và verify độc lập:

- [US-011A](../US-011A-export-query-contract/overview.md): export query
  contract, giới hạn dataset, whitelist field/sort/filter và permission gate.
- [US-011B](../US-011B-sample-export-mvp/overview.md): `POST
  /api/export/samples` cho metadata mẫu theo filter hiện có, xuất CSV/XLSX
  bounded.
- [US-011C](../US-011C-normalized-results-export/overview.md): `POST
  /api/export/results-normalized` cho kết quả xét nghiệm chuẩn hóa theo sample,
  group và metric.
- [US-011D](../US-011D-export-ui-download-flow/overview.md): UI export từ bảng
  mẫu/analytics với trạng thái tải, lỗi và quyền người dùng.
- [US-011E](../US-011E-export-hardening-audit/overview.md): audit log, rate/size
  guard, khảo sát DB/RPC/index và hardening có điều kiện.

## Affected Users

- Admin: cần xuất dataset đầy đủ trong phạm vi tenant để đối soát và báo cáo.
- Editor: cần xuất dữ liệu mẫu/kết quả theo bộ lọc đang làm việc.
- Viewer: chỉ được export khi quyền sản phẩm cho phép, và luôn ở chế độ
  read-only.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Implement runtime code trong parent US-011.
- Export ảnh Cloudinary, PDF, file đính kèm hoặc report view mẫu đã duyệt.
- Thay đổi thuật toán `KQ_CHUNG`.
- Cấp role/permission mới ngoài ma trận hiện có.
- Chạy export không giới hạn hoặc nhận raw SQL từ client.
- Thêm hàng đợi background/export async nếu chưa có bằng chứng dataset vượt MVP.

