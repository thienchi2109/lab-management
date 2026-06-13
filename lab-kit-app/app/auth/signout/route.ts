import { type NextRequest, NextResponse } from "next/server";

import { createRedirectUrl } from "@/lib/auth/redirect-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(createRedirectUrl("/login", request), {
    status: 303,
  });
}
