import type { AppRole } from "@/lib/auth/permissions";

const LAST_ADMIN_ERROR = "Khong the thay doi admin hoat dong cuoi cung.";

export type ManagedMembership = {
  id: string;
  userId: string;
  role: AppRole;
  isActive: boolean;
};

type MembershipChange = {
  membershipId: string;
  nextRole: AppRole;
  nextIsActive: boolean;
};

export function assertCanChangeMembership(
  memberships: ManagedMembership[],
  change: MembershipChange
): void {
  const target = memberships.find(
    (membership) => membership.id === change.membershipId
  );

  if (!target || target.role !== "admin" || !target.isActive) {
    return;
  }

  const remainsActiveAdmin = change.nextRole === "admin" && change.nextIsActive;

  if (remainsActiveAdmin) {
    return;
  }

  const otherActiveAdminExists = memberships.some((membership) => {
    return (
      membership.id !== change.membershipId &&
      membership.role === "admin" &&
      membership.isActive
    );
  });

  if (!otherActiveAdminExists) {
    throw new Error(LAST_ADMIN_ERROR);
  }
}
