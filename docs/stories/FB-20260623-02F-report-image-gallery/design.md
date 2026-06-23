# Design

## Domain Model

Ảnh báo cáo là media cấp tổ chức, không thuộc một mẫu cụ thể.

Proposed fields:

- `id`
- `organizationId`
- `storageBucket`
- `storagePath`
- `contentType`
- `sizeBytes`
- `displayName`
- `sortOrder`
- `createdBy`
- `createdAt`

Rules:

- Tối đa 20 ảnh báo cáo mỗi tổ chức.
- Mỗi ảnh tối đa 5 MB.
- MIME type theo chính sách ảnh hiện có: JPEG, PNG, WEBP nếu không có yêu cầu
  mới.
- Admin được tạo/xóa; Viewer chỉ đọc.

## Application Flow

1. `/dashboard/analytics` đọc danh sách ảnh báo cáo theo organization.
2. Admin chọn ảnh, server cấp signed Cloudinary upload parameters với folder
   riêng cho report images.
3. Browser upload lên Cloudinary.
4. Server confirm metadata, kiểm tra limit/duplicate và ghi record/audit.
5. Admin xóa ảnh: server xóa Cloudinary asset trước, sau đó xóa/tombstone record
   theo policy được chọn.
6. Viewer chỉ tải danh sách và xem ảnh.

## Interface Contract

Possible endpoints:

- `GET /api/analytics/report-images`
- `POST /api/analytics/report-images`
- `DELETE /api/analytics/report-images/:imageId`
- Có thể tái dùng `/api/uploads/cloudinary/signature` nếu request có scope an
  toàn cho report image; nếu không, tạo route signature riêng.

Errors:

- 401 unauthenticated.
- 403 Viewer write/delete denied.
- 400 unsupported type, oversize, invalid provider result.
- 409 max 20 images or duplicate public id.
- 500 public fallback.

## Data Model

Không dùng `sample_images` vì bảng đó bắt buộc `sample_id` và domain hiện tại
là ảnh minh chứng của mẫu. Likely add:

- `report_images`
- RLS enabled.
- indexes by `organization_id`, `created_at` or `sort_order`.
- audit events for create/delete.

Before any Supabase write, prove namespace `mcp__supabase_lab_management`,
project-ref `tuuqgpzgollcerqqszjr`, migration history and target
table/function/policy/grant.

## UI / Platform Impact

Add a report image section in `/dashboard/analytics`:

- Viewer: read-only gallery/preview.
- Admin: import/upload and delete controls.
- Mobile: gallery must not cause horizontal overflow.

For UI/frontend work:

- Invoke Build Web Apps plugin capability before implementation.
- Invoke `code-deduplication` before reusable gallery/upload helper.
- Reuse existing Cloudinary helper patterns where contracts match.
- Do not add TanStack Query unless a concrete upload progress/cache need is
  documented.

## Observability

- Audit create/delete with field-name-only payload.
- Never log Cloudinary secrets, signatures or raw provider response.
- Evidence must state whether live Cloudinary smoke was run or safely skipped.

## Alternatives Considered

1. Reuse `sample_images` with a fake sample.
   - Bị loại vì làm bẩn domain mẫu và phá tenant/sample access rules.
2. Store image bytes in Supabase Postgres.
   - Bị loại vì app đã chọn Cloudinary cho media.
3. Let Admin paste external image URLs.
   - Bị loại vì khó kiểm soát size, lifecycle và broken links.
