import { describe, expect, test } from "vitest";

import {
  createManagedUser,
  updateManagedUser,
  type UserManagementPort,
} from "./operations";

function createFakePort(): UserManagementPort & {
  calls: string[];
  auditPayloads: unknown[];
} {
  const calls: string[] = [];
  const auditPayloads: unknown[] = [];

  return {
    calls,
    auditPayloads,
    async createAuthUser() {
      calls.push("createAuthUser");
      return { userId: "created-user" };
    },
    async upsertProfile() {
      calls.push("upsertProfile");
    },
    async createMembership() {
      calls.push("createMembership");
      return { membershipId: "created-membership" };
    },
    async listMemberships() {
      calls.push("listMemberships");
      return [
        {
          id: "membership-admin",
          userId: "user-admin",
          role: "admin",
          isActive: true,
        },
        {
          id: "membership-editor",
          userId: "user-editor",
          role: "editor",
          isActive: true,
        },
      ];
    },
    async updateProfile() {
      calls.push("updateProfile");
    },
    async updateMembership() {
      calls.push("updateMembership");
    },
    async insertAuditEvent(event) {
      calls.push("insertAuditEvent");
      auditPayloads.push(event.eventPayload);
    },
  };
}

const actor = {
  profileId: "user-admin",
  organizationId: "org-1",
};

describe("createManagedUser", () => {
  test("creates auth user, profile, membership, and audit event", async () => {
    const port = createFakePort();

    const result = await createManagedUser(
      {
        displayName: "Editor",
        username: "editor",
        email: "editor@example.com",
        temporaryPassword: "valid-test-input",
        role: "editor",
        isActive: true,
      },
      actor,
      port
    );

    expect(result).toEqual({
      userId: "created-user",
      membershipId: "created-membership",
    });
    expect(port.calls).toEqual([
      "createAuthUser",
      "upsertProfile",
      "createMembership",
      "insertAuditEvent",
    ]);
    expect(JSON.stringify(port.auditPayloads)).not.toContain(
      "valid-test-input"
    );
  });
});

describe("updateManagedUser", () => {
  test("updates profile, membership, and audit event", async () => {
    const port = createFakePort();

    await updateManagedUser(
      {
        userId: "user-editor",
        membershipId: "membership-editor",
        displayName: "Editor Updated",
        username: "editor_updated",
        role: "viewer",
        isActive: false,
      },
      actor,
      port
    );

    expect(port.calls).toEqual([
      "listMemberships",
      "updateProfile",
      "updateMembership",
      "insertAuditEvent",
    ]);
  });

  test("blocks demoting the final active admin", async () => {
    const port = createFakePort();
    port.listMemberships = async () => [
      {
        id: "membership-admin",
        userId: "user-admin",
        role: "admin",
        isActive: true,
      },
    ];

    await expect(
      updateManagedUser(
        {
          userId: "user-admin",
          membershipId: "membership-admin",
          displayName: "Admin",
          username: "admin",
          role: "editor",
          isActive: true,
        },
        actor,
        port
      )
    ).rejects.toThrow("Không thể thay đổi admin hoạt động cuối cùng.");
  });
});
