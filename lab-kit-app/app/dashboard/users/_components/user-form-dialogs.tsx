"use client";

import { useActionState, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <DialogFrame title="Them nguoi dung" onClose={onClose}>
      <form action={action} className="space-y-4">
        <UserFields />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Mat khau tam"
          name="temporaryPassword"
          type="password"
          required
        />
        <RoleStatusFields />
        <ActionMessage state={state} />
        <DialogActions pending={pending} onClose={onClose} submitLabel="Tao" />
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
    <DialogFrame title={`Sua ${user.displayName}`} onClose={onClose}>
      <form action={action} className="space-y-4">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="membershipId" value={user.membershipId} />
        <UserFields user={user} />
        <RoleStatusFields user={user} />
        <ActionMessage state={state} />
        <DialogActions
          pending={pending}
          onClose={onClose}
          submitLabel="Luu thay doi"
        />
      </form>
    </DialogFrame>
  );
}

function DialogFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 backdrop-blur-sm md:items-center md:justify-center">
      <section className="w-full rounded-lg bg-background shadow-2xl ring-1 ring-border md:max-w-lg">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Dong"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function UserFields({ user }: { user?: ManagedUser }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Ten hien thi"
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
        <span>Vai tro</span>
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
        <span>Trang thai</span>
        <select
          name="isActive"
          defaultValue={String(user?.isActive ?? true)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="true">Hoat dong</option>
          <option value="false">Tam khoa</option>
        </select>
      </label>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

function ActionMessage({
  state,
}: {
  state: { status: "idle" | "success" | "error"; message: string };
}) {
  if (state.status === "idle") return null;

  return (
    <p
      className={
        state.status === "success"
          ? "text-sm font-medium text-emerald-600"
          : "text-sm font-medium text-destructive"
      }
    >
      {state.message}
    </p>
  );
}

function DialogActions({
  pending,
  onClose,
  submitLabel,
}: {
  pending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Huy
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? "Dang luu..." : submitLabel}
      </Button>
    </div>
  );
}
