"use client";

import { useActionState } from "react";

import { ActionMessage } from "@/components/dashboard/action-message";
import {
  DialogActions,
  DialogFrame,
} from "@/components/dashboard/dialog-frame";
import { Field } from "@/components/dashboard/form-fields";
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
    <DialogFrame title="Thêm người dùng" onClose={onClose}>
      <form action={action} className="space-y-4">
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
        <DialogActions pending={pending} onClose={onClose} submitLabel="Tạo" />
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
    <DialogFrame title={`Sửa ${user.displayName}`} onClose={onClose}>
      <form action={action} className="space-y-4">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="membershipId" value={user.membershipId} />
        <UserFields user={user} />
        <RoleStatusFields user={user} />
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          onClose={onClose}
          submitLabel="Lưu thay đổi"
        />
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
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium">
        <span>Vai trò</span>
        <select
          name="role"
          defaultValue={user?.role ?? "viewer"}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>
      <label className="space-y-1.5 text-sm font-medium">
        <span>Trạng thái</span>
        <select
          name="isActive"
          defaultValue={String(user?.isActive ?? true)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="true">Hoạt động</option>
          <option value="false">Tạm khóa</option>
        </select>
      </label>
    </div>
  );
}
