# Design

## Domain Model

US-010 là parent tracker, không phải implementation unit. Các slice con mới là
đơn vị PR và proof.

Shared domain boundaries vẫn giữ nguyên:

- `samples` là fact chính cho số mẫu theo thời gian, trạng thái, loại mẫu,
  khách hàng/công ty và loại KIT.
- `companies`, `customers`, `sample_types`, `kit_batches`, `kit_types` cung cấp
  dimensions cho filter và grouping.
- `sample_group_conclusions` cung cấp `KQ_CHUNG` theo nhóm kết quả.
- `sample_results`, `result_groups`, `result_metrics`, `metric_settings` chỉ
  đi vào analytics khi slice con khóa rõ query shape và validation.

## Application Flow

1. Merge US-010A trước để khóa analytics query contract và read port.
2. Merge US-010B sau khi có read contract, thay dashboard overview tĩnh bằng
   dữ liệu thật bounded.
3. Merge US-010C để mở pivot API sau khi parser/read port đã có tests.
4. Merge US-010D để dựng `/dashboard/analytics` sau khi API contract ổn định.
5. Chỉ mở write DB trong US-010E nếu live DB/advisor/EXPLAIN chứng minh cần
   migration/RPC/index.

## Interface Contract

Parent tracker không định nghĩa thêm route, DTO hoặc component. Mỗi slice phải
ghi interface contract riêng:

- US-010A định nghĩa DTO, filter summary và read port.
- US-010B định nghĩa dashboard overview view model.
- US-010C định nghĩa `POST /api/analytics/pivot` request/response/errors.
- US-010D định nghĩa analytics page URL/filter/UI states.
- US-010E định nghĩa RPC/index/migration contract nếu có.

## Data Model

Parent tracker không thêm schema. Mọi thay đổi DB/RPC/index phải đi qua US-010E
hoặc follow-up rõ ràng. Nếu có Supabase write, phải dùng migration forward-only
và trước đó chứng minh đúng namespace `mcp__supabase_lab_management`,
project-ref `tuuqgpzgollcerqqszjr`, migration history và target
tables/functions.

## UI / Platform Impact

Parent tracker không trực tiếp sửa UI. Các slice UI vẫn phải tuân thủ Harness
defaults:

- invoke Build Web Apps plugin capability trước khi sửa dashboard UI,
  responsive layout, chart surface hoặc browser verification;
- invoke `code-deduplication` trước reusable UI, hook, service, helper hoặc
  chart wrapper;
- reuse shared dashboard primitives, filters, cards và `DashboardDataTable` cho
  table/list surface phù hợp;
- giữ Server Components/server actions/URL state làm mặc định;
- không thêm TanStack Query nếu chưa có client-cache requirement cụ thể.

## Observability

Mỗi slice phải ghi trace outcome, proof và friction riêng. Parent tracker chỉ
đóng khi US-010A đến US-010D verify và US-010E có kết luận no-op hoặc migration
proof.

## Alternatives Considered

1. Giữ một story/PR cho toàn bộ Phase 9.
   - Bị loại vì diff sẽ vừa chạm contract, API, UI, browser proof và có thể cả
     DB hardening.

2. Làm dashboard overview sau cùng.
   - Bị loại vì `/dashboard` đang có dữ liệu tĩnh; thay bằng dữ liệu thật là
     slice giá trị nhỏ nhất sau query contract.

3. Gộp pivot API và analytics page.
   - Bị loại để API public contract được test độc lập trước UI.

4. Thêm DB/RPC/index trước.
   - Bị loại vì US-009E đã cho thấy hardening speculative không có giá trị.
