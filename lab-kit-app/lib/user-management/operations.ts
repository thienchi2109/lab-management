import type { AppRole } from "@/lib/auth/permissions";

import {
  assertCanChangeMembership,
  type ManagedMembership,
} from "./last-admin";
import type { CreateUserInput, UpdateUserInput } from "./schemas";

export type UserManagementActor = {
  profileId: string;
  organizationId: string;
};

export type AuditEventInput = {
  organizationId: string;
  actorId: string;
  action: "user.created" | "user.updated";
  entityTable: "profiles";
  entityId: string;
  eventPayload: Record<string, unknown>;
};

export type UserManagementPort = {
  createAuthUser(input: {
    email: string;
    temporaryPassword: string;
    displayName: string;
    username: string;
  }): Promise<{ userId: string }>;
  upsertProfile(input: {
    userId: string;
    displayName: string;
    email: string;
    username: string;
  }): Promise<void>;
  createMembership(input: {
    userId: string;
    organizationId: string;
    role: AppRole;
    isActive: boolean;
  }): Promise<{ membershipId: string }>;
  listMemberships(organizationId: string): Promise<ManagedMembership[]>;
  updateProfile(input: {
    userId: string;
    displayName: string;
    username: string;
  }): Promise<void>;
  updateMembership(input: {
    membershipId: string;
    role: AppRole;
    isActive: boolean;
  }): Promise<void>;
  insertAuditEvent(input: AuditEventInput): Promise<void>;
};

export async function createManagedUser(
  input: CreateUserInput,
  actor: UserManagementActor,
  port: UserManagementPort
): Promise<{ userId: string; membershipId: string }> {
  const { userId } = await port.createAuthUser({
    email: input.email,
    temporaryPassword: input.temporaryPassword,
    displayName: input.displayName,
    username: input.username,
  });

  const [, membership] = await Promise.all([
    port.upsertProfile({
      userId,
      displayName: input.displayName,
      email: input.email,
      username: input.username,
    }),
    port.createMembership({
      userId,
      organizationId: actor.organizationId,
      role: input.role,
      isActive: input.isActive,
    }),
  ]);

  const { membershipId } = membership;

  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "user.created",
    entityTable: "profiles",
    entityId: userId,
    eventPayload: {
      displayName: input.displayName,
      username: input.username,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
      membershipId,
    },
  });

  return { userId, membershipId };
}

export async function updateManagedUser(
  input: UpdateUserInput,
  actor: UserManagementActor,
  port: UserManagementPort
): Promise<void> {
  const memberships = await port.listMemberships(actor.organizationId);
  const currentMembership = memberships.find(
    (membership) => membership.id === input.membershipId
  );

  if (!currentMembership) {
    throw new Error("Membership not found.");
  }

  assertCanChangeMembership(memberships, {
    membershipId: input.membershipId,
    nextRole: input.role,
    nextIsActive: input.isActive,
  });

  await Promise.all([
    port.updateProfile({
      userId: input.userId,
      displayName: input.displayName,
      username: input.username,
    }),
    port.updateMembership({
      membershipId: input.membershipId,
      role: input.role,
      isActive: input.isActive,
    }),
  ]);

  await port.insertAuditEvent({
    organizationId: actor.organizationId,
    actorId: actor.profileId,
    action: "user.updated",
    entityTable: "profiles",
    entityId: input.userId,
    eventPayload: {
      membershipId: input.membershipId,
      previousRole: currentMembership.role,
      previousIsActive: currentMembership.isActive,
      nextRole: input.role,
      nextIsActive: input.isActive,
      displayName: input.displayName,
      username: input.username,
    },
  });
}
