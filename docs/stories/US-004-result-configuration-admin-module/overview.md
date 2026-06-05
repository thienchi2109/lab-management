# US-004 - Result Configuration Admin Module

## Current Behavior

US-002 created the base result-engine schema and seed data. US-003 and US-014
added authenticated, role-aware admin surfaces.

Admins still cannot configure result groups, metrics, templates, or threshold
settings from the application. Result setup is backend-oriented and depends on
direct database or seed changes.

Current product contracts require an admin-only result-configuration surface for:

- result groups;
- result metrics;
- result templates;
- template metric assignments;
- metric units, options, thresholds, and validation settings.

Known planning gap: product docs name `metric_settings` as a separate resource,
while the applied schema stores settings in `result_metrics.metric_settings`
JSON. US-004 must reconcile that boundary before implementation and use only a
forward-only migration if schema changes are approved.

## Target Behavior

Admins manage result configuration from an admin-only dashboard surface without
direct database access.

The module supports:

- viewing configured result groups and their metrics;
- creating and updating group code, name, sort order, and active state;
- creating and updating metric code, name, input type, unit, options,
  requirement flag, sort order, active state, and settings;
- creating and updating templates per sample type;
- assigning metrics to templates in a stable order;
- validating duplicate codes, invalid input types, and invalid settings before
  writes;
- recording audit evidence for configuration changes.

## Affected Users

- Admin: configures result-engine behavior for later sample/result workflows.
- Editor: can use configured metrics in later result-entry flows but cannot
  manage configuration.
- Viewer: read-only; cannot manage configuration.

## Affected Product Docs

- `docs/product/result-engine.md`
- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Result entry for samples.
- Sample CRUD.
- Kit inventory workflows.
- File/image upload.
- Automatic KQ_CHUNG conclusion for every group.
- Applying migrations or implementing app code during this packet creation.
