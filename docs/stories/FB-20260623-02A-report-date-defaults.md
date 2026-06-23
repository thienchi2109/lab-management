# FB-20260623-02A - Mặc định khoảng ngày Báo cáo theo tháng hiện tại

## Status

implemented

## Lane

normal

## Product Contract

Tab `Báo cáo` phải mở với khoảng ngày mặc định từ ngày 1 của tháng hiện tại
đến hôm nay. Hai ô `Từ ngày` và `Đến ngày` phải nằm trên cùng một dòng khi màn
hình đủ rộng, đồng thời vẫn gọn và không tràn trên mobile.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/product/ui-contract.md`
- `docs/stories/US-010D-analytics-page-ui/overview.md`
- `docs/stories/US-016D-polish-analytics-pivot/overview.md`

## Acceptance Criteria

- `/dashboard/analytics` tính `receivedFrom` là ngày đầu tháng theo ngày hiện
  tại của server và `receivedTo` là hôm nay.
- Hai input ngày hiển thị cùng một hàng trên desktop/tablet; mobile được phép
  xếp lại nếu cần để không tràn ngang.
- Bộ lọc áp dụng ban đầu và filter summary dùng đúng khoảng ngày mới.
- Không đổi API `POST /api/analytics/pivot`, quyền truy cập, query whitelist,
  schema hoặc dữ liệu analytics.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: giữ query analytics hiện tại, chỉ đổi default filters khởi tạo.
- API: không đổi request/response của `/api/analytics/pivot`.
- Tables: không đổi.
- Domain rules: "hôm nay" dùng cùng chuẩn ngày hiện tại đang dùng trong
  analytics page; nếu cần timezone Việt Nam thì dừng và tách story riêng vì
  hiện contract chưa định nghĩa timezone cho báo cáo.
- UI surfaces: `lab-kit-app/app/dashboard/analytics/page.tsx`,
  `lab-kit-app/app/dashboard/analytics/_components/analytics-filter-card.tsx`.

## Frontend, Reuse, And Caching Constraints

- Trước khi sửa UI/responsive layout, invoke Build Web Apps plugin capability.
- Không tạo filter component mới nếu `AnalyticsFilterCard` hiện tại đủ để sửa
  layout.
- Không thêm client-cache library; giữ state hiện tại của page.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260623-02A --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test helper/default filter trả về ngày đầu tháng và hôm nay với ngày cố định. |
| Integration | Test render analytics page nhận `initialFilters` đúng khoảng tháng hiện tại. |
| E2E | Browser check `/dashboard/analytics` desktop/mobile, hai ô ngày hiển thị đúng và không tràn ngang. |
| Platform | Không bắt buộc. |
| Release | Screenshot hoặc log browser proof sau khi triển khai. |

## Harness Delta

Thêm story từ phản hồi khách hàng ngày 2026-06-23 cho phần hiển thị bộ lọc tab
`Báo cáo`.

## Evidence

- RED:
  `cd lab-kit-app && bun run test --run app/dashboard/analytics/page.test.tsx`
  fail đúng vì `listAnalyticsDataset` nhận `receivedFrom: "2026-06-09"`
  thay vì `"2026-06-01"` khi system time là `2026-06-15T12:00:00.000Z`.
- GREEN:
  `cd lab-kit-app && bun run test --run app/dashboard/analytics/page.test.tsx`
  pass 1 file / 2 tests sau khi default filter đổi sang ngày đầu tháng hiện
  tại.
- Focused analytics regression:
  `cd lab-kit-app && bun run test --run app/dashboard/analytics/page.test.tsx app/dashboard/analytics/_components/analytics-page-client.test.tsx`
  pass 2 files / 10 tests.
- Static gates passed: `bun run typecheck`, `bun run format:check`,
  `bun run docstring:check`, `bun run react-doctor:diff`.
- Runtime HTML smoke trên dev server `http://localhost:3000`: đăng nhập bằng
  fixture admin, GET `/dashboard/analytics` trả HTTP 200, có heading `Báo cáo
  thống kê & Pivot`, `value="2026-06-01"` và `value="2026-06-23"`.
- Agent Browser E2E passed with account `admin / 123456@`: `/login` rendered,
  form submit authenticated to `/dashboard/samples`, navigation to
  `/dashboard/analytics` rendered `Báo cáo thống kê & Pivot`, DOM date input
  values were `["2026-06-01", "2026-06-23"]`, no framework error overlay was
  detected, and `docWidth=1265 <= innerWidth=1280`. Screenshot:
  `/tmp/lab-management-02a-agent-browser-analytics.png`.
- Harness verify passed:
  `scripts/bin/harness-cli story verify FB-20260623-02A`.
