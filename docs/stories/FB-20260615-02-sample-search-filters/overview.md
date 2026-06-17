# FB-20260615-02 - Bộ lọc mẫu theo phản hồi khách hàng

## Trạng thái

planned

## Lane

high-risk

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, Server state, Shared code, Public contracts,
  Existing behavior, Weak proof.
- Lý do high-risk: thay đổi query/filter URL state của trang Mẫu và cách người
  dùng tra cứu dữ liệu nghiệp vụ.

## Product Contract

- `docs/product/ui-contract.md` - data grid modes và mobile-first.
- `docs/product/data-model.md` - sample types, customers, companies, result
  groups.
- `docs/product/api-contract.md` - export và analytics/query contracts.

## Current Behavior

Trang Mẫu hiện có tìm kiếm tự do, trạng thái mẫu, trạng thái thanh toán, sort và
hướng sort. Query layer đã có `receivedFrom`, `receivedTo`, `sampleTypeId`,
`companyId` nhưng UI chưa expose đầy đủ các filter khách hàng yêu cầu.

## Target Behavior

- Tiêu đề trang là `DANH SÁCH MẪU`.
- Chú thích nêu đúng phạm vi tra cứu: ngày, loại mẫu, khách hàng, tên công ty,
  nhóm chỉ tiêu.
- Export dữ liệu nằm ở góc trên bên phải.
- Khoảng ngày có 2 ô cùng dòng, mặc định từ 10 ngày trước đến hôm nay.
- Loại mẫu là dropdown, mặc định `Tất cả`.
- Tên khách hàng là combobox nhập tự do, có dropdown gợi ý khi gõ, mặc định
  `Tất cả`.
- Tên công ty có hành vi giống khách hàng.
- Nhóm chỉ tiêu mặc định `Tất cả`, hỗ trợ chọn nhiều nhóm đang có.
- UI không còn filter trạng thái mẫu và trạng thái thanh toán.
- Sort cố định ngày mới nhất trước, không hiện bộ lọc tăng/giảm dần.

## Acceptance Criteria

- URL/query state giữ được filter sau submit và pagination.
- Date range mặc định đúng 10 ngày gần nhất khi người dùng chưa đặt filter.
- Customer/company combobox nhận text tự do nhưng vẫn gợi ý từ dữ liệu hiện có.
- Filter nhóm chỉ tiêu hỗ trợ chọn nhiều nhóm.
- Export dùng cùng query đã lọc.
- Không còn UI filter trạng thái mẫu và trạng thái thanh toán.
- Không còn UI sort direction.

## Non-Goals

- Không đổi thuật toán kết quả chung.
- Không thêm TanStack Query nếu Server Components/server actions đủ dùng.
- Không làm migration trong story này trừ khi story
  `FB-20260615-04-sample-multi-result-groups` đã chốt data contract.

## Slice Plan

Story cha được chia thành 3 slice để giảm blast radius và giữ proof rõ theo
từng tầng:

- `FB-20260615-02A` - Query contract và export parity. Chuẩn hóa parser,
  default date range, fixed sort ngày mới nhất trước, và đảm bảo export dùng
  cùng filter contract.
- `FB-20260615-02B` - Server/options cho bộ lọc mẫu. Chuẩn hóa payload option
  cho loại mẫu, khách hàng, công ty và nhóm chỉ tiêu; hỗ trợ text tự do cho
  customer/company qua server boundary.
- `FB-20260615-02C` - UI bộ lọc mẫu. Render title, mô tả, export placement,
  date range, dropdown/combobox/multi-select và bỏ UI filter trạng thái mẫu,
  trạng thái thanh toán, sort direction.

Story cha vẫn là nguồn product contract. Story con cập nhật proof và status
của riêng mình. Khi cả 3 slice đạt verify-command, story cha được chuyển sang
`implemented` kèm evidence tổng hợp.
