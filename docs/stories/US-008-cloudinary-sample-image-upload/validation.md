# Validation

## Proof Strategy

US-008 needs layered proof because it touches an external media provider,
sample evidence records, role-gated writes, and dashboard UI.

Proof must show:

- Cloudinary config is parsed server-side and secrets never reach client code.
- Upload signatures are generated only after auth, role, sample access, file
  metadata, and image-count checks.
- Production does not rely on unsigned upload presets.
- `sample_images` can represent Cloudinary assets without a large migration, or
  a forward-only migration is added with live proof.
- Admin and Editor can upload/delete; Viewer can view only.
- Max 10 images per sample is enforced.
- Max 5 MB and `jpeg/png/webp` rules are enforced.
- Audit evidence exists for upload and delete.
- UI works on desktop and mobile.

If implementation touches UI/frontend work, proof must show:

- the Build Web Apps plugin capability was invoked before UI/frontend changes;
- suitable shared dashboard components were reused;
- code-deduplication was invoked before reusable components, hooks, services,
  or helpers were added;
- TanStack Query was not added unless a concrete client-cache need was
  documented.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Env parsing; upload metadata schema; accepted/rejected MIME types; max-size rule; image-count rule; Cloudinary signature parameter builder; provider-result parser; delete payload parser. |
| Integration | Unauthenticated/forbidden upload intent; Admin/Editor upload intent; Viewer denied upload/delete; insert `sample_images` from verified provider result; duplicate `public_id`; delete calls provider cleanup and removes or tombstones metadata; audit event payloads. |
| E2E | Login, open sample image surface, upload valid image, see thumbnail, reject invalid file, delete image, verify Viewer read-only mode. |
| Platform | Desktop and mobile layout; upload progress; empty state; provider error state; React Doctor through package scripts. |
| Provider | Cloudinary signed upload smoke when safe credentials are configured; otherwise mocked provider tests plus documented skipped live smoke. |
| Logs/Audit | No API secret, upload signature, raw signed payload, or credential-bearing provider response appears in logs; upload/delete audit rows include actor, organization, sample, image, file metadata, and action. |

## Fixtures

Use deterministic fixtures:

- one organization;
- Admin, Editor, and Viewer profiles;
- one sample with zero images;
- one sample with nine images;
- one sample with ten images;
- valid JPEG/PNG/WebP fixtures under 5 MB;
- invalid MIME fixture;
- oversized fixture metadata;
- mocked Cloudinary upload and delete responses.

Do not store real Cloudinary secrets, session tokens, service keys, or user
credentials in story files, tests, screenshots, or traces.

## Commands

Expected commands after implementation:

```bash
scripts/bin/harness-cli query matrix
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-008
```

React Doctor must run through package scripts only:

```bash
cd lab-kit-app && bun run react-doctor
```

## Acceptance Evidence

Planned. Add results after implementation.
