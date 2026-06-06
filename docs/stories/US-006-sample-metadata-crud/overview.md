# US-006 - Sample Metadata CRUD

## Current Behavior

The product contract includes sample management as a core MVP capability, but
the application currently has no `/dashboard/samples` route and no user-facing
way to create, edit, inspect, or filter sample metadata.

The data model already names the sample boundary:

- `samples` for lab sample records and 20-30 metadata fields;
- `customers`, `companies`, `sample_types`, and `kit_types` as reference data
  used by sample entry;
- `kits` as an optional relationship for later assignment;
- `sample_images` as future upload evidence, outside this story.

US-006 should turn the metadata contract into a tenant-scoped dashboard surface
without implementing result entry, file upload, analytics, or export.

## Target Behavior

Admins and allowed lab staff can manage sample metadata from the dashboard:

- view samples by code, customer/company, sample type, status, received date,
  billing status, and assigned kit summary;
- create a sample with required metadata and validated reference selections;
- update editable sample metadata without mutating result data;
- filter and search samples in a scan-friendly dashboard list or shared table;
- preserve customer and company snapshots required by the product data model;
- keep sample codes unique and deterministic enough for operators to reconcile;
- record audit evidence for every create/update operation;
- enforce tenant isolation and role authorization on reads and writes.

The first implementation should optimize for correctness, traceability, and
operator scanability. Advanced result-entry workflow belongs to US-007.

## Affected Users

- Admins who configure and supervise sample intake.
- Lab staff who create and maintain sample metadata before result entry.
- Viewers who need read-only sample status and customer context.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/result-engine.md`

## Non-Goals

- Dynamic result entry or KQ_CHUNG calculation.
- Sample image/file upload or R2 presigned URL flow.
- Excel/CSV export.
- Dashboard analytics or pivot datasets.
- Billing workflow beyond storing the current sample billing metadata.
- Atomic kit assignment beyond displaying or validating existing kit references.
- Introducing TanStack Query as a required dependency in this first slice.
