# Data Model

## Entity Overview

18 tables organized in 5 domains:

### Reference Data

- `categories` — top-level classification
- `kit_types` — types of test kits
- `sample_types` — types of lab samples
- `companies` — customer companies
- `customers` — individual customers

### Kit Inventory

- `kit_batches` — purchased kit lots
- `kits` — individual kit units (status: in_stock → assigned → used → void/expired/lost)

### Sample Management

- `samples` — lab samples with 20–30 metadata fields
- `sample_images` — uploaded evidence image metadata. For Cloudinary, store the
  provider marker in `storage_bucket` and the Cloudinary `public_id` in
  `storage_path`.

### Result Engine

- `result_groups` — test result categories (8 groups)
- `result_metrics` — individual test parameters per group
- `result_templates` — preset metric selections per sample/kit type
- `result_template_metrics` — template ↔ metric mapping
- `metric_settings` — units, thresholds, rules per metric (time-effective)
- `sample_results` — actual test values per sample per metric
- `sample_group_conclusions` — Kết Quả Chung per sample per group

### System

- `users` — app users with role (admin/editor/viewer)
- `audit_logs` — action trail

## Key Relationships

```text
categories ──┬── kit_types ── kit_batches ── kits ──┐
             └── sample_types                       │
                                                    ↓
companies ── customers ──────────────────────── samples
                                                    │
result_groups ── result_metrics                     │
result_templates ── result_template_metrics          │
metric_settings                                     │
                    ┌───────────────────────────────┘
                    ↓
              sample_results
              sample_group_conclusions
              sample_images
```

## Key Constraints

- `sample_code` unique, generated server-side: `T<month>_<#####>`
- `kit_code` unique per kit
- Kit assignment must be atomic (prevent duplicate assign)
- Sample status workflow: draft → done → approved
- Billing status: unpaid → invoiced → paid / eom_credit
- RLS enabled on all main tables
- Check constraints on status/role/input_type enum text fields
