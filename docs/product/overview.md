# Product Overview

## Mục đích

Web app nội bộ quản lý mẫu phòng lab cho 5–7 user. Quản lý KIT xét nghiệm,
nhập kết quả theo nhóm chỉ tiêu động, upload ảnh minh chứng, dashboard/pivot,
xuất Excel/CSV.

## Đối tượng sử dụng

- Kỹ thuật viên phòng lab (Editor)
- Quản lý phòng lab (Admin)
- Khách hàng/đối tác xem kết quả (Viewer)

## Ngôn ngữ giao diện

Tiếng Việt.

## MVP Scope

### Must have

- Quản lý KIT/lô KIT/tồn kho KIT
- Quản lý mẫu với 20–30 trường metadata
- Nhập kết quả xét nghiệm theo nhóm/chỉ tiêu động
- 10 kiểu nhập liệu: number, text, textarea, select, multi_select, boolean,
  scale_1_5, percent, pcr_qualitative, pcr_realtime
- Upload tối đa 10 ảnh/mẫu (≤5 MB/ảnh)
- Bảng dữ liệu filter/sort/search, ẩn/hiện cột
- Form nhập liệu responsive/mobile-first
- Kết Quả Chung theo từng nhóm kết quả
- Dashboard/pivot cơ bản
- Export Excel/CSV
- RBAC 3 mức: Admin, Editor, Viewer
- Audit trail nhẹ
- RLS cho các bảng chính

### Should have

- Autosave draft cho form nhập mẫu
- Template form theo loại mẫu/loại kit
- File đính kèm PDF/CSV ngoài ảnh
- Report view cho mẫu đã duyệt

### Won't have trong MVP

- Go backend
- LIMS integration phức tạp
- SSO doanh nghiệp
- Quy trình duyệt đa cấp
- Tự động lấy dữ liệu từ máy đo realtime
- Đánh giá Naup/Art
