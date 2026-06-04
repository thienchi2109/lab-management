import { cache } from "react";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { AppRole, TenantMembership } from "./permissions";
import { normalizeUsername } from "./login-schema";
import { parseAppRole } from "./permissions";

export type CurrentProfile = {
  id: string;
  displayName: string;
  email: string;
  username: string | null;
};

export type CurrentSession = {
  profile: CurrentProfile;
  memberships: TenantMembership[];
};

type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  username: string | null;
};

type MembershipRow = {
  organization_id: string;
  role: AppRole;
  is_active: boolean;
};

export async function resolveUsernameEmail(
  username: string
): Promise<string | null> {
  const normalizedUsername = normalizeUsername(username);
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    throw new Error("Could not resolve username.");
  }

  return typeof data?.email === "string" ? data.email : null;
}

export const getCurrentSession = cache(
  async (): Promise<CurrentSession | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const [{ data: profile }, { data: memberships }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, email, username")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>(),
      supabase
        .from("tenant_memberships")
        .select("organization_id, role, is_active")
        .eq("user_id", user.id),
    ]);

    if (!profile) {
      return null;
    }

    return {
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        username: profile.username,
      },
      memberships: (memberships ?? [])
        .map((membership: MembershipRow): TenantMembership | null => {
          const role = parseAppRole(membership.role);

          if (!role) {
            return null;
          }

          return {
            organizationId: membership.organization_id,
            role,
            isActive: membership.is_active,
          };
        })
        .filter(
          (membership): membership is TenantMembership => membership !== null
        ),
    };
  }
);
