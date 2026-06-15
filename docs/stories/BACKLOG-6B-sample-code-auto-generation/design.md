# Design

## Domain Model

`sample_code` trở thành mã hệ thống sinh tự động cho mẫu mới.

Business rules:

- Format: `HP-YYMMDD-RRRRRRRC`.
- Lab prefix: `HP`, cố định phía server/database.
- Date segment: ngày hiện tại tại lúc submit theo UTC+7 Việt Nam.
- Entropy segment: 7 ký tự Crockford Base32 sinh bằng crypto RNG.
- Check segment: 1 ký tự kiểm tra ngắn tính deterministic bằng hash/mod32 trên
  chuỗi `HP-YYMMDD-RRRRRRR`.
- Uniqueness vẫn scope theo `organization_id` và `sample_code`.
- `sample_code` vẫn unique trong bảng `samples`.
- Hệ thống không tin `sampleCode` từ client khi tạo mẫu mới.
- Mã chỉ chứa lab prefix, ngày tạo và entropy; audit ngược dựa vào
  `samples.id`, `sample_code`, `audit_events`, `created_by`, `organization_id`.

## Application Flow

Luồng tạo mẫu mục tiêu:

1. Người dùng mở modal Thêm mẫu.
2. Modal không render field `Mã mẫu`.
3. Form submit metadata còn lại.
4. Server action parse create input không yêu cầu `sampleCode`.
5. Application command gọi database-backed port tạo mẫu.
6. Database function/RPC sinh mã bằng crypto RNG trong cùng transaction insert
   mẫu.
7. Server action `revalidatePath("/dashboard/samples")`.
8. Bảng mẫu hiển thị sample mới với mã tự sinh.

Luồng cập nhật mẫu:

- Không nằm trong scope thay đổi chính.
- Side sheet cập nhật không được sửa `sample_code`, trừ khi thiết kế hiện tại
  đang cho sửa thì implementation phải khóa lại hoặc tách follow-up rõ ràng.

## Interface Contract

Create action không nhận `sampleCode` từ client.

Schema nội bộ nên tách:

- `CreateSampleInput`: không có `sampleCode`;
- `UpdateSampleInput`: nếu còn dùng chung form update thì phải xác định rõ
  `sampleCode` read-only hoặc không thuộc payload update.

User-facing errors:

- `Không thể tạo mã mẫu trong ngày hiện tại.`
- `Không thể tạo mã mẫu duy nhất sau nhiều lần thử.`
- fallback hiện có: `Không thể tạo mẫu. Kiểm tra thông tin và thử lại.`

## Data Model

Implementation nên dùng forward-only migration.

Khuyến nghị:

- thêm RPC hoặc DB function `public.create_sample_metadata_with_code(...)`;
- function chạy `SECURITY DEFINER`, `set search_path = public`;
- revoke `public`, `anon`, `authenticated`;
- grant execute cho `service_role`;
- sinh date segment bằng timezone Việt Nam, ví dụ:
  `to_char(timezone('Asia/Ho_Chi_Minh', now()), 'YYMMDD')`;
- sinh entropy bằng nguồn random an toàn phía database/server, ví dụ
  `gen_random_bytes(...)` hoặc helper tương đương đã có extension phù hợp;
- dùng alphabet Crockford Base32 để tránh ký tự khó đọc;
- tính check character bằng hash deterministic trên phần
  `HP-YYMMDD-RRRRRRR`, lấy modulo 32 rồi map về cùng alphabet Crockford Base32;
- insert mẫu với unique constraint trên `sample_code`; nếu va chạm, retry giới
  hạn 5 lần trong function trước khi trả lỗi an toàn;
- không scan `samples` để tìm max suffix;
- không thêm bảng counter hoặc lock hotspot trừ khi live DB chứng minh cần;
- insert mẫu và audit trong cùng transaction/function.

Unique index hiện tại trên `samples.sample_code` là lớp bảo vệ cuối cùng. Nếu
live DB đang unique toàn bảng, implementation phải giữ nguyên hoặc chứng minh rõ
vì sao cần đổi. Với prefix `HP` và ngày trong mã, không cần sequence tuần tự để
audit; audit ngược đi qua `sample_code -> samples.id -> audit_events`.

`GET /api/samples/next-code` phải bị xoá khỏi `docs/product/api-contract.md`
khi implement story này. Discovery hiện tại không thấy route runtime hoặc caller
nội bộ cho endpoint đó, nên không cần deprecate trước.

## UI / Platform Impact

UI impact:

- Modal Thêm mẫu ẩn trường `Mã mẫu`.
- Sau tạo thành công, bảng vẫn hiển thị mã mẫu tự sinh.
- Copy/label không nói người dùng phải tự nhập mã.

Frontend constraints:

- Invoke Build Web Apps / agent-browser verification trước khi claim UI pass.
- Reuse existing `CreateSampleDialog`, `Field`, `ActionMessage`,
  `DialogFrame`.
- Không thêm TanStack Query; giữ `useActionState` và `revalidatePath`.
- Không tạo primitive UI mới nếu shared primitive hiện có đủ dùng.

## Observability

- Audit event tạo mẫu vẫn ghi một event `sample.created`.
- Audit payload không lưu toàn bộ dữ liệu nhạy cảm; có thể ghi
  `sampleCode` đã sinh và danh sách field submitted.
- Harness trace phải ghi rõ migration name, Supabase namespace/project-ref nếu
  có apply live, retry policy và kết quả kiểm chứng duplicate-code.

## Alternatives Considered

1. **RPC/database random generator - chọn hướng này.** Không scan bảng mẫu,
   không dùng counter, kiểm soát timezone ở server/database, phù hợp requirement
   concurrency và vẫn audit ngược qua DB.
2. **Database counter tuần tự theo ngày.** Atomic và dễ đọc nhưng tạo thêm bảng
   counter/lock hotspot không cần thiết cho quy mô hiện tại.
3. **Server action query max suffix rồi retry duplicate.** Ít migration hơn
   nhưng vẫn có race và làm application code phức tạp hơn.
4. **Client tự sinh mã.** Bị loại vì dễ sai timezone, dễ bị sửa payload và
   không an toàn khi nhiều người tạo mẫu cùng lúc.
