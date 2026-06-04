import { describe, expect, test } from "vitest";

import { assertCanChangeMembership } from "./last-admin";

const activeAdmin = {
  id: "membership-admin",
  userId: "user-admin",
  role: "admin" as const,
  isActive: true,
};

describe("assertCanChangeMembership", () => {
  test("blocks demoting the final active admin", () => {
    expect(() =>
      assertCanChangeMembership([activeAdmin], {
        membershipId: "membership-admin",
        nextRole: "editor",
        nextIsActive: true,
      })
    ).toThrow("Khong the thay doi admin hoat dong cuoi cung.");
  });

  test("blocks deactivating the final active admin", () => {
    expect(() =>
      assertCanChangeMembership([activeAdmin], {
        membershipId: "membership-admin",
        nextRole: "admin",
        nextIsActive: false,
      })
    ).toThrow("Khong the thay doi admin hoat dong cuoi cung.");
  });

  test("allows demoting an admin when another active admin remains", () => {
    expect(() =>
      assertCanChangeMembership(
        [
          activeAdmin,
          {
            id: "membership-admin-2",
            userId: "user-admin-2",
            role: "admin",
            isActive: true,
          },
        ],
        {
          membershipId: "membership-admin",
          nextRole: "editor",
          nextIsActive: true,
        }
      )
    ).not.toThrow();
  });
});
