# 0007 Cloudinary Media Upload Provider

Date: 2026-06-07

## Status

Accepted

## Context

Decision 0006 selected Cloudflare R2 for image and file storage. Before
implementing the upload story, the product owner clarified that sample evidence
images are not sensitive and optimizing for simple MVP setup is more important
than private object-storage control.

The existing `sample_images` table already stores provider location metadata
through `storage_bucket` and `storage_path`. That shape can support Cloudinary
without a large schema change if the app treats those fields as an external
media locator instead of an R2-specific bucket/path pair.

## Decision

Use Cloudinary for MVP sample evidence image upload.

US-008 should use signed Cloudinary uploads:

- the server validates auth, role, sample access, file metadata, and image
  count before issuing upload parameters;
- the client uploads directly to Cloudinary with server-signed parameters;
- the server records the uploaded asset in `sample_images`;
- `storage_bucket` stores a provider marker such as `cloudinary` or
  `cloudinary:<cloud_name>`;
- `storage_path` stores the Cloudinary `public_id`;
- production must not use unsigned upload presets;
- secrets, signatures, and raw provider responses containing credential
  material must not be logged.

This decision supersedes only the Cloudflare R2 storage-provider portion of
decision 0006. The rest of the stack remains unchanged.

## Alternatives Considered

1. Keep Cloudflare R2.
   - Better for private object storage and strict access control, but requires
     more setup for bucket configuration, CORS, S3-compatible client behavior,
     public delivery or signed reads, and object URL handling.

2. Add Cloudinary-specific columns immediately.
   - More explicit, but not required for MVP. The current locator fields can
     store Cloudinary `public_id` safely and avoid a migration unless
     implementation discovers a concrete gap.

3. Use unsigned Cloudinary upload presets.
   - Easier to wire, but rejected for production because the browser-visible
     preset becomes a policy boundary. Signed upload keeps server-side control
     over upload intent.

## Consequences

Positive:

- Faster MVP setup for non-sensitive image evidence.
- Built-in CDN delivery and thumbnail support.
- No large schema change is required for the initial story.

Tradeoffs:

- The app depends on Cloudinary media semantics instead of S3-compatible object
  storage.
- Private delivery is not the default operating model.
- Delete and replacement flows must use Cloudinary `public_id` consistently.

## Follow-Up

- US-008 must document whether a forward-only migration is needed after live
  schema inspection.
- If later stories require private image delivery, revisit provider settings or
  a storage abstraction before broadening scope.
