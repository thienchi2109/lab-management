# US-005 - Kit Inventory Module

**Lane:** high-risk  
**Phase:** 4  
**Status:** implemented  
**Affects:** kit types, kit batches, individual kit inventory, dashboard UI,
assignment readiness

## Current Behavior

The product contract includes kit inventory as a core MVP capability, but the
application currently has no `/dashboard/kits` route and no user-facing way to
manage kit lots or individual kit units.

The data model already names the inventory boundary:

- `kit_types` for test-kit definitions;
- `kit_batches` for purchased kit lots;
- `kits` for individual units, with status flow `in_stock -> assigned -> used`
  and terminal states `void`, `expired`, or `lost`;
- `kit_code` must be unique per kit;
- future kit assignment must be atomic so the same kit cannot be assigned
  twice.

US-005 should turn this contract into an admin/lab-staff inventory surface
without implementing sample CRUD, result entry, or final sample assignment.

## Target Behavior

Admins and lab staff can manage kit inventory from the dashboard:

- view inventory by kit type, lot/batch, expiry, status, and quantity;
- create or update kit types when allowed by role;
- create or update kit batches with lot code, expiry date, received quantity,
  and notes;
- create individual kits from a batch, including unique kit codes;
- search and filter kits by type, batch, code, expiry, and status;
- manage kit units through a data table or table-equivalent shared component
  when row density, sorting, and scanning require tabular UI;
- mark kits as void, expired, or lost with an audit reason;
- see low-stock and near-expiry signals that help plan lab work;
- preserve tenant isolation, authorization, and audit evidence on every write.

The UI must reuse existing dashboard shared components when their contracts fit.
Known candidates include `components/dashboard/dialog-frame.tsx`,
`components/dashboard/form-fields.tsx`,
`components/dashboard/filter-select.tsx`,
`components/dashboard/app-select.tsx`, and
`components/dashboard/action-message.tsx`.
If US-005 needs a data table, it must use an existing shared table component if
one exists. If the repo only has local table implementations, first invoke the
code-deduplication workflow and create or extract a shared dashboard data-table
component instead of duplicating local markup.

The Build Web Apps plugin was invoked for this story packet. Future UI work must
follow the repo's existing dashboard design system, avoid local duplicated
forms/dialogs/filters, and verify desktop and mobile workflow quality before
handoff.

## Affected Users

- Admin: configures kit types, receives batches, adjusts kit status, and reviews
  audit evidence.
- Lab staff: searches available kits, checks expiry/stock status, and prepares
  kits for future sample workflows.
- Reviewer/operator: verifies inventory changes through audit logs and quality
  gates.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`

## Non-Goals

- Sample metadata CRUD.
- Assigning kits to samples in the sample workflow.
- Result entry or KQ_CHUNG calculation.
- Uploading files or kit images.
- Exporting inventory reports.
- Building a separate inventory design system instead of reusing dashboard
  components.
- Refreshing the GitNexus index. Use the existing index only if needed, after
  context-mode and Code Review Graph have narrowed the scope.
