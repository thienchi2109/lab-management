import { describe, expect, test } from "vitest";

import {
  filterManagedUsers,
  getManagedUserSummary,
  mapManagedUserRows,
} from "./users";

const rows = [
  {
    id: "user-admin",
    display_name: "Admin",
    email: "admin@lab-management.local",
    username: "admin",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-02T00:00:00.000Z",
    membership_id: "membership-admin",
    organization_id: "org-1",
    role: "admin",
    is_active: true,
  },
  {
    id: "user-editor",
    display_name: "Editor",
    email: "editor@lab-management.local",
    username: "editor",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-03T00:00:00.000Z",
    membership_id: "membership-editor",
    organization_id: "org-1",
    role: "editor",
    is_active: true,
  },
  {
    id: "user-viewer",
    display_name: "Guest",
    email: "guest@lab-management.local",
    username: "guest",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-04T00:00:00.000Z",
    membership_id: "membership-viewer",
    organization_id: "org-1",
    role: "viewer",
    is_active: false,
  },
];

describe("mapManagedUserRows", () => {
  test("maps database rows into stable app-facing users", () => {
    expect(mapManagedUserRows(rows)[0]).toEqual({
      id: "user-admin",
      membershipId: "membership-admin",
      organizationId: "org-1",
      displayName: "Admin",
      email: "admin@lab-management.local",
      username: "admin",
      role: "admin",
      isActive: true,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-02T00:00:00.000Z",
      initials: "A",
    });
  });
});

describe("getManagedUserSummary", () => {
  test("counts total, active, admin, and inactive users", () => {
    expect(getManagedUserSummary(mapManagedUserRows(rows))).toEqual({
      total: 3,
      active: 2,
      admins: 1,
      inactive: 1,
    });
  });
});

describe("filterManagedUsers", () => {
  test("matches search text against name, username, and email", () => {
    const users = mapManagedUserRows(rows);

    expect(filterManagedUsers(users, { search: "guest" })).toHaveLength(1);
    expect(filterManagedUsers(users, { search: "EDITOR@" })[0]?.id).toBe(
      "user-editor"
    );
  });

  test("filters by role and active status", () => {
    const users = mapManagedUserRows(rows);

    expect(
      filterManagedUsers(users, { role: "viewer", status: "inactive" })
    ).toHaveLength(1);
    expect(
      filterManagedUsers(users, { role: "admin", status: "inactive" })
    ).toHaveLength(0);
  });
});
