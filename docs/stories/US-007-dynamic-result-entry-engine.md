# US-007 - Dynamic Result Entry Engine

## Status

planned

## Lane

normal

## Product Contract

US-007 hiện thực luồng nhập kết quả xét nghiệm động cho từng mẫu. Form kết quả
phải được render từ cấu hình `result_groups`, `result_metrics`,
`result_templates`, `result_template_metrics`, `validation_json` và
`metric_settings`; component và API không được hard-code danh sách chỉ tiêu.

Người dùng có quyền nhập kết quả có thể mở một mẫu, nhập kết quả theo từng nhóm,
lưu dữ liệu vào `sample_results`, cập nhật `sample_group_conclusions`, và thấy
trạng thái nhập liệu của từng nhóm. Nhóm PCR phải tự tính `KQ_CHUNG`: tất cả âm
tính là `SẠCH`, có ít nhất một dương tính là `NHIỄM`. Các nhóm khác lưu
`KQ_CHUNG` bằng trường kết luận dạng text do người nhập hoặc người duyệt ghi.

## Relevant Product Docs

- `docs/product/result-engine.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/TEST_MATRIX.md`
- `original_specs/SPEC-001.md`

## Acceptance Criteria

- Form kết quả không hard-code danh sách nhóm hoặc chỉ tiêu; metric phải lấy từ
  template hợp lệ của mẫu.
- UI hiển thị mỗi nhóm kết quả bằng accordion hoặc card, gồm tên nhóm, số chỉ
  tiêu đã nhập trên tổng số chỉ tiêu, trạng thái `KQ_CHUNG`, và số chỉ tiêu
  dương tính hoặc bất thường nếu có.
- `MetricInputRenderer` render đúng các `input_type`: `number`, `text`,
  `textarea`, `select`, `multi_select`, `boolean`, `scale_1_5`, `percent`,
  `pcr_qualitative`, và `pcr_realtime`.
- `pcr_realtime` lưu âm hoặc dương tính là dữ liệu chính và cho phép CT nullable.
- Validation đọc từ `validation_json` và `metric_settings`, bao gồm kiểu dữ
  liệu, lựa chọn hợp lệ, ngưỡng số, đơn vị, và khoảng giá trị nếu có.
- `GET /api/samples/:id/results` trả về cấu hình template, kết quả hiện có, và
  kết luận nhóm cho mẫu được chọn theo phạm vi tenant.
- `PUT /api/samples/:id/results` chạy theo transaction logic: validate quyền,
  validate mẫu tồn tại, validate metric thuộc template hợp lệ, upsert
  `sample_results`, cập nhật `sample_group_conclusions`, và ghi audit log.
- Admin và Editor được nhập hoặc sửa kết quả; Viewer chỉ được xem và không được
  ghi kết quả.
- Sau khi lưu thành công, trang kết quả hiển thị dữ liệu mới mà không cần reload
  thủ công và không làm mất metadata mẫu.

## Design Notes

- Commands:
  - `GET /api/samples/:id/results`
  - `PUT /api/samples/:id/results`
- Queries:
  - đọc mẫu theo tenant và kiểm tra quyền server-side;
  - đọc template phù hợp với mẫu, nhóm, metric, thiết lập metric còn hiệu lực;
  - đọc kết quả và kết luận nhóm hiện có;
  - upsert kết quả và kết luận nhóm trong cùng giao dịch.
- API:
  - Route Handler hoặc Server Action phải dùng schema validation bằng Zod;
  - lỗi quyền trả về 403 rõ ràng;
  - lỗi metric không thuộc template hợp lệ trả về validation error rõ ràng.
- Tables:
  - `samples`
  - `result_groups`
  - `result_metrics`
  - `result_templates`
  - `result_template_metrics`
  - `metric_settings`
  - `sample_results`
  - `sample_group_conclusions`
  - `audit_events`
- Domain rules:
  - PCR: tất cả âm tính thì `KQ_CHUNG = SẠCH`; có ít nhất một dương tính thì
    `KQ_CHUNG = NHIỄM`;
  - CT không tự làm thay đổi `KQ_CHUNG` nếu trạng thái chính vẫn âm tính;
  - nhóm không phải PCR lưu kết luận text theo nhóm;
  - không hard-code ngưỡng hoặc đơn vị trong component.
- UI surfaces:
  - route kết quả từ trang chi tiết mẫu hoặc vùng dashboard mẫu;
  - `ResultGroupAccordion` cho từng nhóm;
  - `MetricInputRenderer` cho từng chỉ tiêu;
  - trạng thái lưu, lỗi validation, lỗi quyền, và thông báo thành công.

## Frontend, Reuse, And Caching Constraints

- Any UI/frontend design, responsive layout, visual polish, dashboard
  interaction state, or browser verification work must invoke the Build Web Apps
  plugin capability before implementation.
- Before creating reusable UI, hooks, services, helpers, or shared logic, invoke
  the code-deduplication workflow and prove no suitable existing contract
  already exists.
- Use all suitable shared dashboard components by default, including forms,
  dialogs, filters, selects, messages, layout primitives, and tables. Table/list
  surfaces must use `DashboardDataTable` unless this story documents a reviewed
  exception.
- Default server-state strategy is Server Components, server actions,
  `useActionState`, and `revalidatePath`. Do not add TanStack Query unless this
  story documents a concrete client-cache requirement.
- Result-entry UI may use local form state for unsaved field edits, but persisted
  server state must remain owned by server boundaries and path revalidation.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-007 --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Result schema validation, input-type normalization, PCR `KQ_CHUNG` calculation, and non-PCR conclusion handling. |
| Integration | `GET` and `PUT` result flow with tenant-scoped sample, valid template metrics, invalid metric rejection, upsert behavior, group conclusion update, audit log, and role checks. |
| E2E | Editor opens a sample, enters multiple group results, saves, sees progress and `KQ_CHUNG`; Viewer can view but cannot save. |
| Platform | `bun run typecheck`, `bun run lint:strict`, `bun run build`, `bun run react-doctor`, and relevant quality gate from `docs/TEST_MATRIX.md`. |
| Release | `scripts/bin/harness-cli story verify US-007` after proof flags and evidence are updated. |

## Harness Delta

No harness change is required. This packet follows normal story intake and uses
the existing result-engine, UI, API, role, and test-matrix contracts.

## Evidence

- Intake source checked: `original_specs/SPEC-001.md`, Phase 6 and
  `saveSampleResults` prompt.
- Story packet created before implementation.
