# Exec Plan

## Goal

Thêm gallery ảnh báo cáo cấp tổ chức cho tab `Báo cáo`, Admin quản lý ảnh và
Viewer xem ảnh, giữ giới hạn khoảng 20 ảnh và 5 MB/ảnh.

## Scope

In scope:

- Report image domain operations.
- Supabase schema/RLS/RPC or route-backed persistence.
- Cloudinary signed upload scoped cho report images.
- Admin upload/delete UI.
- Viewer read-only gallery UI.

Out of scope:

- Ảnh minh chứng theo mẫu.
- OCR/image analysis.
- Public sharing outside authenticated dashboard.
- Changing Cloudinary provider.

## Risk Classification

Risk flags:

- Authorization.
- Data model.
- Audit/security.
- External systems.
- Public contracts.
- Frontend/UI.
- Server state.
- Existing behavior.
- Weak proof.

Hard gates:

- Supabase write requires namespace/project-ref/migration proof first.
- Cloudinary route changes must not expose secrets or weaken sample image upload
  security.

## Work Phases

1. Discovery.
   - Code Review Graph for sample image and upload routes.
   - GitNexus after narrowing.
   - Supabase live read for `sample_images`, audit and policies.
2. Design checkpoint.
   - Confirm Editor permission if needed.
   - Confirm whether "khoảng 20 ảnh" means hard max 20.
3. RED tests.
   - Viewer denied upload/delete.
   - Max 20 and 5 MB enforced.
   - Provider result validation.
4. DB migration.
   - Forward-only `report_images` table/RLS/policies/RPC if needed.
5. API/domain implementation.
   - Safe Cloudinary signature and confirm/delete flow.
6. UI implementation.
   - Build Web Apps capability before UI.
   - Code-deduplication before reusable gallery/upload abstractions.
7. Verification.
   - Focused tests, typecheck, docstring, React Doctor.
   - Browser Admin and Viewer flows.
   - Cloudinary live smoke only when safe credentials are configured.
8. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Editor should manage report images.
- Product wants more than 20 images or other MIME types.
- Existing Cloudinary helper cannot be reused without weakening sample image
  guarantees.
- Supabase namespace/project-ref is missing or different.
- Provider live smoke would expose secrets or mutate production unexpectedly.
