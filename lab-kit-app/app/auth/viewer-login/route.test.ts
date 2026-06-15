import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { resolveUsernameEmail } from "@/lib/auth/session";
import { getViewerLoginEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "./route";

vi.mock("@/lib/auth/session", () => ({
  resolveUsernameEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getViewerLoginEnv: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("POST /auth/viewer-login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("keeps viewer session cookies on the dashboard redirect", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getViewerLoginEnv).mockReturnValue({
      username: "viewer",
      password: "viewer-test-password",
    });
    vi.mocked(resolveUsernameEmail).mockResolvedValue(
      "viewer@lab-management.local"
    );
    vi.mocked(createSupabaseServerClient).mockImplementation(
      async (options) => {
        options?.response?.cookies.set("sb-viewer-session", "session-value", {
          path: "/",
        });

        return {
          auth: {
            signInWithPassword,
          },
        } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>;
      }
    );
    const request = new NextRequest("http://localhost:3000/auth/viewer-login", {
      method: "POST",
      body: new URLSearchParams([
        ["username", "admin"],
        ["password", "ignored-browser-value"],
      ]),
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    );
    expect(response.headers.getSetCookie()).toEqual(
      expect.arrayContaining([expect.stringContaining("sb-viewer-session=")])
    );
    expect(resolveUsernameEmail).toHaveBeenCalledWith("viewer");
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "viewer@lab-management.local",
      password: "viewer-test-password",
    });
  });

  test("fails closed when viewer credentials are unavailable", async () => {
    vi.mocked(getViewerLoginEnv).mockImplementation(() => {
      throw new Error("missing env");
    });
    const request = new NextRequest("http://localhost:3000/auth/viewer-login", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=invalid"
    );
    expect(resolveUsernameEmail).not.toHaveBeenCalled();
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });
});
