# US-011C - Normalized Results Export

**Lane:** normal
**Phase:** 10
**Status:** planned
**Affects:** endpoint `POST /api/export/results-normalized`, flatten kết quả
động theo mẫu/nhóm/chỉ tiêu và giữ nguyên semantics `KQ_CHUNG`

## Current Behavior

US-007 đã thêm nhập kết quả động và US-009 hiển thị kết quả trong bảng mẫu, nhưng
chưa có export chuẩn hóa để người dùng phân tích ngoài hệ thống. API contract đã
nêu `POST /api/export/results-normalized` nhưng chưa có story packet.

## Target Behavior

- Thêm endpoint export kết quả chuẩn hóa theo contract US-011A.
- Mỗi dòng export đại diện một kết quả đã normalize đủ sample metadata tối thiểu,
  result group, metric, value, unit, conclusion và trạng thái liên quan.
- Giữ nguyên semantics result-engine; không tính lại `KQ_CHUNG` bằng logic mới.
- Áp dụng tenant scope, permission gate, field whitelist và hard cap như US-011A.
- Header cột ổn định, có tên tiếng Việt có dấu, phù hợp phân tích trong Excel.

## Affected Users

- Admin/Editor cần export kết quả xét nghiệm để gửi báo cáo nội bộ.
- Viewer chỉ export khi permission gate cho phép.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Thay đổi form nhập kết quả, kết luận nhóm hoặc thuật toán `KQ_CHUNG`.
- Export ảnh minh chứng hoặc file đính kèm.
- Thêm report view đã duyệt.
- Tối ưu DB bằng migration nếu chưa có proof từ truy vấn thật.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Normalizer giữ header/field ổn định và không làm mất metric/group metadata. |
| Integration | Endpoint trả đúng tenant scope, permission và filter mẫu/kết quả. |
| E2E | Chưa bắt buộc nếu US-011D bao phủ download flow. |
| Platform | React Doctor diff nếu chạm frontend. |
| Release | Story record cập nhật proof sau khi implement. |

