# FB-20260621-03 - Hợp đồng dữ liệu chi phí mẫu

## Status

implemented

## Lane

normal

## Product Contract

Hệ thống phải có dữ liệu đủ rõ để tính `Chi phí hiện tại` của mẫu theo các nhóm
khách yêu cầu: `Tiền mặt thu được`, `Nhận chuyển khoản`, `Ghi hóa đơn`, và
`Khác`. Story này chỉ định nghĩa và triển khai hợp đồng dữ liệu/query nền; không
làm UI tổng hợp chi phí.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/US-006-sample-metadata-references/overview.md`
- `docs/stories/FB-20260621-04-sample-cost-summary-ui.md`

## Acceptance Criteria

- Có quyết định rõ về field lưu số tiền chi phí của mẫu.
- Có quyết định rõ về cách map trạng thái hiện tại `billing_status` sang bốn
  nhóm khách yêu cầu, hoặc bổ sung field/enum mới nếu không thể map an toàn.
- Có query/mapper server-side trả về tổng chi phí theo nhóm tình trạng chi phí.
- Không sửa migration đã apply; mọi thay đổi DB phải dùng migration forward-only.
- Nếu cần Supabase write, phải chứng minh namespace `mcp__supabase_lab_management`
  và project-ref `tuuqgpzgollcerqqszjr` trước khi apply.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: thêm read model hoặc RPC cho tổng chi phí theo tổ chức và filter cần
  thiết.
- API: ưu tiên Server Component/server helper thay vì route API mới.
- Tables: `samples`; có thể cần cột số tiền và trạng thái/loại thanh toán mới.
- Domain rules: hiện code chỉ có `billing_status` gồm `unpaid`, `invoiced`,
  `paid`, `eom_credit`; chưa có `cash`, `transfer`, `other`, hoặc số tiền.
- UI surfaces: story này không render UI mới.
- Dependency: phải hoàn tất trước `FB-20260621-04`.

## Data Contract Decision

- Field lưu số tiền chi phí mẫu là
  `samples.sample_cost_amount_vnd`, dạng `numeric` không âm theo VND. Giá trị
  thiếu, sai kiểu, `NaN`, hoặc âm không được tính vào tổng ở mapper và bị chặn
  bằng database check constraint khi ghi vào cột.
- Field phân biệt cách thu tiền cho mẫu đã thanh toán là
  `samples.sample_cost_payment_method`, enum text có check constraint gồm
  `cash`, `bank_transfer`, hoặc `other`.
- Mapping bốn nhóm:
  - `billing_status = paid` và `sample_cost_payment_method = cash` -> `cash`
    (`Tiền mặt thu được`).
  - `billing_status = paid` và `sample_cost_payment_method = bank_transfer` ->
    `bank_transfer` (`Nhận chuyển khoản`).
  - `billing_status = invoiced` -> `invoice` (`Ghi hóa đơn`), kể cả khi payment
    method có giá trị khác.
  - Các mẫu có amount hợp lệ nhưng không map được vào ba nhóm trên -> `other`
    (`Khác`).
- Server contract là `getSampleCostSummary()`, đọc tenant-scoped
  `samples.billing_status`, `samples.sample_cost_amount_vnd`, và
  `samples.sample_cost_payment_method`, rồi map qua `mapSampleCostSummaryRows()`.
- Migration forward-only:
  `supabase/migrations/20260622023141_sample_cost_columns.sql`.
- Live Supabase đã apply migration `20260622023141 sample_cost_columns` qua
  namespace `mcp__supabase_lab_management`, project-ref
  `tuuqgpzgollcerqqszjr`.
- Migration tạo index `samples_org_cost_status_idx` cho thống kê/filter theo tổ
  chức, trạng thái thanh toán, và phương thức thu tiền khi amount không null.

## Frontend, Reuse, And Caching Constraints

- Không tạo UI trong story này ngoài test fixture nếu cần.
- Trước khi tạo helper/query shared mới, chạy code-deduplication và kiểm tra
  helper sample-grid/sample-metadata hiện có.
- Không thêm TanStack Query.
- Nếu phát sinh migration hoặc RPC, mở rộng test server/domain trước.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-03 --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer       | Expected proof                                                                         |
| ----------- | -------------------------------------------------------------------------------------- |
| Unit        | Test mapper/grouping chi phí theo bốn nhóm trạng thái.                                 |
| Integration | Test server helper/RPC payload với fixture Supabase mock hoặc live read nếu được phép. |
| E2E         | Không bắt buộc vì chưa có UI.                                                          |
| Platform    | Bắt buộc nếu có migration live hoặc RPC mới.                                           |
| Release     | Ghi rõ schema/query contract được chốt.                                                |

## Harness Delta

Thêm story packet nền dữ liệu cho phần 2 của phản hồi khách ngày 2026-06-21.

## Evidence

- Red: `cd lab-kit-app && bun run test ./lib/sample-metadata/metadata.test.ts ./lib/sample-metadata/sample-cost-summary-server.test.ts ./lib/sample-metadata/sample-cost-schema-contract.test.ts`
  fail vì mapper/server còn đọc JSON metadata và migration chưa có cột thật.
- Green: `cd lab-kit-app && bun run test ./lib/sample-metadata/metadata.test.ts ./lib/sample-metadata/sample-cost-summary-server.test.ts ./lib/sample-metadata/sample-cost-schema-contract.test.ts`
  pass 3 files, 6 tests.
- Live apply: `mcp__supabase_lab_management.apply_migration` trả
  `success: true`; `list_migrations` xác nhận migration mới nhất là
  `20260622023141 sample_cost_columns`.
- Live schema proof: `public.samples` có `sample_cost_amount_vnd numeric`,
  `sample_cost_payment_method text`, hai check constraints
  `samples_sample_cost_amount_vnd_nonnegative`,
  `samples_sample_cost_payment_method_check`, và index
  `samples_org_cost_status_idx`.
- Indexing proof: đã chạy `rtk code-review-graph update --repo
  /root/lab-management` và `rtk gitnexus analyze --force /root/lab-management`.
- Supabase advisors sau DDL: security còn warning nền
  `auth_leaked_password_protection`; performance báo index mới
  `samples_org_cost_status_idx` là unused vì vừa tạo, chưa có usage stats.
