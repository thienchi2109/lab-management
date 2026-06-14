# Validation

## Proof Strategy

Story này phải có proof nhiều lớp vì xoá mẫu chạm dữ liệu trung tâm và audit.

- Schema proof cho cột xoá mềm, index, RLS, FK và migration history.
- Unit proof cho domain operation xoá mềm, role Admin-only, audit payload và
  idempotency/error behavior.
- Integration-style proof cho server actions, revalidation và Supabase port/RPC.
- UI proof cho xem chi tiết, sửa mẫu, multiple selection, bulk toolbar, global
  confirm xoá, role-based actions và lỗi action fail.
- Global primitive proof cho confirm dialog dựa trên shadcn `AlertDialog`.
- Data-integrity proof rằng xoá mềm không xoá `sample_results`,
  `sample_group_conclusions` hoặc `sample_images`.
- Image-contract proof rằng chức năng xoá ảnh đã upload vẫn là command riêng và
  soft-delete mẫu không gọi xoá Cloudinary asset hoặc xoá metadata ảnh.
- Platform proof bằng React Doctor, quality gate và browser verification khi có
  UI thay đổi.

## Planned Test Plan

- `lab-kit-app/lib/sample-metadata/operations.test.ts`
  - RED: `bulkSoftDeleteSampleMetadata` chưa tồn tại.
  - Green: bulk soft delete ghi audit `sample.deleted`, không lưu full metadata
    nhạy cảm, không hard delete.
  - Green: xoá mềm không gọi port xoá ảnh và không gọi
    `delete_sample_image_with_audit`.
  - Green: từ chối mẫu đã xoá mềm hoặc mẫu ngoài tenant.

- `lab-kit-app/app/dashboard/samples/actions.test.ts`
  - RED: `bulkSoftDeleteSampleMetadataAction` chưa tồn tại.
  - Green: Admin bulk soft delete thành công và revalidate `/dashboard/samples`.
  - Green: Editor/Viewer bị từ chối.
  - Green: validation lỗi empty/invalid `sampleIds[]` trả message an toàn.

- `lab-kit-app/lib/sample-grid/server.test.ts` hoặc test tương đương.
  - RED: query chưa lọc `deleted_at is null`.
  - Green: grid mặc định ẩn mẫu đã xoá mềm.

- `lab-kit-app/app/dashboard/samples/_components/sample-metadata-client.test.tsx`
  - RED: chưa có xem chi tiết, multiple selection, bulk toolbar và confirm xoá.
  - Green: view side sheet mở từ action row.
  - Green: row/header selection chỉ render cho Admin và có trạng thái
    indeterminate khi chọn một phần.
  - Green: bulk delete action chỉ render khi Admin đã chọn ít nhất một mẫu.
  - Green: global confirm dialog giữ lỗi visible khi action fail.

- `lab-kit-app/components/ui/confirm-dialog.test.tsx`
  - RED: global confirm primitive chưa tồn tại.
  - Green: render title/description, cancel, destructive confirm, pending state,
    accessible labels và không tự đóng khi action fail.

## Planned Commands

Focused commands:

```bash
cd lab-kit-app && bun run test -- \
  app/dashboard/samples/actions.test.ts \
  app/dashboard/samples/_components/sample-metadata-client.test.tsx \
  lib/sample-metadata/operations.test.ts
```

Full gates after implementation:

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
```

Harness verify command stored on the story row:

```bash
cd lab-kit-app && bun run test -- app/dashboard/samples/actions.test.ts app/dashboard/samples/_components/sample-metadata-client.test.tsx lib/sample-metadata/operations.test.ts && bun run react-doctor:diff && bun run docstring:check
```

## Current Evidence

Created on 2026-06-14 as planning packet only.

- Harness intake #41 recorded with lane `high_risk`.
- Harness story row `ISSUE-12-samples-crud-soft-delete` created.
- No app code changed.
- No migration created or applied.
- No validation commands have been run for implementation because implementation
  has not started.

## Acceptance Evidence

Pending implementation.

Before closing story:

- Record migration version and live project proof.
- Record focused RED and GREEN test output.
- Record full quality output.
- Record browser verification for Samples page actions on desktop and mobile.
- Record Harness story verify result.
- Update backlog #12 actual outcome and close it only after all required proof
  passes.
