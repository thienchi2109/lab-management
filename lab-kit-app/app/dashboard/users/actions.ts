"use server";

import { revalidatePath } from "next/cache";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession as auth } from "@/lib/auth/session";
import {
  createSupabaseUserManagementPort,
  getUserManagementActor,
} from "@/lib/user-management/server";
import {
  createManagedUser,
  updateManagedUser,
} from "@/lib/user-management/operations";
import {
  parseCreateUserInput,
  parseUpdateUserInput,
} from "@/lib/user-management/schemas";

export type UserActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialUserActionState: UserActionState = {
  status: "idle",
  message: "",
};

function readForm(
  formData: FormData
): Record<string, FormDataEntryValue | null> {
  return {
    userId: formData.get("userId"),
    membershipId: formData.get("membershipId"),
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    email: formData.get("email"),
    temporaryPassword: formData.get("temporaryPassword"),
    role: formData.get("role"),
    isActive: formData.get("isActive"),
  };
}

export async function createUserAction(
  _previousState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    const actor = getUserManagementActor(session);

    if (!actor) {
      throw new Error("Admin access required.");
    }

    const input = parseCreateUserInput(readForm(formData));
    const port = createSupabaseUserManagementPort();

    await createManagedUser(input, actor, port);
    revalidatePath("/dashboard/users");

    return {
      status: "success",
      message: "Da tao nguoi dung moi.",
    };
  } catch {
    return {
      status: "error",
      message: "Khong the tao nguoi dung. Kiem tra thong tin va thu lai.",
    };
  }
}

export async function updateUserAction(
  _previousState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    const actor = getUserManagementActor(session);

    if (!actor) {
      throw new Error("Admin access required.");
    }

    const input = parseUpdateUserInput(readForm(formData));
    const port = createSupabaseUserManagementPort();

    await updateManagedUser(input, actor, port);
    revalidatePath("/dashboard/users");

    return {
      status: "success",
      message: "Da cap nhat nguoi dung.",
    };
  } catch {
    return {
      status: "error",
      message: "Khong the cap nhat nguoi dung. Kiem tra quyen va thu lai.",
    };
  }
}
