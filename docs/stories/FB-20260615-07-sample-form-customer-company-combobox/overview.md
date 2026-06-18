# FB-20260615-07 Customer And Company Comboboxes In Sample Form

## Status

planned

## Lane

normal

## Product Contract

Dialog tạo mẫu và cập nhật mẫu phải cho phép tìm nhanh `Khách hàng` và `Công ty`
bằng combobox có thể gõ lọc, trong khi vẫn gửi đúng ID hiện có vào server action.
Thay đổi chỉ áp dụng cho form tạo/cập nhật mẫu, không đổi contract dữ liệu mẫu,
không đổi bộ lọc danh sách mẫu và không đổi rule sinh mã mẫu.

## Relevant Product Docs

- `docs/product/samples.md`
- `docs/stories/FB-20260615-02-sample-search-filters/overview.md`
- `docs/stories/FB-20260615-03-sample-mobile-card-simplification/overview.md`
- `docs/stories/FB-20260615-04E-sample-create-edit-form-result-groups/overview.md`

## Acceptance Criteria

- Trường `Khách hàng` trong dialog `Tạo mẫu xét nghiệm` và side sheet cập nhật mẫu
  là combobox có thể gõ để lọc danh sách khách hàng.
- Trường `Công ty` trong dialog `Tạo mẫu xét nghiệm` và side sheet cập nhật mẫu là
  combobox có thể gõ để lọc danh sách công ty.
- Khi chọn một giá trị khớp duy nhất, form submit đúng `customerId` hoặc
  `companyId`; khi nhập giá trị không khớp hoặc trùng nhãn, validation vẫn
  fail-closed thay vì chọn nhầm ID.
- Trạng thái mặc định khi sửa mẫu hiển thị đúng tên khách hàng và công ty hiện
  tại, nhưng không làm mất giá trị ID khi người dùng không chỉnh sửa.
- Mobile giữ touch target tối thiểu 44px, label rõ, input không bị tràn trong
  dialog hoặc side sheet.

## Design Notes

- Commands: form tạo mẫu và cập nhật mẫu trong
  `lab-kit-app/app/dashboard/samples/_components/sample-metadata-dialogs.tsx`.
- Queries: danh sách `customers` và `companies` đã được truyền sẵn vào dialog từ
  server-side page data.
- API: giữ nguyên server action metadata hiện có; chỉ đổi UI gửi field ID đúng
  contract.
- Tables: không đổi schema và không thêm migration.
- Domain rules: combobox không được cho phép tạo khách hàng hoặc công ty mới
  inline.
- UI surfaces: `Tạo mẫu xét nghiệm` dialog và `Cập nhật <mã mẫu>` side sheet.

## Frontend, Reuse, And Caching Constraints

- Trước implementation, dùng Code Review Graph để xác định blast radius của form
  tạo/cập nhật mẫu.
- Trước khi tạo reusable combobox mới, chạy code-deduplication và kiểm tra pattern
  hiện có từ `SampleFilterCombobox`.
- Ưu tiên tách shared form combobox nếu tránh được nhân đôi logic chọn ID theo
  label duy nhất; không vượt giới hạn 350 dòng/file.
- Không thêm client cache mới. Giữ dữ liệu options theo luồng Server Components,
  server actions, `useActionState`, và `revalidatePath` hiện có.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id <id> --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Focused tests for create/edit form combobox rendering, default values, unique-label ID submit, and duplicate/free-text fail-closed behavior. |
| Integration | Existing sample metadata action tests continue to pass with unchanged field contracts. |
| E2E | Manual/browser QA on mobile viewport for `Tạo mẫu xét nghiệm` and update side sheet. |
| Platform | `bun run typecheck`, `bun run react-doctor:diff`, and `bun run docstring:check`. |
| Release | Harness story verify records evidence before implementation is marked done. |

## Harness Delta

Created as a follow-up because FB-20260615-03 covered the mobile sample card list,
not the create/edit sample metadata form controls.

## Evidence

- 2026-06-18: Root-cause check found `sample-metadata-dialogs.tsx` still uses
  `SelectField` for `Khách hàng` and `Công ty`; existing combobox work was scoped
  to sample filters.
