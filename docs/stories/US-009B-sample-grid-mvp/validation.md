# Validation

## Proof Strategy

US-009B hoàn tất khi bảng mẫu chính MVP render được từ contract US-009A, có URL
state, states cơ bản, và row actions đúng quyền.

Proof bắt buộc:

- `DashboardDataTable` được dùng hoặc ngoại lệ được duyệt;
- Build Web Apps plugin capability được invoke trước UI work;
- `code-deduplication` được invoke trước reusable UI/hooks/helpers nếu có;
- Viewer chỉ thấy hành động read-only;
- Admin/Editor dùng hành động hiện có;
- filter/search/sort/page cập nhật URL state;
- loading, empty, error, permission-denied states rõ ràng.

## Test Plan

- Integration/UI: render table từ fixture, filter reset, URL state, sort/page
  interaction, Viewer read-only actions.
- Browser: desktop viewport không overlap, không tràn ngang bất thường.
- Platform: typecheck, lint strict, build, React Doctor.

## Fixtures

- Dữ liệu query từ US-009A.
- User Admin, Editor, Viewer.
- Mẫu có và không có ảnh/kết quả để row summary không vỡ layout.

## Commands

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
bun run react-doctor
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009B --integration 1 --e2e 1 --platform 1
scripts/bin/harness-cli story verify US-009B
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Implementation proof pending.
