# Design

## Direction

US-016H should make result entry feel like a focused lab workflow rather than a
generic form. The main design problem is clarity under density: users must know
which sample they are editing, which template applies, what can be saved, and
which fields/images still need attention.

## Interface Contract

The route should present:

- a compact sample/result header;
- permission-aware save status and action;
- an image evidence panel with clear upload/delete/read-only states;
- result groups that are easy to scan and operate on touch screens;
- inline feedback for pending, success, error and read-only states.

## Constraints

- Keep save payload creation and API route contracts unchanged.
- Keep image upload/delete authorization and provider contracts unchanged.
- Do not change result calculation, validation semantics or template structure.
- Reuse existing result components unless a split is needed to keep files under
  350 lines.

## Testing Focus

Focus on save payload stability, read-only rendering, pending/error feedback,
accordion/input behavior, image panel states and mobile overflow.
