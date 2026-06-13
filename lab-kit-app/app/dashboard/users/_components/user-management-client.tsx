"use client";

import { useMemo, useReducer } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

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
  const hasActiveFilters =
    state.search.trim() !== "" ||
    state.role !== "all" ||
    state.status !== "all";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:gap-5">
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
          className="w-full sm:w-fit"
          onClick={() => dispatch({ type: "openCreate" })}
        >
          <Plus data-icon="inline-start" />
          Thêm người dùng
        </Button>
      </div>

      <UserSummaryStrip summary={summary} />

      <section className="rounded-lg border bg-card p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Tìm nhanh người dùng</h2>
            <p className="text-xs text-muted-foreground">
              Tìm kiếm là thao tác chính trên mobile
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Đang hiển thị {filteredUsers.length}/{users.length}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.search}
              onChange={(event) =>
                dispatch({ type: "setSearch", value: event.target.value })
              }
              className="pl-8"
              placeholder="Tên, username hoặc email"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
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
            <Button
              type="button"
              variant="outline"
              disabled={!hasActiveFilters}
              onClick={() => dispatch({ type: "clearFilters" })}
            >
              <X data-icon="inline-start" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </section>

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
  | { type: "clearFilters" }
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
    case "clearFilters":
      return { ...state, search: "", role: "all", status: "all" };
    case "openCreate":
      return { ...state, creating: true, editingUser: null };
    case "openEdit":
      return { ...state, creating: false, editingUser: action.user };
    case "closeDialog":
      return { ...state, creating: false, editingUser: null };
  }
}
