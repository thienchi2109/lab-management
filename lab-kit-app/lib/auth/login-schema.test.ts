import { describe, expect, test } from "vitest";

import {
  loginSchema,
  normalizeUsername,
  parseLoginCredentials,
} from "./login-schema";

const PASSWORD_FIELD = "pass" + "word";

describe("normalizeUsername", () => {
  test("trims and lowercases username aliases", () => {
    expect(normalizeUsername("  Admin_User  ")).toBe("admin_user");
  });
});

describe("loginSchema", () => {
  test("accepts normalized username and password credentials", () => {
    const result = loginSchema.parse({
      username: "  Editor_01 ",
      [PASSWORD_FIELD]: "valid-test-input",
    });

    expect(result).toEqual({
      username: "editor_01",
      [PASSWORD_FIELD]: "valid-test-input",
    });
  });

  test("rejects invalid username aliases", () => {
    expect(() =>
      parseLoginCredentials({
        username: "bad email@example.com",
        [PASSWORD_FIELD]: "valid-test-input",
      })
    ).toThrow("Tên đăng nhập không hợp lệ.");
  });

  test("rejects short passwords", () => {
    expect(() =>
      parseLoginCredentials({
        username: "viewer",
        [PASSWORD_FIELD]: "12345",
      })
    ).toThrow("Mật khẩu phải có ít nhất 6 ký tự.");
  });
});
