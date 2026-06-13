import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("POST /auth/signout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("redirects local 0.0.0.0 requests to the browser host after signing out", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        signOut,
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    const request = new NextRequest("http://0.0.0.0:3000/auth/signout", {
      method: "POST",
      headers: {
        host: "localhost:3000",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
    expect(signOut).toHaveBeenCalledOnce();
  });
});
