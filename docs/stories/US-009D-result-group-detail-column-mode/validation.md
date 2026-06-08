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
- Supabase read-only proof dùng đúng namespace `mcp__supabase_lab_management`;
  live schema có `samples`, `result_templates`, `result_template_metrics`,
  `result_groups`, `result_metrics`, `sample_results`, và
  `sample_group_conclusions`. Không có migration, DDL, DML, RPC, grant, policy,
  hoặc cleanup SQL trong US-009D.
- RED proof: focused Vitest trước implementation fail đúng 5 case vì thiếu
  `resultColumnKeys`, page-scoped result summary fetch, actual whitelist và UI
  result detail/desktop column mode.
- GREEN/focused proof:
  `cd lab-kit-app && bun run test -- lib/sample-grid/query.test.ts lib/sample-grid/operations.test.ts lib/sample-grid/result-summary-server.test.ts app/dashboard/samples/_components/sample-grid-page-content.test.tsx`
  passed 4 files / 14 tests.
- Full unit/integration proof: `cd lab-kit-app && bun run test` passed 64 files
  / 205 tests.
- Platform proof:
  - `cd lab-kit-app && bun run typecheck` passed.
  - `cd lab-kit-app && bun run lint:strict` passed.
  - `cd lab-kit-app && bun run format:check` passed.
  - `cd lab-kit-app && bun run build` passed.
  - `cd lab-kit-app && bun run docstring:check` passed.
  - `cd lab-kit-app && bun run react-doctor` passed with no blocking errors.
- Browser proof with `agent-browser` on `http://127.0.0.1:3000`:
  - Login admin -> `/dashboard/samples` rendered meaningful content and no
    Next/Vite overlay.
  - Desktop screenshot:
    `/root/images/us-009d-samples-desktop.png`.
  - Desktop selected column screenshot:
    `/root/images/us-009d-samples-desktop-selected-column.png`; header included
    `PCR / PCR Realtime Ct`.
  - Mobile screenshot: `/root/images/us-009d-samples-mobile.png`; desktop table
    parent computed `display: none`, and selected metric column had no visible
    mobile cells.
- File-size proof after split:
  - `lab-kit-app/lib/sample-grid/result-summary-server.ts`: 237 lines.
  - `lab-kit-app/lib/sample-grid/result-summary-mapper.ts`: 167 lines.
  - `lab-kit-app/app/dashboard/samples/_components/sample-grid-table-section.tsx`:
    335 lines.
