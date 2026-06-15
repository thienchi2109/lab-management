# FB-20260615-05 - Bố cục Mở kết quả theo thứ tự nghiệp vụ

## Trạng thái

planned

## Lane

normal

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, Existing behavior, Weak proof.
- Lý do normal: thay đổi bố cục màn hình result detail, không đổi result engine
  nếu chỉ sắp xếp và trình bày lại dữ liệu đã có.

## Product Contract

- `docs/product/ui-contract.md` - result group card và mobile-first.
- `docs/product/result-engine.md` - Kết Quả Chung và metric input types.
- `docs/stories/US-016H-sample-results-polish/overview.md` - polish result
  entry hiện tại.

## Current Behavior

Màn hình kết quả hiện đặt `Ảnh minh chứng` trước các nhóm kết quả. Phần đầu chỉ
có tiêu đề `Kết quả mẫu ...` và template, chưa có bảng thông tin mẫu giống
danh sách bên ngoài.

## Target Behavior

- Khi bấm `Mở kết quả`, phần đầu là bảng/thẻ thông tin mẫu giống thông tin bên
  ngoài nhưng đầy đủ hơn.
- Phần giữa là bảng kết quả chi tiết theo từng nhóm/chỉ tiêu.
- Phần cuối là ảnh kết quả.
- Nút lưu và feedback vẫn dễ thấy, không bị ảnh đẩy xuống quá xa trên mobile.

## Acceptance Criteria

- Result detail render theo thứ tự: thông tin mẫu, kết quả chi tiết, ảnh.
- Thông tin mẫu có mã mẫu, ngày, loại mẫu, khách hàng, công ty, trạng thái,
  nhóm chỉ tiêu.
- Kết quả vẫn nhập/sửa được theo quyền hiện tại.
- Viewer vẫn read-only.
- Mobile không có horizontal overflow.

## Non-Goals

- Không đổi thuật toán save result.
- Không đổi upload ảnh, ngoài việc dời panel xuống cuối.
- Không triển khai multi-group nếu story FB-20260615-04 chưa xong; story này
  chỉ hiển thị theo data contract hiện có.

