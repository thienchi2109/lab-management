import type { AppRole } from "@/lib/auth/permissions";
import { parseAppRole } from "@/lib/auth/permissions";

export type ManagedUserRow = {
  id: string;
  display_name: string;
  email: string;
  username: string | null;
  created_at: string;
  updated_at: string;
  membership_id: string;
  organization_id: string;
  role: string;
  is_active: boolean;
};

export type ManagedUser = {
  id: string;
  membershipId: string;
  organizationId: string;
  displayName: string;
  email: string;
  username: string | null;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  initials: string;
};

export type ManagedUserSummary = {
  total: number;
  active: number;
  admins: number;
  inactive: number;
};

export type ManagedUserFilter = {
  search?: string;
  role?: AppRole | "all";
  status?: "all" | "active" | "inactive";
};

function getInitials(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

export function mapManagedUserRows(rows: ManagedUserRow[]): ManagedUser[] {
  return rows.map((row) => {
    const role = parseAppRole(row.role);

    if (!role) {
      throw new Error("Unknown user role.");
    }

    return {
      id: row.id,
      membershipId: row.membership_id,
      organizationId: row.organization_id,
      displayName: row.display_name,
      email: row.email,
      username: row.username,
      role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      initials: getInitials(row.display_name),
    };
  });
}

export function getManagedUserSummary(
  users: ManagedUser[]
): ManagedUserSummary {
  return users.reduce(
    (summary, user) => {
      summary.total += 1;

      if (user.isActive) {
        summary.active += 1;
      } else {
        summary.inactive += 1;
      }

      if (user.role === "admin") {
        summary.admins += 1;
      }

      return summary;
    },
    {
      total: 0,
      active: 0,
      admins: 0,
      inactive: 0,
    }
  );
}

export function filterManagedUsers(
  users: ManagedUser[],
  filter: ManagedUserFilter
): ManagedUser[] {
  const search = filter.search?.trim().toLowerCase() ?? "";

  return users.filter((user) => {
    const matchesSearch =
      !search ||
      user.displayName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.username ?? "").toLowerCase().includes(search);

    const matchesRole =
      !filter.role || filter.role === "all" || user.role === filter.role;

    const matchesStatus =
      !filter.status ||
      filter.status === "all" ||
      (filter.status === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });
}
