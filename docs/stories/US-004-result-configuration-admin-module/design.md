# Design

## Domain Model

US-004 builds the admin configuration layer for the existing result-engine
domain:

- `result_groups` define active test groups and display order.
- `result_metrics` define individual parameters per group, including
  `input_type`, `unit`, `options`, and `metric_settings`.
- `result_templates` define preset selections for sample types.
- `result_template_metrics` assign metrics to templates in order.

The module must preserve organization scoping and admin-only writes. It should
prefer the currently applied schema unless the `metric_settings` product gap
requires a forward-only schema decision.

## Application Flow

1. Admin opens `/dashboard/result-configuration`.
2. The route requires an authenticated session and active `admin` membership.
3. A server query loads groups, metrics, templates, sample types, and template
   assignments for the current organization.
4. The UI renders grouped configuration panels with search/filter controls.
5. Admin creates or updates a group, metric, template, or template assignment.
6. Server actions validate input, verify admin role, enforce organization scope,
   perform the write, and record audit evidence.
7. Mutation success revalidates the route and shows updated configuration.
8. Mutation failure returns a standard non-secret error message.

## Interface Contract

Primary route:

- `GET /dashboard/result-configuration`

Expected server operations:

- list result configuration for the current organization;
- create/update result groups;
- create/update result metrics;
- create/update result templates;
- replace template metric assignments;
- create/update metric settings through the selected schema boundary.

Admin-only behavior:

- non-admin route access redirects or shows a permission-denied state;
- non-admin action calls fail closed;
- unknown input types, duplicate codes, and cross-organization ids are rejected;
- inactive groups or metrics remain visible to admins but are marked clearly.

## Data Model

Expected existing tables:

- `public.result_groups`
- `public.result_metrics`
- `public.result_templates`
- `public.result_template_metrics`
- `public.sample_types`
- `public.audit_events`

Planning gap to resolve before implementation:

- Product docs/API describe `metric_settings` as a separate resource.
- Current migration stores metric settings in
  `public.result_metrics.metric_settings` as JSON.
- US-004 must either keep the JSON-column boundary for MVP or propose a
  follow-up, forward-only migration for a table-backed settings model.

No applied migration file may be edited.

## UI / Platform Impact

The surface should be an operational admin tool:

- page header with title, status summary, and create actions;
- tabs or segmented controls for groups, metrics, and templates;
- searchable desktop tables and mobile list rows;
- group detail area showing metrics in sort order;
- metric editor with input type, unit, options JSON-friendly controls,
  threshold/settings fields, required flag, active state, and sort order;
- template editor with sample type and ordered metric assignment;
- empty, loading, no-match, permission-denied, success, and error states.

All visible Vietnamese copy must include full diacritics.

## Observability

Every write records audit evidence with:

- actor profile id;
- organization id;
- entity type and entity id;
- action type;
- changed fields without secrets;
- timestamp.

Logs must not contain service keys, session tokens, or raw credential material.

## Alternatives Considered

1. Keep `metric_settings` inside `result_metrics.metric_settings` for MVP.
   This is fastest and matches the applied schema, but the API name needs clear
   mapping.
2. Add a separate `metric_settings` table before UI work. This aligns with the
   product docs but increases migration and validation scope.
3. Seed-only configuration. Rejected because admins need in-app control before
   result entry and sample workflows can rely on configurable metrics.
