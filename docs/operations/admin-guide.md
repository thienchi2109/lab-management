# Hướng dẫn Admin

## Mục tiêu

Admin quản lý cấu hình xét nghiệm, người dùng và dữ liệu nền trước khi Editor
nhập mẫu hoặc kết quả.

## Cấu hình nhóm và chỉ tiêu

1. Đăng nhập bằng tài khoản Admin.
2. Mở `Chỉ tiêu`.
3. Kiểm tra danh sách nhóm kết quả, chỉ tiêu và template.
4. Chỉ tạo hoặc sửa cấu hình khi đã biết rõ quy trình lab áp dụng.
5. Với nhóm chất lượng nước, ngưỡng seed chỉ là giá trị tham khảo. Admin phải rà
   soát theo loài nuôi, giai đoạn nuôi, loại mẫu và quy trình nội bộ.

## Quản lý người dùng

1. Mở `Người dùng`.
2. Tạo tài khoản mới bằng username, email và mật khẩu tạm.
3. Gán role phù hợp:
   - `admin`: quản trị cấu hình và người dùng.
   - `editor`: nhập mẫu, nhập kết quả và upload ảnh.
   - `viewer`: xem dashboard, bảng mẫu và export.
4. Không vô hiệu hóa admin hoạt động cuối cùng.

## Kiểm tra sau thay đổi

- Mở dashboard để xác nhận dữ liệu vẫn tải.
- Mở bảng mẫu để xác nhận các cột kết quả vẫn render.
- Ghi lại thay đổi cấu hình quan trọng trong audit hoặc runbook vận hành.
