import type { ManagedUser } from "@/lib/user-management/users";
import { getManagedUserSummary } from "@/lib/user-management/users";

import { UserManagementClient } from "./user-management-client";

type UsersPageContentProps = {
  users: ManagedUser[];
};

export function UsersPageContent({ users }: UsersPageContentProps) {
  return (
    <UserManagementClient
      users={users}
      summary={getManagedUserSummary(users)}
    />
  );
}
