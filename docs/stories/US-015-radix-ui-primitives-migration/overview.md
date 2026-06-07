# US-015 Chuyển UI primitive sang Radix

## Status

Implemented.

## Lane

Normal.

## Product Contract

Không thay đổi hành vi nghiệp vụ. Các component UI dùng chung `Badge`,
`Button`, `Input`, `Select`, và `Tooltip` chuyển từ Base UI sang Radix trong khi
giữ API dashboard hiện có ở mức call-site nhiều nhất có thể.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`
- `docs/CONTEXT_RULES.md`
- `docs/TEST_MATRIX.md`

## Acceptance Criteria

- `components.json` dùng preset Radix Nova thay cho Base Nova.
- Không còn import `@base-ui/react` trong source app.
- `Button` và `Badge` hỗ trợ `asChild` theo Radix `Slot`.
- Các link đang dùng `render`/`nativeButton={false}` được chuyển sang
  `asChild` và không tạo HTML lồng sai.
- `SelectField` vẫn render hidden input đúng `name`/`value`, giữ trạng thái lỗi
  field-level, và dùng Radix `SelectValue` tương thích.
- `TooltipProvider` dùng contract Radix `delayDuration`.

## Design Notes

- Migration đi theo hướng thủ công có kiểm soát, không chạy reinstall toàn bộ
  shadcn để tránh overwrite style đã tách ra `button-variants.ts` và
  `badge-variants.ts`.
- `button-variants.ts` và `badge-variants.ts` tiếp tục là nguồn style tập trung
  cho toàn repo.
- `AppSelect` là boundary duy nhất của `SelectField`, nên sửa tương thích Radix
  tại đây thay vì sửa từng form.

## Frontend, Reuse, And Caching Constraints

- Dùng lại shared UI component hiện có, không tạo component song song.
- Không thêm chiến lược cache hoặc client data fetching mới.
- Không mở rộng phạm vi sang redesign dashboard.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `bun test components/dashboard/form-fields.test.tsx components/ui/radix-primitives.test.tsx` |
| Integration | `bun run typecheck` |
| E2E | Không áp dụng cho migration primitive scoped. |
| Platform | `bun run react-doctor` |
| Release | `bun run quality` nếu thời gian cho phép. |

## Harness Delta

Không thay đổi Harness.

## Evidence

- `bun run test components/ui/radix-primitives.test.tsx components/dashboard/form-fields.test.tsx`: 2 test files, 8 tests passed.
- `bun run test`: 43 test files, 132 tests passed.
- `bun run typecheck`: passed.
- `bun run lint:strict`: passed.
- `bun run format:check`: passed after formatting two call-site files.
- `bun run react-doctor`: no issues found.
- `bun run react-doctor:verbose`: no issues found; script emitted only the existing `--fail-on` deprecation warning.
- `bun run build`: Next.js production build passed.
- `bun run quality`: passed.
- `bun run docstring:check`: passed.
- `scripts/setup-git-hooks.sh`: enabled `core.hooksPath=.githooks`.
- `rg "@base-ui/react|render=|nativeButton=|base-nova"` over app source, config, package files, and lockfile: no matches.
- `npx shadcn@latest info --json`: `style` is `radix-nova`, `base` is `radix`.
- GitNexus `detect_changes(scope=all)`: 13 changed files, risk low, no affected processes.
- `code-review-graph update --repo /root/lab-management`: incremental update completed.
