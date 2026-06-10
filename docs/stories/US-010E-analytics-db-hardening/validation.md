# Validation

## Proof Strategy

US-010E hoàn tất khi có bằng chứng live đủ để no-op hoặc có migration/RPC/index
forward-only đã verify.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Không áp dụng nếu no-op |
| Integration | query representative sau migration nếu có |
| E2E | Không áp dụng |
| Platform | schema validator và quality nếu runtime code đổi |
| DB | target proof, migration history, advisor, EXPLAIN summary |

## Fixtures

Use live Supabase lab project only after target proof:

- namespace `mcp__supabase_lab_management`;
- project-ref `tuuqgpzgollcerqqszjr`;
- target tables/functions from US-010A-D query shapes.

## Commands

```bash
node scripts/validate-supabase-schema.mjs
scripts/bin/harness-cli story verify US-010E
```

## Acceptance Evidence

Survey hoàn tất ngày 2026-06-10 theo hướng scale-ready baseline. Live DB chưa
có nút thắt hiện tại, nhưng analytics query shape chính lọc theo
`organization_id` và khoảng `received_at`, nên US-010E thêm một index
forward-only nhỏ để tránh phụ thuộc vào index `organization_id, status,
received_at` khi query không lọc `status`.

### Target Proof

- MCP namespace dùng cho live DB: `mcp__supabase_lab_management`.
- Project-ref xác minh từ `lab-kit-app/.env.local`: `tuuqgpzgollcerqqszjr`.
- Repo mapping: `/root/lab-management`.
- Live migration history trước write có 12 migration, kết thúc ở
  `20260607160012 sample_image_rpc_max_limit_guard`.
- Target read tables/functions trước mọi write: `samples`,
  `sample_group_conclusions`, `sample_results`, `result_metrics`, `kits`,
  `sample_types`; target write duy nhất là index
  `samples_org_received_at_idx` trên `public.samples`.
- Applied migration:
  `20260610082743 analytics_samples_received_at_index`.

### Query Shapes

- Dashboard overview gọi `getDashboardOverviewData` với hai dataset bounded:
  `receivedDate` 7 ngày, page size 200, measures `sampleCount`,
  `positiveCount`, `cleanCount`, `infectedCount`; và `pcrMetric` 7 ngày, page
  size 50, measures `sampleCount`, `positiveCount`.
- Dashboard overview cũng gọi `countKits` theo `organization_id` và
  `status = in_stock`, cùng `listRecentSamples` 7 ngày, limit 5,
  `received_at desc`.
- `POST /api/analytics/pivot` parse payload, enforce actor, gọi
  `listAnalyticsDataset` qua cùng Supabase read port.
- `/dashboard/analytics` initial query dùng `receivedDate`, `sampleCount`,
  `positiveCount`, default filter 7 ngày. Filter apply từ client POST lại
  `/api/analytics/pivot`.
- Adapter hiện tại chỉ áp dụng trực tiếp `organization_id`, `received_at`
  bounds và `status` trên `samples`; các filter contract khác chưa thành DB
  predicates trong US-010A-D.

### Live DB Survey

- Row counts: `samples=11`, `sample_group_conclusions=1`,
  `sample_results=1`, `result_metrics=2`, `kits=1`, `sample_types=1`.
- `samples` live range: 11/11 rows nằm trong cửa sổ 7 ngày hiện tại của một
  organization.
- Existing relevant indexes trước migration: `samples_org_status_received_idx`,
  `samples_organization_id_sample_code_key`, `sample_results_sample_idx`,
  `sample_results_sample_id_result_metric_id_key`,
  `sample_group_conclusions_organization_id_idx`,
  `sample_group_conclusions_sample_idx`, `kits_org_status_idx`,
  `result_metrics_pkey`.
- Added baseline index:
  `samples_org_received_at_idx on public.samples (organization_id,
  received_at desc)`.
- Existing related RPC/functions: `save_sample_results_with_audit` và
  `create_sample_image_with_audit`; không có analytics/dashboard RPC hiện hữu.
- Security advisor: chỉ có external warning
  `auth_leaked_password_protection`; không thuộc analytics DB/RPC/index scope.
- Performance advisor sau migration có unused-index INFO cho index mới vì vừa
  tạo và live table nhỏ; đây là expected cho scale baseline mới. Không có
  missing-index hoặc RPC warning cho analytics.

### EXPLAIN Summary

- Dataset query `samples` + `sample_types`, 7 ngày, `received_at asc`,
  limit 200: index scan theo `organization_id`, 11 rows, execution
  khoảng 1.9 ms.
- Recent samples, 7 ngày, `received_at desc`, limit 5: index scan theo
  `organization_id`, top-N sort nhỏ, execution khoảng 0.26 ms.
- Conclusions theo `organization_id` + `sample_id in sampleIds`: dùng
  `sample_group_conclusions_organization_id_idx`, execution khoảng 0.79 ms.
- PCR results + metrics theo sampleIds: dùng
  `sample_results_sample_id_result_metric_id_key`, execution khoảng 1.52 ms.
- Kit counts theo `organization_id` và `status`: dùng `kits_org_status_idx`,
  execution khoảng 0.87 ms.
- Status-filtered samples dùng index scan theo `organization_id`, lọc
  `status` và `received_at`, execution khoảng 0.17 ms.
- Sau migration, planner vẫn chọn seq scan cho query date-only khi bảng chỉ có
  11 rows, execution khoảng 0.98 ms. Khi tắt seq scan để kiểm tra index
  eligibility, query dùng `samples_org_received_at_idx` với index condition
  `organization_id + received_at`, execution khoảng 0.14 ms.

### Conclusion

US-010E đóng bằng scale-ready baseline: đã apply migration forward-only thêm
`samples_org_received_at_idx`. Không tạo RPC, không đổi grants/policies, không
đổi UI/API behavior. Follow-up ngoài scope: khi US-010 mở rộng adapter để thật
sự áp dụng `companyId`, `customerId`, `sampleTypeId`, `kitTypeId`,
`resultGroupId` hoặc `metricId` thành DB predicates, cần survey lại index cho
các query shape mới.
