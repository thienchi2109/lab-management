# US-009B - Sample Grid MVP

**Lane:** high-risk  
**Phase:** 8  
**Status:** planned  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)  
**Depends on:** [US-009A](../US-009A-data-grid-query-contract/overview.md)

## Current Behavior

Sau US-009A, server có query contract cho bảng mẫu nhưng người dùng vẫn chưa có
bề mặt bảng chính để tra cứu hằng ngày.

## Target Behavior

Admin, Editor và Viewer có bảng mẫu chính MVP:

- dùng `DashboardDataTable`;
- đọc data qua query contract US-009A;
- có search/filter/sort/page qua URL state;
- có loading, empty, error, permission-denied states;
- row actions tôn trọng quyền hiện có: Viewer chỉ đọc, Admin/Editor mở flow
  metadata/kết quả/ảnh đã có;
- không render result matrix rộng.

## Affected Users

- Admin: scan mẫu và mở nhanh flow xử lý.
- Editor: tìm mẫu đang xử lý và mở flow nhập/kiểm tra.
- Viewer: xem danh sách ở chế độ chỉ đọc.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/api-contract.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Compact/card mobile mode chuyên sâu.
- Column visibility local/session.
- Group detail và desktop result column mode.
- DB/RPC/index changes.
- Dashboard/export/report view.
