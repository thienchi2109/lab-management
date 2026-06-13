import "server-only";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/auth/permissions";
// react-doctor-disable-next-line react-doctor/supabase-client-owned-authz-field -- Luồng quản trị người dùng chỉ chạy server-side khi đã kiểm tra admin và ghi audit.
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { ManagedMembership } from "./last-admin";
import type {
  AuditEventInput,
  UserManagementActor,
  UserManagementPort,
} from "./operations";
import { mapManagedUserRows, type ManagedUser } from "./users";

type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  username: string | null;
  created_at: string;
  updated_at: string;
};

type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
};

export function getUserManagementActor(
  session: CurrentSession
): UserManagementActor | null {
  const membership = session.memberships.find((item) => {
    return item.role === "admin" && item.isActive;
  });

  if (!membership) {
    return null;
  }

  return {
    profileId: session.profile.id,
    organizationId: membership.organizationId,
  };
}

async function requireUserManagementActor(): Promise<UserManagementActor> {
  const session = await getCurrentSession();

  if (!session || !hasAnyRole(session.memberships, ["admin"])) {
    throw new Error("Admin access required.");
  }

  const actor = getUserManagementActor(session);

  if (!actor) {
    throw new Error("Admin access required.");
  }

  return actor;
}

export async function getManageableUsers(): Promise<ManagedUser[]> {
  const actor = await requireUserManagementActor();
  const supabase = getSupabaseAdminClient();
  const { data: memberships, error: membershipsError } = await supabase
    .from("tenant_memberships")
    .select("id, organization_id, user_id, role, is_active")
    .eq("organization_id", actor.organizationId)
    .order("created_at", { ascending: true })
    .returns<MembershipRow[]>();

  if (membershipsError) {
    throw new Error("Could not load memberships.");
  }

  const userIds = (memberships ?? []).map((membership) => membership.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, email, username, created_at, updated_at")
    .in("id", userIds)
    .returns<ProfileRow[]>();

  if (profilesError) {
    throw new Error("Could not load profiles.");
  }

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );
  const rows = (memberships ?? []).flatMap((membership) => {
    const profile = profilesById.get(membership.user_id);

    if (!profile) {
      return [];
    }

    return {
      ...profile,
      membership_id: membership.id,
      organization_id: membership.organization_id,
      role: membership.role,
      is_active: membership.is_active,
    };
  });

  return mapManagedUserRows(rows);
}

export function createSupabaseUserManagementPort(): UserManagementPort {
  const supabase = getSupabaseAdminClient();

  return {
    async createAuthUser(input) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.temporaryPassword,
        email_confirm: true,
        user_metadata: {
          display_name: input.displayName,
          username: input.username,
        },
      });

      if (error || !data.user) {
        throw new Error("Could not create auth user.");
      }

      return { userId: data.user.id };
    },
    async upsertProfile(input) {
      const { error } = await supabase.from("profiles").upsert({
        id: input.userId,
        display_name: input.displayName,
        email: input.email,
        username: input.username,
      });

      if (error) {
        throw new Error("Could not save profile.");
      }
    },
    async createMembership(input) {
      const { data, error } = await supabase
        .from("tenant_memberships")
        .insert({
          user_id: input.userId,
          organization_id: input.organizationId,
          role: input.role,
          is_active: input.isActive,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !data) {
        throw new Error("Could not create membership.");
      }

      return { membershipId: data.id };
    },
    async listMemberships(organizationId) {
      const { data, error } = await supabase
        .from("tenant_memberships")
        .select("id, user_id, role, is_active")
        .eq("organization_id", organizationId)
        .returns<
          Array<{
            id: string;
            user_id: string;
            role: ManagedMembership["role"];
            is_active: boolean;
          }>
        >();

      if (error) {
        throw new Error("Could not load memberships.");
      }

      return (data ?? []).map((membership) => ({
        id: membership.id,
        userId: membership.user_id,
        role: membership.role,
        isActive: membership.is_active,
      }));
    },
    async updateProfile(input) {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: input.displayName,
          username: input.username,
        })
        .eq("id", input.userId);

      if (error) {
        throw new Error("Could not update profile.");
      }
    },
    async updateMembership(input) {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({
          role: input.role,
          is_active: input.isActive,
        })
        .eq("id", input.membershipId);

      if (error) {
        throw new Error("Could not update membership.");
      }
    },
    async insertAuditEvent(input: AuditEventInput) {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: input.organizationId,
        actor_id: input.actorId,
        action: input.action,
        entity_table: input.entityTable,
        entity_id: input.entityId,
        event_payload: input.eventPayload,
      });

      if (error) {
        throw new Error("Could not record audit event.");
      }
    },
  };
}
