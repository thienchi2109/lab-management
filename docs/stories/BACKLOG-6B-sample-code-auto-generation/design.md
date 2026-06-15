# Design

## Domain Model

`sample_code` trở thành mã hệ thống sinh tự động cho mẫu mới.

Business rules:

- Format: `yyyymmdd-xxx`.
- Date prefix: ngày hiện tại tại lúc submit theo UTC+7 Việt Nam.
- Sequence suffix: số nguyên trong ngày, format 3 chữ số từ `000` đến `999`.
- Scope sequence theo `organization_id` và ngày Việt Nam để mỗi tổ chức có dải
  mã riêng trong ngày.
- `sample_code` vẫn unique trong bảng `samples`.
- Hệ thống không tin `sampleCode` từ client khi tạo mẫu mới.

## Application Flow

Luồng tạo mẫu mục tiêu:

1. Người dùng mở modal Thêm mẫu.
2. Modal không render field `Mã mẫu`.
3. Form submit metadata còn lại.
4. Server action parse create input không yêu cầu `sampleCode`.
5. Application command gọi database-backed port tạo mẫu.
6. Database function/RPC sinh mã atomic trong cùng transaction insert mẫu.
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
- `Đã vượt quá 1000 mẫu trong ngày hiện tại.`
- fallback hiện có: `Không thể tạo mẫu. Kiểm tra thông tin và thử lại.`

## Data Model

Implementation nên dùng forward-only migration.

Khuyến nghị:

- thêm RPC hoặc DB function `public.create_sample_metadata_with_code(...)`;
- function chạy `SECURITY DEFINER`, `set search_path = public`;
- revoke `public`, `anon`, `authenticated`;
- grant execute cho `service_role`;
- sinh prefix bằng timezone Việt Nam, ví dụ:
  `to_char(timezone('Asia/Ho_Chi_Minh', now()), 'YYYYMMDD')`;
- lock sequence theo `(organization_id, prefix)` trước khi chọn suffix để tránh
  race. Có thể dùng bảng counter riêng hoặc PostgreSQL advisory transaction
  lock;
- insert mẫu và audit trong cùng transaction/function.

Nếu dùng bảng counter riêng, thiết kế cần migration thêm bảng ví dụ
`sample_code_counters`:

- `organization_id uuid not null`;
- `code_date text not null`;
- `last_sequence integer not null`;
- unique `(organization_id, code_date)`;
- RLS và privileges phải fail-closed như các bảng app khác.

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
  có apply live, và kết quả kiểm chứng concurrency/duplicate code.

## Alternatives Considered

1. **RPC/database generator - chọn hướng này.** Atomic, kiểm soát timezone ở
   server/database, phù hợp requirement concurrency.
2. **Server action query max suffix rồi retry duplicate.** Ít migration hơn
   nhưng vẫn có race và làm application code phức tạp hơn.
3. **Client tự sinh mã.** Bị loại vì dễ sai timezone, dễ bị sửa payload và
   không an toàn khi nhiều người tạo mẫu cùng lúc.
