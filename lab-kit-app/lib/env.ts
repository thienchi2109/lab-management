import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseServerEnv = SupabasePublicEnv & {
  secretKey: string;
};

export function parseSupabasePublicEnv(input: unknown): SupabasePublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Missing or invalid Supabase public environment.");
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function parseSupabaseServerEnv(input: unknown): SupabaseServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Missing or invalid Supabase server environment.");
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: result.data.SUPABASE_SECRET_KEY,
  };
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return parseSupabasePublicEnv(process.env);
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  return parseSupabaseServerEnv(process.env);
}
