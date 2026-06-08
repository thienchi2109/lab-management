# Design

## Domain Model

US-009 là parent tracker cho Phase 8, không phải implementation unit. Các slice
con mới là đơn vị PR và proof.

Shared domain boundaries vẫn giữ nguyên:

- `samples` là dòng chính của bảng.
- `customers`, `companies`, `sample_types`, `kit_types`, và `kits` cung cấp
  metadata để filter/search.
- `sample_results`, `result_groups`, `result_metrics`, và `result_templates`
  chỉ đi vào US-009D sau khi grid MVP ổn định.
- `sample_images` chỉ dùng summary khi US-009B cần trạng thái ảnh, không mở rộng
  workflow upload.
- Audit log chỉ ghi khi người dùng thực hiện hành động đã có từ các module
  trước, không ghi khi đổi tùy chọn cột local.

## Application Flow

1. Merge US-009A trước để khóa query contract và pagination/filter/sort proof.
2. Merge US-009B sau khi có contract, tạo bảng mẫu chính dùng dữ liệu đã
   whitelist.
3. Merge US-009C để thêm responsive/column preferences mà không đổi data
   contract.
4. Merge US-009D để thêm result detail/desktop result columns sau khi grid cơ
   bản ổn định.
5. Chỉ mở US-009E nếu US-009A đến US-009D chứng minh cần DB/RPC/index.

## Interface Contract

Parent tracker không định nghĩa thêm route, DTO, hay component. Mỗi slice phải
ghi rõ interface contract riêng và không được phụ thuộc vào việc các slice sau
đã merge.

## Data Model

Parent tracker không thêm schema. Mọi thay đổi DB nếu có phải đi qua US-009E
hoặc một follow-up rõ ràng, dùng migration forward-only và kiểm tra live
Supabase đúng project trước mọi write.

US-009A chịu trách nhiệm khóa các ràng buộc dữ liệu đầu tiên: không query toàn
bộ dataset, whitelist filter/sort, tenant scope, và role read behavior.

## UI / Platform Impact

US-009 không trực tiếp thay đổi UI. Các slice UI vẫn phải tuân thủ Harness
defaults:

- invoke Build Web Apps plugin capability trước khi sửa UI/frontend;
- invoke `code-deduplication` trước reusable UI, hook, service, helper, hoặc
  shared logic;
- dùng `DashboardDataTable` cho table/list surface trừ khi có ngoại lệ đã được
  ghi;
- giữ Server Components/server actions/`useActionState`/`revalidatePath`;
- không thêm TanStack Query nếu chưa có client-cache requirement cụ thể.

## Observability

Mỗi slice phải ghi trace outcome, proof, và friction riêng. Parent tracker chỉ
đóng khi các slice bắt buộc US-009A đến US-009D đã được verify hoặc có quyết
định durable loại bỏ slice.

## Alternatives Considered

1. Giữ một story/PR cho toàn bộ Phase 8.
   - Bị loại vì diff quá lớn, chạm nhiều domain và dễ bị reviewer reject.

2. Tách theo lớp kỹ thuật trước rồi theo UX sau.
   - Được chọn: US-009A khóa data contract, US-009B dựng grid MVP, US-009C và
     US-009D bổ sung UX phức tạp, US-009E chỉ mở khi có bằng chứng cần DB/RPC.

3. Tách theo từng control nhỏ.
   - Quá vụn và tạo nhiều PR phụ thuộc lẫn nhau; không đủ giá trị review so với
     overhead Harness/verification.
