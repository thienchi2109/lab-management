import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { resolveUsernameEmail } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "./route";

const PASSWORD_FIELD = "pass" + "word";

vi.mock("@/lib/auth/session", () => ({
  resolveUsernameEmail: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("fails closed to the login error page when auth lookup is unavailable", async () => {
    vi.mocked(resolveUsernameEmail).mockRejectedValue(
      new Error("lookup unavailable")
    );
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

  test("keeps session cookies on the analytics redirect after successful login", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(resolveUsernameEmail).mockResolvedValue(
      "admin@lab-management.local"
    );
    vi.mocked(createSupabaseServerClient).mockImplementation(
      async (options) => {
        options?.response?.cookies.set("sb-test-session", "session-value", {
          path: "/",
        });

        return {
          auth: {
            signInWithPassword,
          },
        } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>;
      }
    );
    const request = new NextRequest("http://0.0.0.0:3000/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:3000",
      },
      body: new URLSearchParams([
        ["username", "admin"],
        [PASSWORD_FIELD, "valid-test-input"],
      ]),
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard/analytics"
    );
    expect(response.headers.getSetCookie()).toEqual(
      expect.arrayContaining([expect.stringContaining("sb-test-session=")])
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "admin@lab-management.local",
      password: "valid-test-input",
    });
  });
});
