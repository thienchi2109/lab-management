# Backlog #6B - Tự sinh mã mẫu HP theo ngày

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

- modal Thêm mẫu không cho nhập `Mã mẫu`, nhưng hiển thị placeholder read-only
  `HP-YYMMDD-••••••••` để người vận hành biết mã sẽ được sinh khi lưu;
- form không gửi `sampleCode` từ client;
- server/database tự sinh `sample_code` tại thời điểm submit;
- sau khi tạo thành công, UI hiển thị mã thật trong thông báo thành công/toast;
- mã có dạng `HP-YYMMDD-RRRRRRRC`, ví dụ `HP-260615-7K3QM2XH`;
- `HP` là prefix lab Hồng Phong, không lấy từ client;
- `YYMMDD` dùng ngày hiện tại tại thời điểm submit theo múi giờ Việt Nam UTC+7;
- `RRRRRRR` là entropy sinh bằng crypto RNG với alphabet Crockford Base32;
- `C` là ký tự kiểm tra ngắn, tính deterministic bằng hash/mod32 trên
  `HP-YYMMDD-RRRRRRR`, để phát hiện lỗi gõ tay/scan sai;
- qua ngày mới, phần ngày đổi theo ngày submit mới;
- nếu sinh trùng cực hiếm, database/RPC retry tối đa 5 lần rồi trả lỗi an toàn;
- sinh mã không được scan max suffix, không dùng counter tuần tự, và không tạo
  hotspot khi nhiều người tạo mẫu cùng lúc.

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
- Không backfill dữ liệu lịch sử từ `T<month>_<#####>` sang format `HP-*`.
- Không đổi luồng nhập kết quả, upload ảnh hoặc export ngoài việc chúng hiển
  thị mã mới cho mẫu được tạo sau thay đổi.
- Không dùng client/browser để tự sinh mã.
- Không nhúng thông tin nhạy cảm như người tạo, khách hàng, công ty, loại mẫu
  hoặc số thứ tự vận hành vào `sample_code`; audit ngược phải đi qua database và
  audit log.
- Không thêm bảng counter nếu không có bằng chứng bắt buộc.
- Xoá `GET /api/samples/next-code` khỏi product API contract; endpoint này chưa
  có route runtime/caller nội bộ nên không cần deprecate.
- Không dùng namespace Supabase generic; mọi DB write phải dùng
  `mcp__supabase_lab_management` với project-ref `tuuqgpzgollcerqqszjr`.
