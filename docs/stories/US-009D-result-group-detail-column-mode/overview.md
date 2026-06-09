# US-009D - Result Group Detail & Desktop Column Mode

**Lane:** high-risk  
**Phase:** 8  
**Status:** implemented  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)  
**Depends on:** [US-009B](../US-009B-sample-grid-mvp/overview.md)

## Current Behavior

Sau US-009B/US-009C, grid mẫu có thể tra cứu và dùng responsive tốt hơn, nhưng
chưa có group detail hoặc desktop column mode cho nhóm/chỉ tiêu kết quả.

## Target Behavior

Người dùng có thể xem kết quả động từ grid mà không làm vỡ bảng:

- mở group detail cho từng mẫu;
- desktop chọn nhóm/chỉ tiêu để bung cột kết quả có kiểm soát;
- mobile tiếp tục dùng group detail, không render ma trận cột rộng;
- hành động chỉnh sửa vẫn đi qua flow US-007 hiện có;
- không đổi thuật toán `KQ_CHUNG` hoặc schema nhập kết quả.

## Affected Users

- Admin: rà soát kết quả và ngoại lệ.
- Editor: mở nhanh nhóm kết quả để kiểm tra hoặc đi tới flow nhập.
- Viewer: xem kết quả ở chế độ chỉ đọc.

## Affected Product Docs

- `docs/product/result-engine.md`
- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Thay đổi result-engine semantics.
- Thêm metric/template mới.
- Export/report/dashboard.
- DB/RPC/index changes nếu chưa có proof cần US-009E.
