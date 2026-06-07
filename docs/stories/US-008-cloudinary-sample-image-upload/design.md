# Design

## Domain Model

US-008 adds sample image evidence as a provider-backed media record.

Core terms:

- Sample image: one evidence image attached to one sample.
- Media provider: Cloudinary for MVP.
- Provider locator: `storage_bucket` plus `storage_path`.
- Upload intent: a short-lived server-approved request to upload one image.

Business rules:

- A sample can have at most 10 images.
- Each image must be at most 5 MB.
- Accepted MIME types are `image/jpeg`, `image/png`, and `image/webp`.
- Admins and Editors can upload and delete images.
- Viewers can read images only.
- Server checks must not trust client-provided role, sample ownership, file
  size, content type, Cloudinary response, or public id.

## Application Flow

Upload flow:

1. User opens a sample image panel from `/dashboard/samples`.
2. Server loads the current sample and image metadata with role-aware access.
3. User selects one or more accepted image files.
4. The client sends file metadata to a server action or route handler.
5. The server validates auth, role, sample access, image count, MIME type, and
   size.
6. The server signs Cloudinary upload parameters with a deterministic folder and
   public id convention.
7. The browser uploads directly to Cloudinary.
8. The client sends the Cloudinary result metadata back to the server.
9. The server verifies expected fields and inserts `sample_images`.
10. The UI revalidates and shows the thumbnail plus success message.

Delete flow:

1. Admin or Editor requests deletion for one sample image.
2. The server checks auth, role, sample access, and image ownership.
3. The server requests Cloudinary destroy by `public_id`.
4. The server deletes or tombstones the `sample_images` row.
5. The server records audit evidence and revalidates the sample page.

## Interface Contract

Expected endpoints or server actions:

- `POST /api/uploads/cloudinary/signature`
  - Input: sample id, file name, MIME type, size bytes.
  - Output: Cloudinary upload URL and signed parameters.
  - Errors: unauthenticated, forbidden, sample not found, image limit reached,
    invalid type, file too large, provider config missing.
- `POST /api/samples/:id/images`
  - Input: Cloudinary upload result metadata.
  - Output: persisted sample image view model.
  - Errors: invalid provider result, duplicate provider id, stale upload intent,
    forbidden, sample not found.
- `DELETE /api/samples/:id/images/:imageId`
  - Output: success or recoverable provider-delete warning.

Route handlers and server actions must parse unknown input with Zod before
inner code receives it.

## Data Model

Use the existing `sample_images` table if live inspection confirms it is enough:

- `storage_bucket`: `cloudinary` or `cloudinary:<cloud_name>`;
- `storage_path`: Cloudinary `public_id`;
- `content_type`: provider-confirmed MIME type;
- `size_bytes`: provider-confirmed byte size.

The current unique key on `(sample_id, storage_path)` protects against duplicate
asset rows per sample. If implementation finds that provider delete status,
asset version, dimensions, or delivery type must be persisted, add a
forward-only migration. Do not edit applied migrations.

## UI / Platform Impact

US-008 touches dashboard UI. Implementation must invoke the Build Web Apps
plugin capability before UI/frontend work.

Expected UI:

- image section on the sample page or sample detail surface;
- upload button using shared dashboard button/form/message primitives;
- file validation feedback before upload when possible;
- upload progress and success/error states;
- thumbnail grid or compact list for existing images;
- delete action for Admin and Editor;
- read-only viewing for Viewer;
- mobile layout with no overlapping controls.

Before creating reusable UI, hooks, services, helpers, or shared logic,
implementation must invoke the code-deduplication workflow. Use existing
dashboard primitives first.

Default server-state strategy remains Server Components, server actions,
`useActionState`, and `revalidatePath`. Do not add TanStack Query unless a
concrete client-cache requirement is documented.

## Observability

Audit records must include:

- actor profile id;
- organization id;
- sample id;
- sample image id or Cloudinary `public_id`;
- action type: image uploaded or image deleted;
- file metadata: MIME type and size bytes;
- timestamp.

Logs must not include Cloudinary API secret, upload signature, raw signed
payloads, or sensitive provider responses.

## Alternatives Considered

1. Keep Cloudflare R2.
   - Better for private object storage, but heavier to configure for this MVP
     and unnecessary for non-sensitive images.

2. Add Cloudinary-specific columns before implementation.
   - Rejected for planning. The current schema can store provider locators. Add
     a migration only if implementation proves a concrete need.

3. Use unsigned Cloudinary upload preset.
   - Rejected for production. Signed upload preserves server-side intent and
     policy control.
