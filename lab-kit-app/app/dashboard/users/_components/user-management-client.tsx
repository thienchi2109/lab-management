"use client";

import { useMemo, useReducer } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ManagedUser,
  ManagedUserSummary,
} from "@/lib/user-management/users";
import { filterManagedUsers } from "@/lib/user-management/users";

import { CreateUserDialog, EditUserDialog } from "./user-form-dialogs";
import { UserSummaryStrip } from "./user-summary-strip";
import { UserTable } from "./user-table";

type UserManagementClientProps = {
  users: ManagedUser[];
  summary: ManagedUserSummary;
};

export function UserManagementClient({
  users,
  summary,
}: UserManagementClientProps) {
  const [state, dispatch] = useReducer(userManagementReducer, {
    search: "",
    role: "all",
    status: "all",
    creating: false,
    editingUser: null,
  });

  const filteredUsers = useMemo(() => {
    return filterManagedUsers(users, {
      search: state.search,
      role: state.role,
      status: state.status,
    });
  }, [state.role, state.search, state.status, users]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Quản lý người dùng
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Quản lý tài khoản, vai trò và trạng thái truy cập trên ứng dụng.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => dispatch({ type: "openCreate" })}
        >
          <Plus className="size-4" />
          Thêm người dùng
        </Button>
      </div>

      <UserSummaryStrip summary={summary} />

      <section className="rounded-lg border bg-background p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.search}
              onChange={(event) =>
                dispatch({ type: "setSearch", value: event.target.value })
              }
              className="pl-8"
              placeholder="Tìm theo tên, username, email"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <FilterSelect
              label="Vai trò"
              value={state.role}
              onChange={(value) =>
                dispatch({
                  type: "setRole",
                  value: value as "all" | ManagedUser["role"],
                })
              }
              options={[
                ["all", "Tất cả vai trò"],
                ["admin", "Admin"],
                ["editor", "Editor"],
                ["viewer", "Viewer"],
              ]}
            />
            <FilterSelect
              label="Trạng thái"
              value={state.status}
              onChange={(value) =>
                dispatch({
                  type: "setStatus",
                  value: value as "all" | "active" | "inactive",
                })
              }
              options={[
                ["all", "Tất cả trạng thái"],
                ["active", "Hoạt động"],
                ["inactive", "Tạm khóa"],
              ]}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Đang hiển thị {filteredUsers.length}/{users.length} người dùng
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={(user) => dispatch({ type: "openEdit", user })}
      />

      <CreateUserDialog
        open={state.creating}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
      <EditUserDialog
        user={state.editingUser}
        onClose={() => dispatch({ type: "closeDialog" })}
      />
    </div>
  );
}

type UserManagementState = {
  search: string;
  role: "all" | ManagedUser["role"];
  status: "all" | "active" | "inactive";
  creating: boolean;
  editingUser: ManagedUser | null;
};

type UserManagementAction =
  | { type: "setSearch"; value: string }
  | { type: "setRole"; value: UserManagementState["role"] }
  | { type: "setStatus"; value: UserManagementState["status"] }
  | { type: "openCreate" }
  | { type: "openEdit"; user: ManagedUser }
  | { type: "closeDialog" };

function userManagementReducer(
  state: UserManagementState,
  action: UserManagementAction
): UserManagementState {
  switch (action.type) {
    case "setSearch":
      return { ...state, search: action.value };
    case "setRole":
      return { ...state, role: action.value };
    case "setStatus":
      return { ...state, status: action.value };
    case "openCreate":
      return { ...state, creating: true, editingUser: null };
    case "openEdit":
      return { ...state, creating: false, editingUser: action.user };
    case "closeDialog":
      return { ...state, creating: false, editingUser: null };
  }
}
