"use client";

import { Edit3, ShieldCheck } from "lucide-react";

import {
  DashboardDataTable,
  type DashboardDataTableRow,
} from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagedUser } from "@/lib/user-management/users";

import { formatUserUpdatedDate } from "./user-table.utils";

type UserTableProps = {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
};

const roleLabels: Record<ManagedUser["role"], string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function UserTable({ users, onEdit }: UserTableProps) {
  const rows = users.map((user): DashboardDataTableRow => {
    return {
      id: user.membershipId,
      rowTone: user.role === "admin" ? "highlight" : "default",
      cells: [
        {
          columnKey: "identity",
          header: "Người dùng",
          content: <UserIdentity user={user} />,
          primary: true,
          mobileClassName: "flex-col items-start gap-2",
        },
        {
          columnKey: "role",
          header: "Vai trò",
          content: <RoleBadge role={user.role} />,
        },
        {
          columnKey: "status",
          header: "Trạng thái",
          content: <StatusBadge isActive={user.isActive} />,
        },
        {
          columnKey: "updated",
          header: "Cập nhật",
          content: formatUserUpdatedDate(user.updatedAt),
        },
      ],
      actions: <EditButton user={user} onEdit={onEdit} />,
      mobilePrimaryAction: (
        <EditButton user={user} onEdit={onEdit} mobileLabel />
      ),
    };
  });

  return (
    <DashboardDataTable
      caption="Danh sách người dùng"
      density="compact"
      emptyTitle="Không có người dùng phù hợp"
      emptyDescription="Thử đổi từ khóa hoặc xóa bộ lọc hiện tại."
      rows={rows}
      tone="workspace"
    />
  );
}

function UserIdentity({ user }: { user: ManagedUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        {user.initials}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{user.displayName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {user.username ? `@${user.username}` : "Chưa có username"} ·{" "}
          {user.email}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: ManagedUser["role"] }) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>
      {role === "admin" && <ShieldCheck className="size-3" />}
      {roleLabels[role]}
    </Badge>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "outline" : "destructive"}>
      {isActive ? "Hoạt động" : "Tạm khóa"}
    </Badge>
  );
}

function EditButton({
  user,
  onEdit,
  mobileLabel = false,
}: {
  user: ManagedUser;
  onEdit: (user: ManagedUser) => void;
  mobileLabel?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size={mobileLabel ? "default" : "sm"}
      className={mobileLabel ? "w-full justify-center" : undefined}
      onClick={() => onEdit(user)}
      aria-label={`Sửa ${user.displayName}`}
    >
      <Edit3 data-icon="inline-start" />
      {mobileLabel ? "Sửa người dùng" : "Sửa"}
    </Button>
  );
}
