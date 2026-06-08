# US-009A - Data Grid Query Contract

**Lane:** high-risk  
**Phase:** 8  
**Status:** planned  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)

## Current Behavior

Ứng dụng chưa có contract server-side riêng cho bảng mẫu chính. Các module trước
đã có dữ liệu mẫu, kết quả, và ảnh, nhưng chưa có lớp normalize `searchParams`,
page/page size cap, filter/sort whitelist, hoặc proof rằng bảng mẫu không cần
tải toàn bộ dataset.

## Target Behavior

Server có query contract nhỏ, testable, dùng được cho các slice UI sau:

- normalize page, page size, search, filter, sort, và default an toàn;
- giới hạn page size;
- whitelist search/filter/sort phía server;
- trả về một trang dữ liệu mẫu và tổng số dòng phù hợp;
- giữ tenant scope và role read behavior cho Admin, Editor, Viewer;
- cung cấp metadata tối thiểu để US-009B dựng bảng MVP.

## Affected Users

- Admin, Editor, Viewer: gián tiếp được bảo vệ khỏi grid chậm hoặc lộ dữ liệu.
- Reviewer: review contract dữ liệu riêng, chưa phải review UI lớn.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/TEST_MATRIX.md`
- `original_specs/SPEC-001.md`

## Non-Goals

- Render bảng UI hoàn chỉnh.
- Compact/mobile mode.
- Column visibility.
- Group detail và desktop result column mode.
- Export/dashboard/report view.
- Supabase migration/RPC/index nếu query hiện tại đủ; nếu không đủ, mở US-009E.
