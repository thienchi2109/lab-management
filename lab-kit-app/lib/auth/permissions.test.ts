import { describe, expect, test } from "vitest";

import { APP_ROLES, hasAnyRole, isAppRole, parseAppRole } from "./permissions";

describe("app roles", () => {
  test("keeps the product role set stable", () => {
    expect(APP_ROLES).toEqual(["admin", "editor", "viewer"]);
  });

  test("parses only known roles", () => {
    expect(parseAppRole("admin")).toBe("admin");
    expect(parseAppRole("owner")).toBeNull();
    expect(isAppRole("viewer")).toBe(true);
    expect(isAppRole(null)).toBe(false);
  });
});

describe("hasAnyRole", () => {
  test("matches active memberships for an organization", () => {
    expect(
      hasAnyRole(
        [
          {
            organizationId: "org-1",
            role: "viewer",
            isActive: true,
          },
          {
            organizationId: "org-2",
            role: "admin",
            isActive: true,
          },
        ],
        ["viewer"],
        "org-1"
      )
    ).toBe(true);
  });

  test("ignores inactive memberships and other organizations", () => {
    expect(
      hasAnyRole(
        [
          {
            organizationId: "org-1",
            role: "admin",
            isActive: false,
          },
          {
            organizationId: "org-2",
            role: "admin",
            isActive: true,
          },
        ],
        ["admin"],
        "org-1"
      )
    ).toBe(false);
  });
});
