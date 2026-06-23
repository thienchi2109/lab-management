# FB-20260623-02D - Bộ lọc riêng cho từng biểu đồ Báo cáo

## Status

planned

## Lane

normal

## Product Contract

Mỗi biểu đồ trong tab `Báo cáo` có nhóm bộ lọc riêng. Khi người dùng chỉnh bộ
lọc của một biểu đồ, chỉ biểu đồ đó được cập nhật; các biểu đồ khác giữ nguyên
dataset/filter đang áp dụng.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/stories/FB-20260623-02B-report-kit-analytics-contract/overview.md`
- `docs/stories/FB-20260623-02C-report-pie-charts-ui.md`

## Acceptance Criteria

- Mỗi chart card có filter summary riêng.
- Chỉnh filter của chart 1 không đổi dataset hoặc summary của chart 2, 3, 4.
- Khoảng ngày mặc định của mỗi chart kế thừa story `FB-20260623-02A`.
- UI có affordance rõ để mở/chỉnh filter của từng chart mà không làm trang rối
  trên mobile.
- Viewer có thể chỉnh filter để tự xem trong phiên hiện tại, nhưng story này
  không lưu preset mặc định cho người khác.
- Không thay đổi role/authorization hoặc persistence; lưu preset thuộc
  `FB-20260623-02E`.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: gọi chart dataset theo từng `chartId` và filter riêng.
- API: có thể dùng endpoint chart dataset từ `FB-20260623-02B`; nếu cần batch
  nhiều chart, phải giữ response rõ theo `chartId`.
- Tables: không đổi.
- Domain rules: filter riêng chỉ là query state, không phải cấu hình bền vững.
- UI surfaces: chart cards trong `/dashboard/analytics`.

## Frontend, Reuse, And Caching Constraints

- Invoke Build Web Apps plugin capability trước khi sửa dashboard interaction
  state/responsive UI.
- Invoke `code-deduplication` trước khi tạo filter card/sheet reusable mới.
- Dùng shared dashboard form/select/input/sheet primitives nếu phù hợp.
- Không thêm TanStack Query mặc định. Nếu cần tránh race condition nhiều request,
  ưu tiên request id guard hoặc server action pattern hiện có; chỉ đề xuất cache
  library nếu có bằng chứng.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260623-02D --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | State reducer/helper giữ filter riêng theo `chartId`; không mutate chart khác. |
| Integration | Component/page test chỉnh filter một chart và assert chart khác giữ nguyên summary. |
| E2E | Browser desktop/mobile chỉnh filter từng chart, không tràn ngang, không stale update sai chart. |
| Platform | Không bắt buộc. |
| Release | Screenshot hoặc browser log cho flow chỉnh filter trên mobile. |

## Harness Delta

Thêm story riêng cho filter per-chart, tách khỏi persistence Admin/Viewer.

## Evidence

Chưa có. Story đang ở trạng thái planned.
