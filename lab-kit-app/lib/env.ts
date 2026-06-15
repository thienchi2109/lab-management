import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

const viewerLoginEnvSchema = z.object({
  VIEWER_LOGIN_USERNAME: z.string().trim().min(1),
  VIEWER_LOGIN_PASSWORD: z.string().min(1),
});

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseServerEnv = SupabasePublicEnv & {
  secretKey: string;
};

/** Server-only credentials for the configured quick viewer login account. */
export type ViewerLoginEnv = {
  username: string;
  password: string;
};

/** Parse Supabase public environment for browser-safe client setup. */
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

/** Parse Supabase server-only environment, including the service key. */
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

/** Parse server-only credentials used by the quick viewer login route. */
export function parseViewerLoginEnv(input: unknown): ViewerLoginEnv {
  const result = viewerLoginEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Missing or invalid viewer login environment.");
  }

  return {
    username: result.data.VIEWER_LOGIN_USERNAME,
    password: result.data.VIEWER_LOGIN_PASSWORD,
  };
}

/** Read Supabase public environment lazily at runtime. */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  return parseSupabasePublicEnv(process.env);
}

/** Read Supabase server-only environment lazily at runtime. */
export function getSupabaseServerEnv(): SupabaseServerEnv {
  return parseSupabaseServerEnv(process.env);
}

/** Read quick viewer login credentials lazily at runtime. */
export function getViewerLoginEnv(): ViewerLoginEnv {
  return parseViewerLoginEnv(process.env);
}
