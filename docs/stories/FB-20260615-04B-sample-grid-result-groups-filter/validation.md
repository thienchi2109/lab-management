# Validation

## Proof Strategy

04B chỉ hoàn tất khi parser, operation contract, Supabase adapter và UI URL
state cùng chứng minh filter nhiều nhóm chỉ tiêu chạy theo server-side
pagination và không phá sample grid hiện có.

## Test Plan

- Parser: `parseSampleGridQuery` nhận nhiều `resultGroupIds`, loại giá trị không
  hợp lệ, dedupe, giới hạn số lượng và không nhận key ngoài whitelist.
- Operations: `listSampleGridPage` truyền filter xuống port cùng
  `organizationId`, giữ `limit`, `offset`, result column options và role
  capabilities.
- Server adapter: Supabase query luôn ràng buộc tenant, lọc bằng
  `sample_result_groups`, không nhân bản row/count khi một mẫu khớp nhiều nhóm.
- UI: `SampleGridPageContent` render filter nhóm, giữ selected values trong URL,
  reset `page=1` khi submit, giữ `resultColumns`, và có action xóa filter.
- Regression: các filter cũ (`search`, `status`, `billingStatus`, sort,
  pagination, result column mode) vẫn giữ behavior.

## Commands

```bash
cd lab-kit-app
bun run test --run lib/sample-grid app/dashboard/samples/_components/sample-grid-page-content.test.tsx
bun run typecheck
bun run react-doctor:diff
```

Nếu implementation chạm source TS/TSX đã stage:

```bash
cd lab-kit-app
bun run react-doctor:staged
bun run docstring:check
```

## Browser / Manual Smoke

Sau khi 04D đã có live schema:

1. Mở `/dashboard/samples` ở desktop.
2. Chọn hai nhóm chỉ tiêu, áp dụng filter.
3. Xác nhận URL có hai `resultGroupIds`, row count giảm theo nhóm và pagination
   href giữ filter.
4. Xóa một nhóm hoặc xóa toàn bộ filter, xác nhận URL và rows cập nhật.
5. Lặp lại ở mobile width, xác nhận form không overflow ngang và CTA vẫn thao
   tác được.

## Acceptance Evidence

- Focused tests pass và ghi số file/test trong Harness evidence.
- Typecheck và React Doctor diff pass.
- Nếu browser/manual smoke bị skip, evidence phải ghi rõ lý do và phần proof
  thay thế.
