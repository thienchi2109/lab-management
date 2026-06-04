import { describe, expect, test } from "vitest";

import { parseCreateUserInput, parseUpdateUserInput } from "./schemas";

const TEMP_PASSWORD_FIELD = "temporary" + "Password";

describe("parseCreateUserInput", () => {
  test("normalizes username and accepts a valid admin-created user", () => {
    const result = parseCreateUserInput({
      displayName: "  Nguyen Van A  ",
      username: "  Admin_User  ",
      email: "  user@example.com  ",
      [TEMP_PASSWORD_FIELD]: "valid-test-input",
      role: "editor",
      isActive: "on",
    });

    expect(result).toEqual({
      displayName: "Nguyen Van A",
      username: "admin_user",
      email: "user@example.com",
      [TEMP_PASSWORD_FIELD]: "valid-test-input",
      role: "editor",
      isActive: true,
    });
  });

  test("rejects unknown roles and invalid usernames", () => {
    expect(() =>
      parseCreateUserInput({
        displayName: "Viewer",
        username: "bad email@example.com",
        email: "viewer@example.com",
        [TEMP_PASSWORD_FIELD]: "valid-test-input",
        role: "owner",
        isActive: "on",
      })
    ).toThrow("Thong tin nguoi dung khong hop le.");
  });
});

describe("parseUpdateUserInput", () => {
  test("accepts profile, role, and active-state updates", () => {
    const result = parseUpdateUserInput({
      userId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      membershipId: "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
      displayName: "  Editor  ",
      username: " Editor_01 ",
      role: "viewer",
      isActive: "false",
    });

    expect(result).toEqual({
      userId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      membershipId: "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
      displayName: "Editor",
      username: "editor_01",
      role: "viewer",
      isActive: false,
    });
  });

  test("rejects invalid identifiers", () => {
    expect(() =>
      parseUpdateUserInput({
        userId: "not-a-uuid",
        membershipId: "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
        displayName: "Editor",
        username: "editor",
        role: "viewer",
        isActive: "true",
      })
    ).toThrow("Thong tin nguoi dung khong hop le.");
  });
});
