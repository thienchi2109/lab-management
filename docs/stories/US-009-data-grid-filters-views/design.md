# Design

## Domain Model

US-009 xem bảng dữ liệu chính là read model tổng hợp từ các boundary đã có:

- `samples` là dòng chính của bảng;
- `customers`, `companies`, `sample_types`, `kit_types`, và `kits` cung cấp
  metadata để filter/search;
- `sample_results`, `result_groups`, `result_metrics`, và `result_templates`
  cung cấp group detail và cột kết quả có thể chọn trên desktop;
- `sample_images` chỉ cần summary như số ảnh hoặc trạng thái có ảnh, không mở
  rộng workflow upload;
- audit log chỉ ghi khi người dùng thực hiện hành động đã có từ các module
  trước, không ghi khi đổi tùy chọn cột local.

Read model phải giữ tenant isolation, role authorization, và whitelist
filter/sort/column để không mở truy vấn tùy ý từ client.

## Application Flow

1. Người dùng mở bảng mẫu trong dashboard.
2. Server đọc `searchParams`, chuẩn hóa page/page size/search/filter/sort/view
   mode, và áp dụng default an toàn.
3. Query phía server trả về một trang dữ liệu, tổng số dòng phù hợp, metadata
   filter, và summary kết quả/ảnh cần thiết cho bảng.
4. Client hiển thị bảng bằng shared dashboard primitives. Table/list surface
   phải dùng `DashboardDataTable` trừ khi implementation ghi rõ ngoại lệ đã
   được duyệt.
5. Người dùng đổi filter/search/sort/page; URL phản ánh state đủ để refresh hoặc
   chia sẻ trong phạm vi hợp lý.
6. Người dùng mở group detail của một mẫu để xem nhóm/chỉ tiêu kết quả. Hành
   động chỉnh sửa vẫn chuyển qua flow của US-006/US-007/US-008.
7. Tùy chọn ẩn/hiện cột và compact mode được lưu local/session để không cần
   mutation server.

## Interface Contract

- Search input có debounce hợp lý hoặc submit rõ ràng, không spam server action.
- Filter dùng select/date controls có nhãn rõ ràng và trạng thái empty/reset.
- Sort chỉ nhận key từ danh sách cột được whitelist.
- Page size có giới hạn tối đa để bảo vệ truy vấn.
- Desktop có column mode để chọn nhóm/chỉ tiêu kết quả cần bung.
- Mobile/tablet dùng compact mode và group detail, không render ma trận cột kết
  quả rộng.
- Row action phải tôn trọng role: Viewer chỉ xem, Admin/Editor dùng hành động
  đã có cho metadata, kết quả, hoặc ảnh.
- Loading, empty, error, và permission-denied state phải được thể hiện bằng
  shared dashboard messages.

## Data Model

US-009 ưu tiên query/read-model trước khi thêm schema. Nếu implementation chứng
minh cần cột, index, function, view, hoặc RPC mới thì phải dùng migration
forward-only và kiểm tra live Supabase đúng project trước mọi write.

Các ràng buộc dữ liệu:

- không query toàn bộ dataset khi chưa filter/paginate;
- filter/sort phải có whitelist server-side;
- query phải giữ organization/tenant scope;
- kết quả động chỉ lấy nhóm/chỉ tiêu cần hiển thị cho trang hiện tại;
- column visibility local/session không được lưu vào bảng ứng dụng trong slice
  đầu tiên.

## UI / Platform Impact

US-009 chạm UI/frontend, responsive layout, dashboard interaction state, browser
verification, table/list surface, và server state.

Implementation phải:

- invoke Build Web Apps plugin capability trước khi sửa UI/frontend;
- invoke `code-deduplication` trước khi thêm reusable UI, hook, service, helper,
  hoặc shared logic;
- tái sử dụng dashboard primitives cho form controls, filters, selects,
  messages, layout, dialogs, và table;
- dùng `DashboardDataTable` cho table/list surface trừ khi có ngoại lệ được ghi
  trong packet hoặc trace;
- giữ server-state mặc định bằng Server Components, server actions,
  `useActionState`, và `revalidatePath`;
- không thêm TanStack Query nếu chưa chứng minh yêu cầu client-cache cụ thể;
- dùng TanStack Table v8 cho logic table/column khi implementation cần, đúng
  product tech stack.

## Observability

- Log lỗi query/filter/sort theo dạng không chứa dữ liệu nhạy cảm.
- Không log toàn bộ search text dài, payload filter thô, hoặc dữ liệu kết quả
  mẫu.
- Trace validation phải ghi rõ dataset/fixture dùng để chứng minh phân trang
  server-side, mobile compact mode, và desktop column mode.
- Nếu thêm RPC/query mới, test phải chứng minh tenant isolation và role read
  behavior.

## Alternatives Considered

1. Mở rộng trực tiếp bảng sample metadata hiện tại.
   - Phù hợp cho diff nhỏ, nhưng dễ trộn trách nhiệm CRUD metadata với data
     grid tổng hợp kết quả/ảnh.

2. Tạo read model/query riêng cho data grid.
   - Khuyến nghị. Cách này giữ bảng chính đủ nhanh, có whitelist filter/sort,
     và không ép UI metadata hiện tại gánh toàn bộ Phase 8.

3. Lưu mọi tùy chọn cột vào database.
   - Chưa cần cho MVP slice. Local/session storage đủ cho column visibility và
     tránh mở thêm ownership/permission contract.
