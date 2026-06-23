# FB-20260623-02C - Bốn biểu đồ tròn trong tab Báo cáo

## Status

planned

## Lane

normal

## Product Contract

Tab `Báo cáo` phải hiển thị 4 biểu đồ tròn theo dữ liệu đã được khóa trong
`FB-20260623-02B`:

1. Tổng lượng kit theo `Loại mẫu`.
2. Tổng lượng kit theo `Loại kit`.
3. Tổng lượng mẫu sử dụng theo `Phân loại`.
4. Tổng lượng sạch của `tôm PL` theo `Kết quả chung_PCR`.

Mỗi biểu đồ phải có tiêu đề, tổng số, nhãn segment đọc được và empty state rõ
khi không có dữ liệu.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/product/ui-contract.md`
- `docs/stories/US-010D-analytics-page-ui/overview.md`
- `docs/stories/FB-20260623-02B-report-kit-analytics-contract/overview.md`

## Acceptance Criteria

- Render đủ 4 biểu đồ tròn trên `/dashboard/analytics`.
- Biểu đồ dùng dataset từ contract của `FB-20260623-02B`, không tự aggregate lại
  trong component UI.
- Segment có nhãn, số lượng và phần trăm; dữ liệu nhỏ vẫn đọc được.
- Empty state riêng từng biểu đồ khi dataset rỗng.
- Desktop và mobile không tràn ngang, không chồng nhãn, không có chart trống khó
  hiểu.
- Không thêm filter riêng từng biểu đồ trong story này; filter riêng thuộc
  `FB-20260623-02D`.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: gọi contract chart dataset đã có từ `FB-20260623-02B`.
- API: không đổi nếu `FB-20260623-02B` đã cung cấp endpoint phù hợp.
- Tables: không đổi trong story này.
- Domain rules: UI không quyết định nghĩa `tổng lượng kit`, `Phân loại` hoặc
  `Kết quả chung_PCR`.
- UI surfaces: `/dashboard/analytics`, chart section dưới bộ lọc báo cáo.
- Dependency: chỉ triển khai sau khi `FB-20260623-02B` có contract đủ rõ.

## Frontend, Reuse, And Caching Constraints

- Invoke Build Web Apps plugin capability trước khi sửa chart UI.
- Invoke `code-deduplication` trước khi thêm chart component/shared helper mới.
- Kiểm tra hiện repo chưa có pie chart component; nếu thêm thư viện chart mới
  thì phải ghi lý do trong story evidence.
- Ưu tiên Server Component/read data ban đầu; không thêm TanStack Query trừ khi
  filter story sau chứng minh cần client cache.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260623-02C --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test chart component render segment labels, totals, percentages and empty state. |
| Integration | Test analytics page render đủ 4 chart card từ fixture dataset. |
| E2E | Browser desktop/mobile `/dashboard/analytics`, chart không trống, không overlay, không horizontal overflow. |
| Platform | Không bắt buộc. |
| Release | Screenshot desktop/mobile sau khi triển khai. |

## Harness Delta

Thêm story UI riêng để không gộp render chart với data contract.

## Evidence

Chưa có. Story đang ở trạng thái planned.
