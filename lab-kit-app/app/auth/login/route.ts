import { type NextRequest, NextResponse } from "next/server";

import { parseLoginCredentials } from "@/lib/auth/login-schema";
import { resolveUsernameEmail } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOGIN_ERROR_PATH = "/login?error=invalid";

function createRedirectUrl(path: string, request: NextRequest): URL {
  const url = new URL(path, request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto");

  if (host) {
    url.host = host;
  }

  if (protocol) {
    url.protocol = `${protocol}:`;
  }

  return url;
}

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
