# FB-20260621-04 - UI tổng hợp chi phí hiện tại trong Kho KIT

## Status

implemented

## Lane

normal

## Product Contract

Phần `Chi phí hiện tại` của tab `Kho KIT` phải cho phép lọc theo tình trạng chi
phí của mẫu và hiển thị tổng chi phí cho các nhóm: `Tiền mặt thu được`, `Nhận
chuyển khoản`, `Ghi hóa đơn`, và `Khác`.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/FB-20260621-01-kit-inventory-layout.md`
- `docs/stories/FB-20260621-03-sample-cost-data-contract.md`

## Acceptance Criteria

- Phần 2 hiển thị bốn tổng chi phí theo đúng nhãn khách yêu cầu.
- Có bộ lọc tình trạng chi phí của mẫu; bộ lọc dùng contract từ
  `FB-20260621-03`.
- Tổng tiền định dạng nhất quán, không hiển thị giá trị `NaN`, `null`, hoặc số
  âm ngoài ý nghĩa nghiệp vụ đã được xác nhận.
- Empty state rõ ràng khi chưa có mẫu có chi phí.
- Không thay đổi hành vi danh sách mẫu trừ khi có story riêng.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: consume read model/RPC từ `FB-20260621-03`.
- API: không thêm client fetch nếu Server Component có thể tải dữ liệu.
- Tables: không đổi ở story này.
- Domain rules: chỉ render dữ liệu đã được normalize; không tự map trạng thái
  chi phí trong component nếu server contract đã có.
- UI surfaces: phần 2 trong `/dashboard/kits`.
- Dependency: phải làm sau `FB-20260621-03`; nên làm sau `FB-20260621-01`.

## Frontend, Reuse, And Caching Constraints

- Dùng shared filter/select và dashboard primitives hiện có.
- Trước khi tạo summary card/component mới, chạy code-deduplication.
- Không thêm TanStack Query; ưu tiên Server Component và URL/search params nếu
  bộ lọc cần shareable state.
- Trước khi triển khai UI, dùng Build Web Apps plugin capability theo Harness.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-04 --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test format tiền, nhãn nhóm, và empty state. |
| Integration | Test render với nhiều trạng thái chi phí và filter đang chọn. |
| E2E | Browser check `/dashboard/kits` xác nhận filter và tổng tiền cập nhật đúng. |
| Platform | Không bắt buộc nếu không có migration. |
| Release | Screenshot phần `Chi phí hiện tại`. |

## Harness Delta

Thêm story packet UI cho phần 2 của phản hồi khách ngày 2026-06-21.

## Evidence

- Red: `cd lab-kit-app && bun run test ./app/dashboard/kits/_components/kit-sample-cost-summary-ui.test.tsx`
  fail vì phần `Chi phí hiện tại` còn placeholder, chưa render bốn nhãn
  contract, filter tình trạng chi phí, và empty state.
- Green focused tests:
  `cd lab-kit-app && bun run test ./app/dashboard/kits/_components/kit-inventory-page-content.test.tsx ./app/dashboard/kits/_components/kit-sample-cost-summary-ui.test.tsx ./lib/sample-metadata/sample-cost-summary-server.test.ts ./lib/sample-metadata/sample-cost-schema-contract.test.ts`
  pass 4 files, 13 tests.
- Quality gates: `cd lab-kit-app && bun run typecheck`, `bun run lint:strict`,
  `bun run format:check`, `bun run docstring:check`,
  `bun run react-doctor:diff`, và `bun run build` đều pass.
- Live seed proof: qua namespace `mcp__supabase_lab_management`, project-ref
  `tuuqgpzgollcerqqszjr`, đã seed idempotent 4 mẫu `FB04_COST_*` vào
  `public.samples` cho bốn nhóm `cash`, `bank_transfer`, `invoice`, `other`;
  aggregate live trả `120000`, `340000`, `560000`, `78000`.
- E2E browser proof: `agent-browser` đăng nhập bằng admin credential do user
  cung cấp, mở `http://127.0.0.1:3000/dashboard/kits`, xác nhận không có
  framework overlay, page có content, bốn tổng tiền hiển thị, chọn filter
  `Ghi hóa đơn` thì phần chi phí chỉ còn `Ghi hóa đơn` và `560.000 ₫`.
- Release screenshot: `/tmp/fb-20260621-04-kits-cost-filtered.png`.
- Harness trace closeout: #215.
