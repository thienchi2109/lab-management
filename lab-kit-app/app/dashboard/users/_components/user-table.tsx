"use client";

import { Edit3, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagedUser } from "@/lib/user-management/users";

type UserTableProps = {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
};

const roleLabels: Record<ManagedUser["role"], string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const userDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function UserTable({ users, onEdit }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-background p-8 text-center">
        <p className="font-medium">Không có người dùng phù hợp</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thử đổi từ khóa tìm kiếm hoặc bộ lọc vai trò/trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Người dùng</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Cập nhật</th>
              <th className="px-4 py-3 text-right font-medium">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.membershipId} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <UserIdentity user={user} />
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={user.isActive} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatUserUpdatedDate(user.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit3 className="size-3.5" />
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {users.map((user) => (
          <div key={user.membershipId} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <UserIdentity user={user} />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => onEdit(user)}
                aria-label={`Sua ${user.displayName}`}
              >
                <Edit3 className="size-3.5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <RoleBadge role={user.role} />
              <StatusBadge isActive={user.isActive} />
              <span className="text-xs text-muted-foreground">
                {formatUserUpdatedDate(user.updatedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
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

export function formatUserUpdatedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa rõ";
  }

  return userDateFormatter.format(date);
}
