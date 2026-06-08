# Validation

## Proof Strategy

US-009D hoàn tất khi người dùng mở được group detail và desktop selected result
columns mà không phá result-engine semantics hoặc mobile layout.

Proof bắt buộc:

- group/metric keys whitelist;
- result data chỉ fetch cho page hiện tại hoặc sample hiện tại;
- group detail open/close đúng;
- desktop chọn nhóm/chỉ tiêu để bung cột;
- mobile không render ma trận rộng;
- Viewer chỉ đọc, Admin/Editor đi qua flow hiện có;
- không đổi `KQ_CHUNG`.

## Test Plan

- Unit/integration: whitelist group/metric keys, result detail query, role
  read/edit behavior.
- UI: group detail open/close, desktop selected columns, mobile no-wide-matrix.
- Platform: typecheck, lint strict, build, React Doctor.

## Fixtures

- Mẫu có nhiều nhóm kết quả và nhiều chỉ tiêu.
- Mẫu chưa có kết quả.
- User Admin, Editor, Viewer.
- Viewport mobile và desktop.

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
scripts/bin/harness-cli story update --id US-009D --unit 1 --integration 1 --e2e 1 --platform 1
scripts/bin/harness-cli story verify US-009D
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Implementation proof pending.
