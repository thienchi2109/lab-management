---
id: FB-20260615-08
title: Xem kết quả không làm mất context danh sách mẫu
status: planned
lane: normal
---

# FB-20260615-08 - Xem kết quả không làm mất context danh sách mẫu

## Trạng thái

planned

## Lane

normal

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, routing workflow, existing behavior, browser proof.
- Lý do normal: thay đổi workflow xem kết quả trên UI nhưng không đổi DB, auth,
  provider, upload, thuật toán lưu kết quả hoặc contract dữ liệu mẫu.

## Product Contract

- `docs/product/ui-contract.md` - mobile-first, card/accordion cho result groups,
  primary CTA luôn dễ truy cập.
- `docs/product/result-engine.md` - nhóm kết quả và quyền nhập/sửa hiện tại.
- `docs/stories/FB-20260615-05-sample-result-detail-layout/overview.md` - bố cục
  nội dung chi tiết kết quả.

## Current Behavior

Từ danh sách mẫu, người dùng nhấn `Xem kết quả` và app điều hướng sang một trang
kết quả riêng. Workflow này làm người dùng mất context danh sách hiện tại, bao
gồm bộ lọc, phân trang, vị trí cuộn và thao tác đang làm trên trang mẫu.

## Target Behavior

Người dùng xem kết quả từ danh sách mẫu mà vẫn giữ nguyên context danh sách. UI
nên mở một overlay duy nhất từ danh sách mẫu, ưu tiên drawer/dialog responsive,
với nội dung được chia tab rõ ràng:

1. `Thông tin mẫu`
2. `Kết quả`
3. `Ảnh` nếu ảnh có thao tác riêng hoặc số lượng lớn; nếu không, ảnh có thể nằm
   cuối tab `Kết quả` để bám sát FB-20260615-05.

Đóng overlay phải đưa người dùng về đúng danh sách trước đó, không reset filter,
page, sort, search hoặc scroll nếu các trạng thái này đang tồn tại ở trang danh
sách.

## Acceptance Criteria

- Nhấn `Xem kết quả` từ danh sách mẫu không điều hướng người dùng rời khỏi
  context danh sách.
- Đóng viewer quay lại đúng trạng thái danh sách trước đó: filter, search, sort,
  phân trang và vị trí cuộn không bị reset.
- Viewer hiển thị thông tin mẫu và kết quả theo tab hoặc segmented controls rõ
  ràng, dùng được trên mobile.
- Quyền hiện tại được giữ nguyên: Editor/Admin vẫn nhập/sửa theo contract hiện
  có, Viewer vẫn read-only.
- Nếu có thay đổi chưa lưu, hành vi đóng viewer phải fail-safe: chặn đóng, xác
  nhận, hoặc giữ nguyên cơ chế hiện có; không được âm thầm mất dữ liệu.
- Deep link/trang kết quả hiện tại không bị phá nếu đang được dùng trực tiếp từ
  bookmark hoặc từ nơi khác.
- Mobile không có horizontal overflow, focus không bị kẹt, và thao tác back/close
  có hành vi dự đoán được.

## Non-Goals

- Không đổi thuật toán save result.
- Không đổi upload/delete ảnh hoặc giới hạn ảnh; phần này thuộc FB-20260615-06.
- Không thay đổi quyền Admin/Editor/Viewer.
- Không đổi data model hoặc RPC.
- Không bắt buộc xóa route kết quả hiện tại; route có thể tiếp tục là fallback
  hoặc deep link.
