# Validation

## Proof Strategy

US-009 parent chỉ hoàn tất khi các slice bắt buộc đã có proof riêng và không còn
phần Phase 8 bắt buộc nào bị treo trong parent tracker.

Proof bắt buộc:

- US-009A verify query contract, pagination, whitelist filter/sort, tenant scope
  và role read behavior.
- US-009B verify bảng mẫu chính dùng `DashboardDataTable`, URL state, states cơ
  bản, và row actions.
- US-009C verify compact/mobile mode và column visibility local/session.
- US-009D verify group detail và desktop result column mode.
- US-009E được verify nếu mở; nếu không mở, parent trace phải ghi lý do không
  cần DB/RPC/index.

## Test Plan

Parent tracker không có runtime tests riêng. Mỗi slice phải chạy test plan trong
packet của slice đó. Parent closeout kiểm tra:

- tất cả slice bắt buộc có durable story flags phù hợp;
- `scripts/bin/harness-cli story verify <slice>` pass cho từng slice;
- backlog vẫn phản ánh đúng trạng thái Phase 8;
- không có slice nào bị gộp ngược vào một PR quá lớn.

## Fixtures

Xem fixture từng slice. Parent tracker chỉ cần bằng chứng Harness và link đến
validation evidence của các slice.

## Commands

Khi các slice bắt buộc hoàn tất:

```bash
scripts/bin/harness-cli story verify US-009A
scripts/bin/harness-cli story verify US-009B
scripts/bin/harness-cli story verify US-009C
scripts/bin/harness-cli story verify US-009D
```

Nếu US-009E được mở:

```bash
scripts/bin/harness-cli story verify US-009E
```

Sau đó:

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
- Parent story packet created before implementation.
- Parent split completed into US-009A, US-009B, US-009C, US-009D, and conditional
  US-009E before runtime implementation.
- Implementation proof pending per slice.
