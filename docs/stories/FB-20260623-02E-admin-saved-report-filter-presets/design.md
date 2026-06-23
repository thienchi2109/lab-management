# Design

## Domain Model

Một preset báo cáo là cấu hình theo tổ chức, gồm:

- `organizationId`
- `scope`: ví dụ `analytics-report-default`
- `charts`: danh sách cấu hình theo `chartId`
- mỗi chart có `filters`, `visibleDimensions` hoặc trường lọc được bật nếu
  contract cho phép
- `updatedBy`, `updatedAt`

Quy tắc role:

- Admin được lưu preset mặc định.
- Viewer được đọc preset và override tạm trên client/session.
- Editor cần chốt quyền sản phẩm: mặc định không lưu preset nếu feedback chỉ
  nêu Admin.

## Application Flow

1. Load preset mặc định cùng dữ liệu ban đầu của `/dashboard/analytics`.
2. Nếu không có preset, dùng default date range từ `FB-20260623-02A`.
3. Admin chỉnh filter theo chart và bấm lưu preset.
4. Server validate role Admin, validate payload theo chart/filter whitelist, ghi
   preset và audit nếu có bảng audit phù hợp.
5. Viewer chỉnh filter local; server không nhận write preset từ Viewer.

## Interface Contract

Possible routes/actions:

- Read: Server Component hoặc route đọc preset theo organization.
- Write: server action hoặc `PUT /api/analytics/report-presets/default`.

Errors:

- 401 nếu chưa đăng nhập.
- 403 nếu không phải Admin khi ghi.
- 400 nếu payload filter/preset không hợp lệ.
- 500 public fallback an toàn.

## Data Model

Likely needs a new table or organization-scoped config record, for example:

- `report_filter_presets`
- columns: `id`, `organization_id`, `scope`, `config`, `created_by`,
  `updated_by`, `created_at`, `updated_at`
- unique key: `(organization_id, scope)`
- RLS enabled.

Any DB correction must be forward-only. Before any Supabase write, prove:

- namespace: `mcp__supabase_lab_management`
- project-ref: `tuuqgpzgollcerqqszjr`
- current migration history
- target table/function/policy/grant

## UI / Platform Impact

Admin UI needs an edit/save affordance around chart filters. Viewer UI must not
show a save action that implies persistence.

For UI/frontend work:

- Invoke Build Web Apps plugin capability before implementation.
- Invoke `code-deduplication` before reusable filter/preset helpers.
- Reuse shared dashboard forms, buttons, dialogs, selects, messages and sheet
  primitives.
- Do not add TanStack Query unless a concrete client-cache need is documented.

## Observability

- Preset writes should be auditable enough to identify actor, organization and
  changed field names.
- Do not log raw filter payload if it later contains customer-sensitive labels.
- Story evidence must include 403 proof for Viewer write attempts.

## Alternatives Considered

1. Store Viewer/Admin filter state in localStorage.
   - Bị loại vì Viewer mới vào từ máy khác sẽ không thấy cấu hình Admin.
2. Store preset per user only.
   - Bị loại vì feedback yêu cầu Admin cấu hình để Viewer thấy.
3. Let Viewer save preset.
   - Bị loại vì feedback nói Viewer tự lọc thì không được lưu lại.
