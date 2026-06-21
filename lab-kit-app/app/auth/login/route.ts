import { type NextRequest, NextResponse } from "next/server";

import { parseLoginCredentials } from "@/lib/auth/login-schema";
import { createRedirectUrl } from "@/lib/auth/redirect-url";
import { resolveUsernameEmail } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOGIN_ERROR_PATH = "/login?error=invalid";

function redirectToLoginError(request: NextRequest): NextResponse {
  return NextResponse.redirect(createRedirectUrl(LOGIN_ERROR_PATH, request), {
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

    const dashboardResponse = NextResponse.redirect(
      createRedirectUrl("/dashboard/samples", request),
      {
        status: 303,
      }
    );
    const supabase = await createSupabaseServerClient({
      response: dashboardResponse,
    });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: parsedCredentials.password,
    });

    if (error) {
      return redirectToLoginError(request);
    }

    return dashboardResponse;
  } catch {
    return redirectToLoginError(request);
  }
}
