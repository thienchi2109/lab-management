import { beforeEach, describe, expect, test, vi } from "vitest";

const createServerClient = vi.fn();
const cookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(() => {
    throw new Error("Readonly cookies");
  }),
};

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("@/lib/env", () => ({
  getSupabasePublicEnv: () => ({
    url: "https://example.supabase.co",
    publishableKey: "public-key",
  }),
}));

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("ignores readonly cookie writes during server component rendering", async () => {
    let setAll:
      | ((
          cookiesToSet: { name: string; value: string; options: object }[]
        ) => void)
      | undefined;
    createServerClient.mockImplementation((_url, _key, options) => {
      setAll = options.cookies.setAll;
      return {};
    });
    const { createSupabaseServerClient } = await import("./server");

    await createSupabaseServerClient();

    expect(() =>
      setAll?.([{ name: "sb-test", value: "session", options: { path: "/" } }])
    ).not.toThrow();
    expect(cookieStore.set).toHaveBeenCalledWith("sb-test", "session", {
      path: "/",
    });
  });
});
