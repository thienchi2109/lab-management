# Design

## Direction

Mở rộng filter surface của `SampleGridPageContent` dựa trên query contract hiện
có. Những filter chưa có source option rõ ràng phải đọc từ server cùng page
payload thay vì hard-code ở client.

Implementation đi theo 3 slice: query/export contract trước, server options sau,
cuối cùng mới render UI. Cách này giữ URL state và export parity được test trước
khi chạm layout.

## Interface Contract

- Query giữ key ngày hiện có: `receivedFrom`, `receivedTo`.
- Query loại mẫu dùng `sampleTypeId`.
- Query công ty ưu tiên `companyId` khi chọn từ gợi ý; text tự do cần contract
  riêng nếu khách chỉ nhập tên không chọn ID.
- Query khách hàng cần quyết định kỹ thuật: hiện grid search có
  `customerName`; nếu cần filter riêng theo customer ID/text, phải mở rộng query
  contract.
- Query nhóm chỉ tiêu hỗ trợ nhiều giá trị, ví dụ `resultGroups=<id>`.
- UI mới không phát sinh filter trạng thái mẫu, trạng thái thanh toán hoặc sort
  direction.

## Component Scope

- `lab-kit-app/app/dashboard/samples/_components/sample-grid-page-content.tsx`
- `lab-kit-app/lib/sample-grid/query.ts`
- `lab-kit-app/lib/sample-grid/server.ts`
- `lab-kit-app/lib/sample-grid/operations.ts`
- export sample query nếu cần đồng bộ filter.

## Slice Boundaries

- `FB-20260615-02A`: parser/query/export contract, không render UI.
- `FB-20260615-02B`: server page payload và adapter filter, không làm layout
  cuối.
- `FB-20260615-02C`: UI filter, URL submit/pagination và browser ergonomics.

## Error Handling

- Filter không hợp lệ phải bị normalize bỏ qua hoặc trả về state an toàn, không
  làm lỗi route.
- Ngày không hợp lệ không được tạo query rộng ngoài ý muốn.

## Open Technical Decision

Cần xác nhận live DB/source option trước implementation: khách hàng/công ty đang
là reference table hay phần lớn chỉ là text trên `samples.customer_name`. Việc
này dùng Supabase MCP read-only, không write.
