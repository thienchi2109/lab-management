# Validation

## Proof Strategy

Khóa bằng regression tests trước: dashboard shell không fetch metadata nặng cho
viewer; admin/editor chỉ fetch khi mở overlay. Proof phải cho thấy query
metadata form không còn đọc toàn bộ `samples` khi không cần.

## Test Plan

| Layer       | Cases                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Unit        | Layout viewer không gọi metadata; admin/editor vẫn có đường mở overlay.  |
| Integration | Loader metadata tối thiểu tenant-scoped, không đọc toàn bộ `samples`.    |
| E2E         | Admin mở form tạo mẫu; viewer không thấy CTA tạo mẫu.                    |
| Platform    | `bun run typecheck`, `bun run react-doctor:diff`.                        |
| Performance | Request waterfall sau fix không còn metadata nặng trong dashboard shell. |
| Logs/Audit  | Không yêu cầu log mới; audit tạo/sửa mẫu giữ nguyên.                     |

## Fixtures

- User admin active trong một organization.
- User editor active trong cùng organization.
- User viewer active trong cùng organization.
- Một bộ reference data tối thiểu: company, customer, sample type, kit batch,
  result group.

## Commands

```text
cd lab-kit-app && bun run test --run app/dashboard/layout.test.tsx app/dashboard/samples/_components/sample-create-overlay-bridge.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```

## Acceptance Evidence

Implemented on 2026-06-19.

- Unit proof: dashboard layout test khóa việc không fetch full metadata trong
  shell và Topbar test khóa CTA viewer.
- Integration proof: `getSampleCreateMetadata` test khóa loader chỉ đọc
  reference metadata, không query bảng `samples`, và bridge test khóa lazy load
  khi event tạo mẫu xảy ra.
- Platform proof: focused Vitest 4 files / 13 tests, `bun run typecheck`,
  `bun run lint:strict`, Prettier check trực tiếp trên file đổi,
  `bun run docstring:check`, `bun run react-doctor:diff`, và
  `scripts/bin/harness-cli story verify PERF-20260619-02` đều pass.
- E2E/browser smoke chưa chạy.
