import { type NextRequest, NextResponse } from "next/server";

import { parseLoginCredentials } from "@/lib/auth/login-schema";
import { resolveUsernameEmail } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOGIN_ERROR_PATH = "/login?error=invalid";

function redirectToLoginError(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(LOGIN_ERROR_PATH, request.url), {
    status: 303,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const parsedCredentials = parseLoginCredentials({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  try {
    const email = await resolveUsernameEmail(parsedCredentials.username);

    if (!email) {
      return redirectToLoginError(request);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: parsedCredentials.password,
    });

    if (error) {
      return redirectToLoginError(request);
    }
  } catch {
    return redirectToLoginError(request);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), {
    status: 303,
  });
}
