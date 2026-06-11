import { describe, expect, test } from "vitest";

import {
  EXPORT_EXCEL_CSV_PERMISSION,
  resolveExportActor,
  type ExportPermissionGrant,
} from "./permissions";

const baseSession = {
  profile: {
    id: "profile-1",
    displayName: "Người dùng",
    email: "user@example.com",
    username: "user",
  },
};

describe("export permission gate", () => {
  test("allows active Admin and Editor memberships", () => {
    expect(
      resolveExportActor({
        organizationId: "org-1",
        session: sessionWithRole("admin"),
      })
    ).toMatchObject({ organizationId: "org-1", role: "admin" });

    expect(
      resolveExportActor({
        organizationId: "org-1",
        session: sessionWithRole("editor"),
      })
    ).toMatchObject({ organizationId: "org-1", role: "editor" });
  });

  test("allows Viewer only when the export grant is active for the tenant", () => {
    expect(
      resolveExportActor({
        grants: [grant("org-1", true)],
        organizationId: "org-1",
        session: sessionWithRole("viewer"),
      })
    ).toMatchObject({ organizationId: "org-1", role: "viewer" });

    expect(
      resolveExportActor({
        grants: [grant("org-1", false)],
        organizationId: "org-1",
        session: sessionWithRole("viewer"),
      })
    ).toBeNull();
  });

  test("does not let grants or roles bypass tenant scope", () => {
    expect(
      resolveExportActor({
        grants: [grant("org-2", true)],
        organizationId: "org-1",
        session: {
          ...baseSession,
          memberships: [
            { organizationId: "org-2", role: "admin", isActive: true },
            { organizationId: "org-1", role: "viewer", isActive: true },
          ],
        },
      })
    ).toBeNull();
  });
});

function sessionWithRole(role: "admin" | "editor" | "viewer") {
  return {
    ...baseSession,
    memberships: [{ organizationId: "org-1", role, isActive: true }],
  };
}

function grant(
  organizationId: string,
  isActive: boolean
): ExportPermissionGrant {
  return {
    isActive,
    organizationId,
    permission: EXPORT_EXCEL_CSV_PERMISSION,
  };
}
