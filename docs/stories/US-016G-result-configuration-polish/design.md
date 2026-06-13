# Design

## Direction

US-016G should make result configuration feel like a careful admin console:
quiet, structured and explicit about what is being configured. It should not
introduce a new configuration model or change server-side write behavior.

## Interface Contract

The route should present:

- a concise admin configuration header;
- summary metrics for configured groups, metrics and templates;
- a search/filter command surface;
- panel/list content that makes nested configuration easier to scan;
- create dialogs with strong form affordances.

## Constraints

- Keep US-004 authorization, validation and audit contracts unchanged.
- Do not change group/metric/template semantics.
- Reuse existing dashboard form/dialog wrappers and shadcn primitives.
- If implementation needs new shared UI, run code-deduplication and document
  affected routes.

## Testing Focus

Focus on panel switching, search/filter states, dialog open/close, empty states,
form accessibility and mobile overflow.
