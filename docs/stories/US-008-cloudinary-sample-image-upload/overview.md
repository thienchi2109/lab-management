# US-008 - Cloudinary Sample Image Upload

**Lane:** high-risk  
**Phase:** 7  
**Status:** implemented
**Affects:** sample image evidence, Cloudinary integration, dashboard sample UI,
audit trail, media delivery

## Current Behavior

US-006 created sample management and US-007 added result entry, but the app has
no user-facing way to upload or view sample evidence images. The initial product
contract named Cloudflare R2, but decision 0007 changes the MVP media provider
to Cloudinary because the images are not sensitive and Cloudinary reduces setup
work for the MVP.

The live schema already has `sample_images` with `storage_bucket`,
`storage_path`, `content_type`, and `size_bytes`. US-008 should first try to use
that table as provider-agnostic media metadata:

- `storage_bucket`: `cloudinary` or `cloudinary:<cloud_name>`;
- `storage_path`: Cloudinary `public_id`;
- `content_type`: accepted image MIME type;
- `size_bytes`: provider-reported byte size.

## Target Behavior

Admins and Editors can upload evidence images for a sample from the dashboard.
Viewers can view existing evidence images but cannot upload or delete them.

The flow should:

- enforce max 20 images per sample;
- enforce max 5 MB per image;
- accept only `jpeg`, `png`, and `webp`;
- request signed Cloudinary upload parameters from the server;
- upload directly from the browser to Cloudinary;
- confirm the Cloudinary asset metadata with the server;
- insert a `sample_images` row for the uploaded asset;
- show uploaded thumbnails on the sample surface;
- allow Admins and Editors to delete image records and request Cloudinary asset
  deletion;
- record audit evidence for add/delete actions.

Production must not use unsigned Cloudinary upload presets.

## Affected Users

- Admin: uploads, views, and deletes evidence images for sample review.
- Editor: uploads, views, and deletes evidence images during lab work.
- Viewer: views evidence images in read-only mode.
- Operator/reviewer: verifies provider setup, audit events, and validation
  evidence.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/tech-stack.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/ARCHITECTURE.md`
- `docs/decisions/0007-cloudinary-media-upload-provider.md`

## Non-Goals

- PDF, CSV, or non-image attachments.
- Private image delivery or signed read URLs.
- Image annotation, OCR, or approval workflow.
- Broad sample detail redesign.
- Exporting images.
- Replacing the existing `sample_images` table unless implementation proves a
  concrete schema gap.
