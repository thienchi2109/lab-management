# Backlog #6B - Tự sinh mã mẫu theo ngày

## Current Behavior

Modal Thêm mẫu hiện yêu cầu người dùng nhập thủ công trường `Mã mẫu`. Schema
ứng dụng vẫn validate mã theo dạng cũ `T<month>_<#####>`, trong khi product doc
`docs/product/data-model.md` cũng đang ghi contract cũ:
`sample_code unique, generated server-side: T<month>_<#####>`.

Sau fix `BACKLOG-6`, các trường ngày trong modal đã dùng date-only, nhưng mã
mẫu vẫn là input người dùng và vẫn có rủi ro nhập sai, trùng mã hoặc lệch quy
tắc vận hành.

## Target Behavior

Khi người vận hành tạo mẫu mới:

- modal Thêm mẫu không hiển thị trường `Mã mẫu`;
- form không gửi `sampleCode` từ client;
- server/database tự sinh `sample_code` tại thời điểm submit;
- mã có dạng `yyyymmdd-xxx`, ví dụ `20260615-000`;
- `yyyymmdd` dùng ngày hiện tại theo múi giờ Việt Nam UTC+7;
- `xxx` chạy từ `000` đến `999` trong từng ngày;
- qua ngày mới, suffix chạy lại từ `000`;
- nếu một ngày đã có đủ `000..999`, hệ thống trả lỗi an toàn, rõ nghĩa cho
  người dùng;
- sinh mã phải atomic để hai người tạo mẫu cùng lúc không nhận cùng một mã.

## Affected Users

- Admin tạo mẫu xét nghiệm.
- Editor tạo mẫu xét nghiệm.
- Viewer không tạo mẫu, chỉ bị ảnh hưởng bởi định dạng mã mẫu hiển thị mới.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Không đổi mã của các mẫu đã tồn tại.
- Không backfill dữ liệu lịch sử từ `T<month>_<#####>` sang `yyyymmdd-xxx`.
- Không đổi luồng nhập kết quả, upload ảnh hoặc export ngoài việc chúng hiển
  thị mã mới cho mẫu được tạo sau thay đổi.
- Không dùng client/browser để tự sinh mã.
- Không dùng namespace Supabase generic; mọi DB write phải dùng
  `mcp__supabase_lab_management` với project-ref `tuuqgpzgollcerqqszjr`.
