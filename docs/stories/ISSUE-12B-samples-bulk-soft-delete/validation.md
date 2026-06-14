# Validation

## Proof Strategy

- Schema proof cho cột xoá mềm, index, migration history và RLS/app auth.
- Unit proof cho bulk soft delete operation.
- Server action proof cho Admin-only và validation `sampleIds[]`.
- UI proof cho multiple selection, bulk toolbar và global confirm.
- Data-integrity proof rằng soft delete không xoá `sample_results`,
  `sample_group_conclusions` hoặc `sample_images`.
- Image-contract proof rằng soft delete không gọi xoá Cloudinary asset hoặc
  `delete_sample_image_with_audit`.

## Planned Test Plan

- `lab-kit-app/lib/sample-metadata/operations.test.ts`
  - RED: `bulkSoftDeleteSampleMetadata` chưa tồn tại.
  - Green: bulk soft delete ghi audit `sample.deleted`.
  - Green: không hard delete và không gọi xoá ảnh.

- `lab-kit-app/app/dashboard/samples/actions.test.ts`
  - RED: `bulkSoftDeleteSampleMetadataAction` chưa tồn tại.
  - Green: Admin xoá mềm hàng loạt thành công.
  - Green: Editor/Viewer bị từ chối.
  - Green: empty/invalid `sampleIds[]` trả message an toàn.

- `lab-kit-app/app/dashboard/samples/_components/sample-metadata-client.test.tsx`
  - RED: chưa có multiple selection và bulk toolbar.
  - Green: Admin thấy row/header checkbox.
  - Green: header checkbox có indeterminate state.
  - Green: bulk action chỉ render khi có selection.

- `lab-kit-app/components/ui/confirm-dialog.test.tsx`
  - RED: global confirm primitive chưa tồn tại.
  - Green: render title, description, cancel, destructive confirm, pending
    state, accessible labels và không tự đóng khi action fail.

## Planned Commands

```bash
cd lab-kit-app && bun run test -- \
  app/dashboard/samples/actions.test.ts \
  app/dashboard/samples/_components/sample-metadata-client.test.tsx \
  components/ui/confirm-dialog.test.tsx \
  lib/sample-metadata/operations.test.ts
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
```

## Current Evidence

Created on 2026-06-14 after splitting the retired combined story.

- Harness intake #43 recorded with lane `high_risk`.
- Harness story row `ISSUE-12B-samples-bulk-soft-delete` created.
- No app code changed.
- No migration created or applied.

## Acceptance Evidence

Pending implementation.
