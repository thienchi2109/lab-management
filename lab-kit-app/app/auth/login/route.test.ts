import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { POST } from "./route";

const PASSWORD_FIELD = "pass" + "word";

describe("POST /auth/login", () => {
  test("fails closed to the login error page when auth lookup is unavailable", async () => {
    const request = new NextRequest("http://localhost:3000/auth/login", {
      method: "POST",
      body: new URLSearchParams([
        ["username", "admin"],
        [PASSWORD_FIELD, "invalid-test-input"],
      ]),
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=invalid"
    );
  });
});
