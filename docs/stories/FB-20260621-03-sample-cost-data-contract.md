# FB-20260621-03 - Hợp đồng dữ liệu chi phí mẫu

## Status

planned

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

## Frontend, Reuse, And Caching Constraints

- Không tạo UI trong story này ngoài test fixture nếu cần.
- Trước khi tạo helper/query shared mới, chạy code-deduplication và kiểm tra
  helper sample-grid/sample-metadata hiện có.
- Không thêm TanStack Query.
- Nếu phát sinh migration hoặc RPC, mở rộng test server/domain trước.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-03 --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test mapper/grouping chi phí theo bốn nhóm trạng thái. |
| Integration | Test server helper/RPC payload với fixture Supabase mock hoặc live read nếu được phép. |
| E2E | Không bắt buộc vì chưa có UI. |
| Platform | Bắt buộc nếu có migration live hoặc RPC mới. |
| Release | Ghi rõ schema/query contract được chốt. |

## Harness Delta

Thêm story packet nền dữ liệu cho phần 2 của phản hồi khách ngày 2026-06-21.

## Evidence

Chưa có.
