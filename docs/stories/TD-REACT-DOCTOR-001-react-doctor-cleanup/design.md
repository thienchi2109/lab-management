# TD-REACT-DOCTOR-001 Design

## Scope

Sửa các mẫu mã bị React Doctor cảnh báo bằng thay đổi nhỏ:

- Liên kết search label với input bằng `htmlFor`/`id`.
- Chạy song song các promise độc lập bằng `Promise.all`.
- Dùng `Set` cho membership lookup trong vòng lặp.
- Dùng `toSorted` cho sort bất biến.

## Non-goals

- Không refactor lại sample grid.
- Không đổi thứ tự quyền kiểm tra hoặc semantic lỗi.
- Không đổi RPC, schema, RLS, hoặc migration.
- Không xử lý cảnh báo ngoài 6 cảnh báo hiện tại nếu phát sinh do thay đổi
  ngoài scope.

## Risk Notes

- Các await song song chỉ áp dụng cho tác vụ độc lập đã không phụ thuộc dữ liệu
  lẫn nhau.
- Test concurrency phải chứng minh promise thứ hai bắt đầu trước khi promise
  thứ nhất resolve.

