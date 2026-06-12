# Validation

## Proof Strategy

- Unit/integration: `listSampleGridPage` dùng result column options ổn định từ
  port config thay vì rows page hiện tại.
- UI rendering: Sample Grid vẫn render controls và selected desktop columns từ
  page contract hiện có.
- Platform: chạy React Doctor và quality gates theo repo rules.

## Expected Commands

```bash
cd lab-kit-app
bun run test -- lib/sample-grid/operations.test.ts app/dashboard/samples/_components/sample-grid-page-content.test.tsx
bun run typecheck
bun run react-doctor
```

## Evidence

- RED proof:
  `cd lab-kit-app && bun run test -- lib/sample-grid/operations.test.ts` fail
  đúng 1 test `keeps result column options stable when page result summaries
differ` vì options vẫn khác nhau theo result summaries của từng page.
- GREEN/focused proof:
  `cd lab-kit-app && bun run test -- lib/sample-grid/operations.test.ts lib/sample-grid/result-column-options-server.test.ts app/dashboard/samples/_components/sample-grid-page-content.test.tsx`
  pass 3 files / 15 tests.
- Full unit proof: `cd lab-kit-app && bun run test` pass 88 files / 327 tests.
- Platform proof:
  - `cd lab-kit-app && bun run typecheck` pass.
  - `cd lab-kit-app && bun run lint:strict` pass.
  - `cd lab-kit-app && bun run format:check` pass after Prettier on touched
    test files.
  - `cd lab-kit-app && bun run react-doctor` pass theo ngưỡng error; tool báo
    1 warning không chặn.
  - `cd lab-kit-app && bun run docstring:check` pass.
  - `cd lab-kit-app && bun run build` pass.
- File-size proof:
  - `lab-kit-app/lib/sample-grid/server.ts`: 335 dòng.
  - `lab-kit-app/lib/sample-grid/result-column-options-server.ts`: 180 dòng.
  - Không file code/story nào vượt giới hạn 350 dòng.
- Supabase proof: đọc live DB bằng namespace `mcp__supabase_lab_management`;
  schema hiện có đủ `result_templates`, `result_template_metrics`,
  `result_metrics`, `result_groups`, `samples`, `sample_results` và
  `sample_group_conclusions`; không cần migration hoặc write operation.
