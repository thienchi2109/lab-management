# Validation

## Proof Strategy

US-009C hoàn tất khi mobile/tablet không bị vỡ layout và column visibility được
lưu local/session mà không mutation server.

Proof bắt buộc:

- Build Web Apps plugin capability được invoke trước UI work;
- compact/mobile mode không tràn ngang hoặc overlap;
- column visibility reload/refresh behavior đúng;
- storage fallback không làm crash UI;
- không có server mutation cho preference;
- `DashboardDataTable` vẫn là table/list surface.

## Test Plan

- Unit: storage adapter nếu có.
- UI: toggle column visibility, reload behavior, fallback khi storage lỗi.
- Browser: mobile và desktop screenshots/interaction.
- Platform: typecheck, lint strict, build, React Doctor.

## Fixtures

- Grid từ US-009B với nhiều cột cơ bản.
- Viewport mobile, tablet, desktop.

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
scripts/bin/harness-cli story update --id US-009C --unit 1 --e2e 1 --platform 1
scripts/bin/harness-cli story verify US-009C
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Implementation proof pending.
