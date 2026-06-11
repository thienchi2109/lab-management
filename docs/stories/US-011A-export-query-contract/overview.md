# US-011A - Export Query Contract & Permission Gate

**Lane:** high-risk
**Phase:** 10
**Status:** planned
**Affects:** contract export dùng lại filter/sort/search đã được whitelist, kiểm
tra quyền export, giới hạn dataset và chuẩn hóa lỗi trước khi sinh file

## Current Behavior

Product docs có endpoint export nhưng chưa có contract request/response cụ thể.
Bảng mẫu và analytics đã có các query contract riêng, nhưng export chưa chốt
field whitelist, giới hạn số dòng, permission gate hoặc lỗi chuẩn cho người
không có quyền.

## Target Behavior

- Tạo contract parse-first cho export request, ưu tiên dùng lại filter/search/sort
  từ sample grid và analytics.
- Chỉ cho phép field, format và sort key nằm trong whitelist.
- Áp dụng tenant scope và permission `Export Excel/CSV` trước khi chạy truy vấn.
- Đặt giới hạn dòng mặc định và hard cap cho MVP; trả lỗi có cấu trúc khi vượt
  giới hạn.
- Không nhận raw SQL, tên bảng tự do hoặc expression từ client.
- Chuẩn bị helper/read port dùng chung cho US-011B và US-011C.

## Affected Users

- Admin và Editor có export quyền mặc định.
- Viewer chỉ export khi quyền được cấp rõ ràng theo contract sản phẩm.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Sinh file CSV/XLSX.
- Thêm nút UI export.
- Thêm migration hoặc index nếu chưa có proof từ truy vấn thật.
- Thay đổi contract query của US-009/US-010 ngoài adapter cần thiết cho export.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Contract parser reject raw SQL, field lạ, format lạ, sort/filter không hợp lệ và dataset vượt hard cap. |
| Integration | Permission gate phân biệt Admin, Editor, Viewer được cấp quyền và Viewer không được cấp quyền. |
| E2E | Chưa bắt buộc ở slice contract. |
| Platform | React Doctor diff không có issue nếu có chạm TS/TSX. |
| Release | Story record cập nhật proof sau khi implement. |

