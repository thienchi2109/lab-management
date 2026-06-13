"use client";

import { useActionState, type ReactNode } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import {
  DialogActions,
  DialogFrame,
} from "@/components/dashboard/dialog-frame";
import { Field, SelectField } from "@/components/dashboard/form-fields";
import type { ManagedUser } from "@/lib/user-management/users";

import {
  createUserAction,
  initialUserActionState,
  updateUserAction,
} from "../actions";

type CreateUserDialogProps = {
  open: boolean;
  onClose: () => void;
};

type EditUserDialogProps = {
  user: ManagedUser | null;
  onClose: () => void;
};

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const [state, action, pending] = useActionState(
    createUserAction,
    initialUserActionState
  );

  if (!open) return null;

  return (
    <DialogFrame title="Thêm người dùng" closeLabel="Đóng" onClose={onClose}>
      <form action={action} className="flex flex-col gap-4">
        <UserFields />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Mật khẩu tạm"
          name="temporaryPassword"
          type="password"
          required
        />
        <RoleStatusFields />
        <ActionMessage state={state} />
        <UserDialogActions>
          <DialogActions
            pending={pending}
            cancelLabel="Hủy"
            savingLabel="Đang lưu..."
            onClose={onClose}
            submitLabel="Tạo"
          />
        </UserDialogActions>
      </form>
    </DialogFrame>
  );
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const [state, action, pending] = useActionState(
    updateUserAction,
    initialUserActionState
  );

  if (!user) return null;

  return (
    <DialogFrame
      title={`Sửa ${user.displayName}`}
      closeLabel="Đóng"
      onClose={onClose}
    >
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="membershipId" value={user.membershipId} />
        <UserFields user={user} />
        <RoleStatusFields user={user} />
        <ActionMessage state={state} />
        <UserDialogActions>
          <DialogActions
            pending={pending}
            cancelLabel="Hủy"
            savingLabel="Đang lưu..."
            onClose={onClose}
            submitLabel="Lưu thay đổi"
          />
        </UserDialogActions>
      </form>
    </DialogFrame>
  );
}

function UserFields({ user }: { user?: ManagedUser }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Tên hiển thị"
        name="displayName"
        defaultValue={user?.displayName}
        required
      />
      <Field
        label="Username"
        name="username"
        defaultValue={user?.username ?? ""}
        required
      />
    </div>
  );
}

function RoleStatusFields({ user }: { user?: ManagedUser }) {
  return (
    <section className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Quyền truy cập</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Chỉ Admin được thay đổi vai trò hoặc trạng thái truy cập.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hệ thống vẫn chặn hạ quyền hoặc tạm khóa Admin hoạt động cuối cùng.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Vai trò"
          name="role"
          defaultValue={user?.role ?? "viewer"}
          options={[
            ["admin", "Admin"],
            ["editor", "Editor"],
            ["viewer", "Viewer"],
          ]}
        />
        <SelectField
          label="Trạng thái"
          name="isActive"
          defaultValue={String(user?.isActive ?? true)}
          options={[
            ["true", "Hoạt động"],
            ["false", "Tạm khóa"],
          ]}
        />
      </div>
    </section>
  );
}

function UserDialogActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-5 -mb-5 border-t bg-background px-5 py-4">
      {children}
    </div>
  );
}
