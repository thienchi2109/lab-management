# Roles & Permissions

## Roles

| Role | Description |
| --- | --- |
| Admin | System admin: configure groups/metrics/templates/settings, manage users |
| Editor | Create/edit samples, enter results, upload evidence images, export |
| Viewer | Read-only: view data, images, dashboard, reports |

## Permission Matrix

| Function | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| View samples | ✓ | ✓ | ✓ |
| Create/edit samples | ✓ | ✓ | ✗ |
| Delete samples | ✓ | ✗ default | ✗ |
| Enter results | ✓ | ✓ | ✗ |
| Upload evidence images | ✓ | ✓ | ✗ |
| Manage report gallery images | ✓ | ✗ | ✗ |
| View report gallery images | ✓ | ✓ | ✓ |
| Approve samples | ✓ | ✓ if granted | ✗ |
| Export Excel/CSV | ✓ | ✓ | ✓ if granted |
| Manage result groups | ✓ | ✗ | ✗ |
| Manage metrics | ✓ | ✗ | ✗ |
| Manage templates | ✓ | ✗ | ✗ |
| Manage settings/thresholds | ✓ | ✗ | ✗ |
| Manage users/roles | ✓ | ✗ | ✗ |

## RLS Policy

- RLS enabled on all main tables
- App layer checks permissions first for clear 403 errors
- No service role key exposed to client
- Role determined server-side from session, never from client payload
