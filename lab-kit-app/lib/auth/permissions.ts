export const APP_ROLES = ["admin", "editor", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type TenantMembership = {
  organizationId: string;
  role: AppRole;
  isActive: boolean;
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function parseAppRole(value: unknown): AppRole | null {
  return isAppRole(value) ? value : null;
}

export function hasAnyRole(
  memberships: TenantMembership[],
  allowedRoles: AppRole[],
  organizationId?: string
): boolean {
  return memberships.some((membership) => {
    if (!membership.isActive || !allowedRoles.includes(membership.role)) {
      return false;
    }

    return organizationId ? membership.organizationId === organizationId : true;
  });
}
