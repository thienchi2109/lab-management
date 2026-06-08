# Validation

## Proof Strategy

US-009 chỉ hoàn tất khi chứng minh được bảng dữ liệu chính hoạt động đúng trên
server, UI, role, responsive layout, và Harness durable layer.

Proof bắt buộc:

- query không tải toàn bộ dataset khi chưa filter/paginate;
- page/page size/search/filter/sort được normalize và whitelist phía server;
- tenant isolation và role read behavior được kiểm tra;
- mobile không bung toàn bộ cột kết quả;
- desktop có thể chọn nhóm/chỉ tiêu để bung cột;
- group detail mở được chi tiết kết quả của từng mẫu;
- column visibility được lưu local/session và không mutation server;
- Build Web Apps plugin capability được invoke trước UI/frontend work;
- `code-deduplication` được invoke trước reusable helpers/components;
- table/list surface dùng `DashboardDataTable` hoặc ghi rõ ngoại lệ được duyệt;
- không thêm TanStack Query nếu không có client-cache requirement cụ thể.

## Test Plan

- Unit:
  - search param normalization;
  - page size cap và default sort;
  - filter/sort/column whitelist;
  - date/status/sample type/kit/result group filter parsing;
  - column visibility persistence adapter nếu có helper riêng.

- Integration:
  - sample grid query trả đúng một trang dữ liệu;
  - search/filter/sort kết hợp không phá tenant scope;
  - invalid filter/sort bị reject hoặc fallback an toàn;
  - Viewer chỉ thấy hành động read-only;
  - Admin/Editor row actions nối đến flow hiện có;
  - group detail trả đúng nhóm/chỉ tiêu cho sample hiện tại.

- UI:
  - empty, loading, error, permission-denied states;
  - filter reset và URL state;
  - desktop column mode;
  - mobile compact mode không overlap và không tràn ngang;
  - group detail open/close;
  - column visibility reload/refresh behavior.

- Platform:
  - `bun run typecheck`;
  - `bun run lint:strict`;
  - `bun run build`;
  - `bun run react-doctor`;
  - `bun run docstring:check` khi có changed named exports;
  - browser verification desktop/mobile.

## Fixtures

- Ít nhất hai tenant/organization để chứng minh tenant isolation.
- Nhiều mẫu với trạng thái khác nhau, ngày nhận khác nhau, khách hàng/công ty
  khác nhau, loại mẫu khác nhau, kit khác nhau.
- Mẫu có và không có kết quả động.
- Mẫu có nhiều nhóm kết quả và nhiều chỉ tiêu để kiểm tra desktop column mode.
- Mẫu có và không có ảnh để kiểm tra summary ảnh sau US-008.
- User Admin, Editor, Viewer.

## Commands

Khi implementation hoàn tất, chạy tối thiểu:

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
bun run react-doctor
```

Nếu có changed named exports trong TS/TSX:

```bash
cd lab-kit-app
bun run docstring:check
```

Sau khi cập nhật bằng chứng:

```bash
scripts/bin/harness-cli story update --id US-009 --unit 1 --integration 1 --e2e 1 --platform 1
scripts/bin/harness-cli story verify US-009
```

## Acceptance Evidence

- Intake source checked: `original_specs/SPEC-001.md`, Phase 8.
- Product docs checked: `docs/product/overview.md`, `docs/product/ui-contract.md`,
  `docs/product/tech-stack.md`, `docs/product/api-contract.md`,
  `docs/product/data-model.md`, `docs/product/roles-permissions.md`, and
  `docs/product/result-engine.md`.
- Previous story boundaries checked: US-006 metadata CRUD, US-007 dynamic result
  entry, and US-008 Cloudinary sample image upload.
- Story packet created before implementation.
- Implementation proof pending.
