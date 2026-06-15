import { type NextRequest, NextResponse } from "next/server";

import { createRedirectUrl } from "@/lib/auth/redirect-url";
import { resolveUsernameEmail } from "@/lib/auth/session";
import { getViewerLoginEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOGIN_ERROR_PATH = "/login?error=invalid";

function redirectToLoginError(request: NextRequest): NextResponse {
  return NextResponse.redirect(createRedirectUrl(LOGIN_ERROR_PATH, request), {
    status: 303,
  });
}

/** Sign in with the server-configured viewer account and redirect to dashboard. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const viewerLogin = getViewerLoginEnv();
    const email = await resolveUsernameEmail(viewerLogin.username);

    if (!email) {
      return redirectToLoginError(request);
    }

    const dashboardResponse = NextResponse.redirect(
      createRedirectUrl("/dashboard", request),
      {
        status: 303,
      }
    );
    const supabase = await createSupabaseServerClient({
      response: dashboardResponse,
    });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: viewerLogin.password,
    });

    if (error) {
      return redirectToLoginError(request);
    }

    return dashboardResponse;
  } catch {
    return redirectToLoginError(request);
  }
}
