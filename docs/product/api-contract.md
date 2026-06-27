# API Contract

All API routes live in `app/api/**/route.ts`.

## Samples

```http
GET    /api/samples
POST   /api/samples
GET    /api/samples/:id
PATCH  /api/samples/:id
DELETE /api/samples/:id
```

## Sample Results

```http
GET /api/samples/:id/results
PUT /api/samples/:id/results
```

GET read model: server resolves session role and organization, then loads the
entry payload through `get_sample_result_entry_payload`. The RPC is read-only,
tenant-scoped by `organization_id` + `sample_id`, and executable only by the
server `service_role`.

PUT transaction: validate permission → validate sample → validate metrics →
upsert results → update group conclusions → audit log.

## Kits

```http
GET   /api/kit-batches
POST  /api/kit-batches
GET   /api/kits
POST  /api/kits/assign-next
PATCH /api/kits/:id
POST  /api/kits/bulk-adjust
```

Assign-next must prevent duplicate kit assignment.

## Result Configuration (Admin only)

```http
GET/POST       /api/result-groups
PATCH          /api/result-groups/:id
GET/POST       /api/result-metrics
PATCH          /api/result-metrics/:id
GET/POST       /api/result-templates
PATCH          /api/result-templates/:id
GET/PUT        /api/result-templates/:id/metrics
GET/POST/PATCH /api/metric-settings
```

## Upload

```http
POST   /api/uploads/cloudinary/signature
POST   /api/samples/:id/images
DELETE /api/samples/:id/images/:imageId
POST   /api/reports/images/signature
GET    /api/reports/images
POST   /api/reports/images
DELETE /api/reports/images/:imageId
```

Rules: max 20 images/sample for evidence images, max 20 images in the report
gallery, max 5 MB each, jpeg/png/webp only. Client uploads directly to
Cloudinary with server-signed parameters, never log Cloudinary API secrets,
upload signatures, or raw provider responses containing credential material.
Production must not use unsigned upload presets. Report gallery images are
stored in `report_images`, not `sample_images`.

## Analytics & Export

```http
POST /api/analytics/pivot
POST /api/export/samples
POST /api/export/results-normalized
```

Rules: whitelist dimensions/measures, no raw SQL, paginate large datasets.

## API Quality Rules

Every write endpoint must have:

- Auth check
- Role check
- Zod validation
- Transaction for multi-table writes
- Audit log
- Standard error response
- No secret/PII logging
