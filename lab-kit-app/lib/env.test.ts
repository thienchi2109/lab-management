import { describe, expect, test } from "vitest";

import {
  getSupabasePublicEnv,
  getSupabaseServerEnv,
  parseSupabasePublicEnv,
  parseSupabaseServerEnv,
} from "./env";

describe("parseSupabasePublicEnv", () => {
  test("parses public Supabase configuration", () => {
    expect(
      parseSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      })
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "publishable",
    });
  });

  test("rejects missing public configuration", () => {
    expect(() => parseSupabasePublicEnv({})).toThrow(
      "Missing or invalid Supabase public environment."
    );
  });
});

describe("parseSupabaseServerEnv", () => {
  test("keeps server secret configuration server-only", () => {
    const env = parseSupabaseServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      SUPABASE_SECRET_KEY: "test-placeholder",
    });

    expect(env).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "publishable",
      secretKey: "test-placeholder",
    });
    expect(Object.keys(env)).not.toContain(
      "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
    );
    expect(Object.keys(env)).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
  });
});

describe("runtime env getters", () => {
  test("read from process.env only when called", () => {
    expect(typeof getSupabasePublicEnv).toBe("function");
    expect(typeof getSupabaseServerEnv).toBe("function");
  });
});
