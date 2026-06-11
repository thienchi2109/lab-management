# US-011B - Sample Export MVP

**Lane:** normal
**Phase:** 10
**Status:** planned
**Affects:** endpoint `POST /api/export/samples`, read port metadata mẫu, sinh
CSV/XLSX bounded và header ổn định cho người dùng nghiệp vụ

## Current Behavior

Người dùng có thể xem và lọc bảng mẫu, nhưng chưa tải được danh sách mẫu ra file.
API contract đã liệt kê `POST /api/export/samples` nhưng chưa có behavior và
validation story.

## Target Behavior

- Thêm endpoint export metadata mẫu theo contract US-011A.
- Dữ liệu export phải phản ánh filter/search/sort hiện hành trong phạm vi tenant.
- Header cột ổn định, có tên tiếng Việt có dấu, không phụ thuộc label UI tạm thời.
- Hỗ trợ CSV và XLSX theo `docs/product/tech-stack.md`; ưu tiên implementation
  nhỏ, synchronous và bounded cho MVP.
- Không export field nội bộ, secret, audit payload thô hoặc dữ liệu ngoài tenant.
- Response download có content type và filename dự đoán được.

## Affected Users

- Admin và Editor cần xuất danh sách mẫu đang lọc.
- Viewer chỉ thấy nút/flow export khi permission gate cho phép.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`

## Non-Goals

- Export kết quả động theo group/metric; phần đó thuộc US-011C.
- Export pivot/analytics dataset; UI có thể dùng sau khi contract riêng sẵn sàng.
- Export ảnh, PDF hoặc file đính kèm.
- Background job, email link hoặc lưu file lâu dài.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Mapping header, format CSV/XLSX, filename và loại bỏ field nội bộ. |
| Integration | Endpoint trả file đúng filter, tenant scope và permission gate. |
| E2E | Download flow tối thiểu có thể được thêm ở US-011D. |
| Platform | React Doctor diff và quality gate liên quan nếu chạm frontend. |
| Release | Story record cập nhật proof sau khi implement. |

