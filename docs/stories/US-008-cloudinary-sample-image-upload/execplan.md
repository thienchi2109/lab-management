# Exec Plan

## Goal

Plan and later implement sample evidence image upload through Cloudinary with
minimal schema churn, role-gated writes, audit proof, shared dashboard UI, and
full Harness validation.

## Scope

In scope:

- Harness story packet and durable Harness rows.
- Product docs and decision record that replace R2 with Cloudinary for MVP
  media upload.
- Cloudinary environment contract.
- Signed upload parameter generation.
- Direct browser upload to Cloudinary.
- Server confirmation and persistence in `sample_images`.
- Image thumbnail/view surface on sample UI.
- Delete flow for persisted image records and Cloudinary assets.
- Role-based behavior for Admin, Editor, and Viewer.
- Audit events for upload and delete.
- Unit, integration, browser, platform, and provider-configuration proof.

Out of scope:

- Non-image attachments.
- Private delivery or signed read URLs.
- OCR, image annotation, approval workflow, and export.
- Large schema rewrite for media metadata.
- Implementing the story during packet creation.

## Risk Classification

Lane: high-risk.

Risk flags:

- External systems: Cloudinary.
- Authorization: role-gated upload/delete and read-only Viewer behavior.
- Audit/security: image evidence records and secret-safe logging.
- Public contracts: upload API changes from R2 presign to Cloudinary signature.
- Data model: provider locator semantics in `sample_images`.
- Frontend/UI: upload, preview, progress, delete, and responsive states.
- Weak proof: no existing upload implementation.

Hard gates:

- External provider behavior.
- Authorization.
- Audit/security.

Human approval is required before implementation starts if provider behavior,
schema migration direction, or private delivery expectations become ambiguous.

## Work Phases

1. Discovery.
   - Use context-mode first where available and `rtk` fallback for concise
     shell commands.
   - Read product docs, decision 0007, existing sample CRUD/result entry flows,
     Cloudinary official docs, and the live `sample_images` schema.
   - Read Code Review Graph before code edits.

2. Provider and schema proof.
   - Confirm required env vars: `CLOUDINARY_CLOUD_NAME`,
     `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
   - Inspect live Supabase `sample_images` constraints, RLS, grants, and
     indexes.
   - Decide whether existing `storage_bucket/storage_path` fields are enough.
   - If not enough, create a forward-only migration.

3. TDD planning.
   - Add failing tests for upload metadata validation, role failures, image
     limit, MIME type, size limit, Cloudinary signature parameters, provider
     response validation, duplicate `public_id`, and delete authorization.
   - Add UI tests for empty state, client validation, progress, success,
     provider failure, and read-only Viewer behavior.

4. Frontend, reuse, and caching checkpoint.
   - Invoke the Build Web Apps plugin capability before UI work.
   - Invoke code-deduplication before adding reusable helpers or components.
   - Reuse shared dashboard primitives for buttons, dialogs, fields, messages,
     layout, and destructive confirmations.
   - Keep Server Components, server actions, `useActionState`, and
     `revalidatePath` as the default server-state model.

5. Implementation.
   - Add typed Cloudinary config/env parsing.
   - Add server-side signing and provider metadata validation.
   - Add sample image queries/actions/routes.
   - Add image upload UI to the sample surface.
   - Add audit events.
   - Add deletion flow and provider cleanup handling.

6. Verification.
   - Run focused tests first.
   - Run Supabase schema validation if schema proof or migration changes.
   - Run full test suite and quality gate.
   - Run React Doctor through package scripts.
   - Run browser verification for desktop and mobile sample image workflows.
   - Run provider smoke only when safe Cloudinary credentials are configured.

7. Harness update.
   - Update validation evidence.
   - Update durable story status and proof flags.
   - Run `scripts/bin/harness-cli story verify US-008`.
   - Record trace with outcome, proof, and friction.

## Stop Conditions

Pause before implementation if:

- Cloudinary account settings require unsigned upload for production.
- Existing `sample_images` columns cannot safely represent Cloudinary assets.
- Private delivery becomes a requirement.
- Delete semantics would leave unacceptable orphaned assets.
- UI work would proceed without Build Web Apps plugin capability.
- Reusable UI or media helpers would be created without code-deduplication.
- Validation requirements need to be weakened.
