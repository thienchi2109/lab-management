# Design

## Direction

US-016F should keep the clinical, dense, data-first language established by
US-016B-D. The page is an operations tool for inventory control, so the polish
should favor compact hierarchy, status clarity, touch-friendly actions and
predictable dialogs over decorative cards.

## Interface Contract

The route should present:

- a concise page header with inventory context and primary actions;
- a summary strip for current stock state;
- a command filter surface for search, status and KIT type;
- a table/list surface using existing dashboard table/mobile fallback patterns;
- dialog states for create/update flows.

## Constraints

- Do not change KIT lifecycle semantics, statuses or persistence behavior.
- Do not add TanStack Query or a client cache layer.
- Do not change server actions, audit writes, Supabase calls or validation
  schemas.
- Reuse `DashboardDataTable`, `FilterSelect`, dialog/form wrappers and shadcn UI
  primitives where they fit.
- If a shared component must change, use Code Review Graph first and verify
  affected dashboard routes.

## Testing Focus

Lock filter/search rendering, summary states, empty state, dialog affordances and
mobile table/card behavior before implementation changes.
