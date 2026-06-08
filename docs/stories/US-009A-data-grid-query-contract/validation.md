# Validation

## Proof Strategy

US-009A hoàn tất khi query contract được test độc lập và chứng minh không tải
toàn bộ dataset cho bảng mẫu chính.

Proof bắt buộc:

- normalize page/page size/search/filter/sort;
- page size cap;
- whitelist sort/filter phía server;
- invalid input fallback hoặc reject an toàn;
- tenant isolation;
- role read behavior cho Admin, Editor, Viewer;
- response chỉ trả dữ liệu đủ cho một page.

## Test Plan

- Unit: normalize `searchParams`, default sort, page size cap, whitelist filter
  và sort.
- Integration: query trả đúng một page, search/filter/sort kết hợp không phá
  tenant scope, invalid input không mở truy vấn ngoài whitelist.
- Platform: typecheck, lint strict, build; React Doctor nếu có TS/TSX changed.

## Fixtures

- Ít nhất hai tenant/organization.
- Mẫu ở nhiều trạng thái, loại mẫu, khách hàng/công ty, kit, và ngày nhận.
- User Admin, Editor, Viewer.

## Commands

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009A --unit 1 --integration 1 --platform 1
scripts/bin/harness-cli story verify US-009A
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Implementation proof pending.
