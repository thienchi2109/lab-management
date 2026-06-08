# US-009 - Data Grid, Filters & Views Parent Tracker

**Lane:** high-risk  
**Phase:** 8  
**Status:** planned  
**Affects:** điều phối các slice Phase 8 cho bảng dữ liệu mẫu, phân trang,
bộ lọc, sắp xếp, responsive view, column visibility, group detail, và hardening
dữ liệu nếu cần

## Current Behavior

US-006 đã tạo bề mặt quản lý metadata mẫu và US-007 đã thêm nhập kết quả động
theo nhóm/chỉ tiêu. US-008 đã bổ sung ảnh minh chứng cho từng mẫu.

Ứng dụng vẫn chưa có bảng dữ liệu chính đủ dùng hằng ngày theo Phase 8 của
`original_specs/SPEC-001.md`. Phạm vi Phase 8 ban đầu quá rộng cho một PR vì
gom data contract, table UI, responsive layout, kết quả động, role behavior, và
khả năng phát sinh DB/RPC/index.

## Target Behavior

US-009 là parent tracker để chia Phase 8 thành các slice nhỏ, có thể review và
merge độc lập:

- [US-009A](../US-009A-data-grid-query-contract/overview.md): query contract,
  `searchParams`, server-side pagination, whitelist search/filter/sort, tenant
  và role read proof.
- [US-009B](../US-009B-sample-grid-mvp/overview.md): bảng mẫu chính dùng
  `DashboardDataTable`, URL state, states cơ bản, và row actions theo quyền hiện
  có.
- [US-009C](../US-009C-responsive-column-visibility/overview.md): compact/mobile
  mode và column visibility local/session.
- [US-009D](../US-009D-result-group-detail-column-mode/overview.md): group
  detail và desktop column mode cho nhóm/chỉ tiêu kết quả.
- [US-009E](../US-009E-db-rpc-index-hardening/overview.md): slice điều kiện cho
  DB/RPC/index/migration nếu các slice trước chứng minh query hiện tại không đủ.

## Affected Users

- Admin: cần rà soát toàn bộ mẫu, trạng thái xử lý, ảnh, kết quả, và mở nhanh
  chi tiết để xử lý ngoại lệ.
- Editor: cần tìm mẫu đang xử lý, lọc mẫu theo trạng thái/ngày nhận/kit, và mở
  chi tiết nhóm kết quả để nhập hoặc kiểm tra.
- Viewer: cần xem dữ liệu mẫu, ảnh và kết quả ở chế độ chỉ đọc.
- Reviewer: cần PR nhỏ, có proof riêng, không gom toàn bộ Phase 8 vào một diff.

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

- Implement toàn bộ Phase 8 trong một PR.
- Dashboard/pivot/analytics của US-010.
- Excel/CSV export của US-011.
- Report view cho mẫu đã duyệt.
- Thay đổi thuật toán `KQ_CHUNG` hoặc schema nhập kết quả của US-007.
- Thay đổi provider ảnh, giới hạn upload, hoặc chính sách Cloudinary của
  US-008.
- Offline cache/PWA cho dashboard.
- Cấp quyền mới ngoài ma trận role hiện có.
