# Design

## Direction

04B mở rộng sample grid để lọc mẫu theo nhiều nhóm chỉ tiêu đã gắn với mẫu.
Đây là dashboard/data-grid cho nhân sự lab, nên UI phải yên tĩnh, thực dụng và
tối ưu scan nhanh. Không thêm layout marketing, hero, card trang trí hoặc table
surface mới.

## Design Read

Reading this as: operational lab dashboard filter for Admin/Editor/Viewer, with
a utilitarian data-grid language, leaning toward existing dashboard primitives,
`DashboardDataTable`, restrained density and URL-driven server state.

## Domain Contract

- `resultGroupIds` là danh sách nhóm chỉ tiêu được chọn từ URL/search params.
- Parser nhận nhiều giá trị lặp `resultGroupIds=uuid&resultGroupIds=uuid`,
  loại giá trị không hợp lệ, dedupe và giới hạn số lượng.
- `SampleGridFilters` chứa `resultGroupIds?: string[]` và được truyền nguyên qua
  `listSampleGridPage` xuống `SampleGridPort.listSamples`.
- Supabase adapter lọc bằng bảng nối `sample_result_groups`, luôn kèm
  `organization_id` và tránh duplicate sample rows khi một mẫu khớp nhiều nhóm.
- Nếu 04D chưa applied ở live DB, implementation chỉ được merge khi có proof
  rõ schema contract hoặc phải tách follow-up chờ 04D.

## UI Contract

- Bộ lọc vẫn là form GET `/dashboard/samples`, reset `page` về `1` khi submit.
- Filter `Nhóm chỉ tiêu` phải giữ trạng thái URL, có nhãn rõ và không dùng
  placeholder thay label.
- Khi đang chọn nhóm, UI hiển thị tên nhóm đã chọn hoặc summary/chip đủ rõ để
  người dùng biết filter đang active.
- Control xóa nhóm phải đưa người dùng về URL không còn `resultGroupIds` nhưng
  giữ các filter khác khi hợp lý.
- Mobile layout phải stack gọn, không overflow ngang và không che nút `Áp dụng`.
- Table surface tiếp tục dùng `DashboardDataTable`; result column mode và
  column preferences không đổi trong slice này.

## Taste Constraints

- Trước khi implement UI, agent phải dùng taste skill và ghi design read trong
  notes/trace hoặc PR summary.
- Áp dụng taste skill ở mức chống UI cẩu thả: label rõ, contrast đủ, control
  không wrap vụng, density phù hợp dashboard, không thêm visual motif mới.
- Không áp dụng landing-page pattern của taste skill cho dashboard/table.
- Nếu cần icon, dùng icon family hiện có trong repo; không hand-roll SVG.

## Data Flow

1. User chọn một hoặc nhiều nhóm chỉ tiêu trong filter form.
2. Form submit GET, URL chứa `resultGroupIds` lặp và `page=1`.
3. `parseSampleGridQuery` normalize URL thành `SampleGridQuery`.
4. `listSampleGridPage` truyền query xuống `SampleGridPort.listSamples`.
5. Supabase adapter lọc sample ids qua `sample_result_groups` trong tenant hiện
   tại rồi lấy page/count theo tập mẫu đã lọc.
6. `SampleGridPageContent` render lại filter state, result column selection và
   pagination href cùng query state hiện tại.

## Reuse And Caching

- Reuse `SelectField`, `Button`, `Input`, `DashboardDataTable`,
  `SampleGridTableSection` và các helper URL hiện có khi phù hợp.
- Không thêm TanStack Query, SWR hoặc client cache mới.
- Server Components/search params là state chính; client state chỉ dùng cho
  interaction nhỏ nếu shared control hiện có yêu cầu.

## Alternatives Considered

- Lọc theo `result_templates` hoặc `sample_type_id`: không dùng vì story cha đã
  chuyển contract sang `sample_result_groups`.
- Thêm cột nhóm chỉ tiêu vào table trong 04B: không làm nếu không cần cho filter
  proof; cột/result display thuộc result column mode hoặc 04C.
- Local-only filter không đổi URL: không dùng vì sample grid hiện giữ state bằng
  URL và pagination href.
