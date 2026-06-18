# Validation

## Proof Strategy

Chứng minh bằng regression tests và browser proof rằng workflow xem kết quả giữ
nguyên context danh sách mẫu, trong khi route kết quả trực tiếp vẫn dùng được.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit/Component | Trigger `Xem kết quả` mở viewer, tab/segmented controls render đúng, close không reset state cục bộ. |
| Integration | Danh sách mẫu giữ filter/search/sort/page sau khi mở và đóng viewer; deep link route kết quả vẫn hoạt động. |
| Behavior | Save result vẫn gọi request hiện có; Viewer vẫn read-only. |
| Browser | Desktop/mobile không overflow; focus trap, close button, Escape/back behavior hoạt động dự đoán được. |
| Platform | Typecheck, React Doctor diff, docstring check nếu có named export mới. |

## Acceptance Evidence

- RED proof: `cd lab-kit-app && bun run test --
  app/dashboard/samples/_components/sample-result-viewer-context.test.tsx`
  failed before implementation because no result viewer dialog existed after
  clicking `Xem kết quả & ảnh`.
- Focused GREEN proof: `cd lab-kit-app && bun run test --
  app/dashboard/samples/_components/sample-result-viewer-link.test.tsx
  app/dashboard/samples/_components/sample-result-viewer-context.test.tsx
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx
  app/dashboard/samples/[sampleId]/results/_components/sample-results-client.test.tsx
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx
  app/api/samples/[sampleId]/results/route.test.ts
  app/api/samples/[sampleId]/images/route.test.ts` passed: 7 files, 31 tests.
- Platform proof: `cd lab-kit-app && bun run typecheck` passed;
  `bun run react-doctor:diff` passed with no issues after fixing the scoped
  React Doctor warning; `bun run docstring:check` passed. Scoped Prettier check
  for changed files passed. Full `bun run format:check` remains blocked by
  pre-existing formatting drift in
  `app/dashboard/samples/_components/sample-filter-combobox.test.tsx`, outside
  FB-08 scope.
- Browser proof with `agent-browser`, admin / `123456@`: login succeeded and
  `/dashboard/samples?search=T6&page=1&pageSize=25` rendered. Opening the first
  result viewer kept URL `/dashboard/samples?search=T6&page=1&pageSize=25`,
  rendered `Thông tin mẫu`, `Kết quả`, `Ảnh`, result inputs and evidence images;
  closing the admin viewer through the fail-safe confirmation left
  `dialogCount=0`, search value `T6`, and the same URL.
- Browser responsive proof: desktop viewport 1280 had `docWidth=1265`; mobile
  viewport 390 had `docWidth=375` for both the list and open viewer, so no
  horizontal overflow was observed in this proof.
- Deep link/fallback preserved: result action anchors still keep
  `/dashboard/samples/:sampleId/results` as `href`; modified-click regression
  confirms the overlay does not intercept Ctrl-click.
- Route result page remains in place and existing route/API focused tests pass;
  save result behavior, read-only viewer behavior, and upload/delete image code
  were not changed.
