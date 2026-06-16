# FB-20260615-04B - Sample grid lọc theo nhiều nhóm chỉ tiêu

## Trạng thái

planned

## Lane

normal

**Depends on:** [FB-20260615-04D](../FB-20260615-04D-sample-result-groups-migration-rpc/overview.md)

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Product Contract

- `docs/product/result-engine.md` - `result_groups` là nhóm nghiệp vụ của chỉ
  tiêu và kết quả.
- `docs/product/ui-contract.md` - sample grid là surface mobile-first, không mở
  rộng quá nhiều cột trên mobile.
- `docs/product/api-contract.md` - sample query/export phải giữ server-side
  filter và tenant boundary.
- `docs/stories/FB-20260615-04-sample-multi-result-groups/overview.md` - story
  cha định nghĩa quan hệ mẫu nhiều nhóm chỉ tiêu.

## Scope

- `parseSampleGridQuery` whitelist `resultGroupIds[]` (UUID, max N, dedupe).
- `SampleGridFilters` mở rộng `resultGroupIds`.
- `listSampleGridPage` truyền filter xuống port mà không làm đổi contract phân
  trang, sort, result column mode hoặc capability theo role.
- `createSupabaseSampleGridPort.listSamples` dùng bảng nối
  `sample_result_groups` để lọc mẫu theo một hoặc nhiều nhóm chỉ tiêu trong
  cùng `organization_id`.
- `SampleGridPageContent` thêm filter `Nhóm chỉ tiêu`, giữ URL state khi submit,
  phân trang và result column selection.
- Filter summary/chip hiển thị nhóm chỉ tiêu đã chọn và có đường xóa bộ lọc rõ.
- Tests focused cho query parser, operations, server adapter và UI URL state.

## UI / Taste Constraints

- Trước khi implement UI filter phải dùng taste skill và đọc lại brief theo
  hướng dashboard/data-grid cho nhân sự lab: yên tĩnh, thực dụng, scan nhanh,
  không marketing, không hero/card trang trí.
- Giữ `DashboardDataTable` cho table surface; không tạo table markup mới.
- Dùng shared dashboard primitives hiện có (`SelectField`, `Button`, `Input`,
  shared filter/control style) trước khi thêm UI local.
- Label nằm trên control, helper/error text nếu có nằm dưới control; không dùng
  placeholder thay label.
- Mobile phải collapse có chủ đích: filter nhóm không làm tràn ngang, không
  đẩy CTA `Áp dụng` ra khỏi viewport.
- Không thêm TanStack Query hoặc client cache mới; URL search params và server
  render vẫn là nguồn state chính.

## Acceptance Criteria

- URL `?resultGroupIds=uuid&resultGroupIds=uuid` đi vào filter, bỏ giá trị
  không hợp lệ, dedupe và giới hạn số lượng.
- Server query trả mẫu có ít nhất một nhóm khớp trong `sample_result_groups`,
  luôn ràng buộc `organization_id` và không leak tenant.
- Khi lọc theo nhiều nhóm, phân trang/count vẫn dựa trên tập mẫu đã lọc, không
  nhân bản row do join nhiều-nhiều.
- Filter UI cho phép chọn/xóa nhóm chỉ tiêu, giữ trạng thái URL, reset `page=1`
  khi đổi filter và giữ `resultColumns`.
- Export/query downstream nhận cùng filter contract hoặc story ghi rõ follow-up
  nếu export nằm ngoài phạm vi triển khai 04B.

## Validation

- RED trước: thêm tests fail cho `resultGroupIds` trong
  `lib/sample-grid/query.test.ts`, `operations.test.ts`, `server.test.ts` và
  `app/dashboard/samples/_components/sample-grid-page-content.test.tsx`.
- `cd lab-kit-app && bun run test --run lib/sample-grid app/dashboard/samples/_components/sample-grid-page-content.test.tsx`
- `cd lab-kit-app && bun run typecheck && bun run react-doctor:diff`
- Browser/manual smoke sau implementation: mở `/dashboard/samples` desktop và
  mobile, chọn nhiều nhóm, submit, paginate, xóa filter, xác nhận URL và row
  count khớp.

## Dependencies

- 04D phải xong trước hoặc song song để có bảng `sample_result_groups` và live
  schema/RPC contract.
- 04A cung cấp naming `resultGroupIds` dùng chung trong parser/operations.
- Nếu implementation cần helper/filter component dùng chung mới, chạy
  `code-deduplication` trước khi thêm.

## Out of Scope

- Tạo bảng nối hoặc migration.
- Result entry loader theo nhóm.
- Form tạo/sửa mẫu chọn nhóm chỉ tiêu.
- Đổi thuật toán result column mode, kết luận nhóm hoặc export format nếu không
  bắt buộc để truyền filter contract.
