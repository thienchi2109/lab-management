import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/env";

type SupabaseServerClientOptions = {
  response?: NextResponse;
};

export async function createSupabaseServerClient(
  options: SupabaseServerClientOptions = {}
) {
  const env = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          try {
            cookieStore.set(name, value, cookieOptions);
          } catch {
            // Server Components dùng cookie chỉ đọc; Route Handlers vẫn set cookie phản hồi bên dưới.
          }
          options.response?.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });
}
