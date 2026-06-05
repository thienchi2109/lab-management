"use server";

import { revalidatePath } from "next/cache";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession as auth } from "@/lib/auth/session";
import {
  createKitBatch,
  createKitType,
  createKitUnits,
  updateKitStatus,
} from "@/lib/kit-inventory/operations";
import {
  parseBatchInput,
  parseKitStatusInput,
  parseKitTypeInput,
  parseKitUnitInput,
} from "@/lib/kit-inventory/schemas";
import {
  createSupabaseKitInventoryPort,
  getKitInventoryActor,
} from "@/lib/kit-inventory/server";

export type KitInventoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createKitTypeAction(
  _previousState: KitInventoryActionState,
  formData: FormData
): Promise<KitInventoryActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Kit inventory access required.");
    }

    const actor = getKitInventoryActor(session, ["admin"]);

    if (!actor) {
      throw new Error("Kit inventory access required.");
    }

    await createKitType(
      parseKitTypeInput({
        code: formData.get("code"),
        name: formData.get("name"),
        manufacturer: formData.get("manufacturer"),
        isActive: formData.get("isActive"),
      }),
      actor,
      createSupabaseKitInventoryPort()
    );
    revalidatePath("/dashboard/kits");
    return success("Đã tạo loại KIT.");
  } catch {
    return error("Không thể tạo loại KIT. Kiểm tra thông tin và thử lại.");
  }
}

export async function createKitBatchAction(
  _previousState: KitInventoryActionState,
  formData: FormData
): Promise<KitInventoryActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
      throw new Error("Kit inventory access required.");
    }

    const actor = getKitInventoryActor(session, ["admin", "editor"]);

    if (!actor) {
      throw new Error("Kit inventory access required.");
    }

    await createKitBatch(
      parseBatchInput({
        kitTypeId: formData.get("kitTypeId"),
        lotNumber: formData.get("lotNumber"),
        receivedQuantity: formData.get("receivedQuantity"),
        remainingQuantity: formData.get("remainingQuantity"),
        expiresOn: formData.get("expiresOn"),
        receivedAt: formData.get("receivedAt"),
      }),
      actor,
      createSupabaseKitInventoryPort()
    );
    revalidatePath("/dashboard/kits");
    return success("Đã tạo lô KIT.");
  } catch {
    return error("Không thể tạo lô KIT. Kiểm tra thông tin và thử lại.");
  }
}

export async function createKitUnitsAction(
  _previousState: KitInventoryActionState,
  formData: FormData
): Promise<KitInventoryActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
      throw new Error("Kit inventory access required.");
    }

    const actor = getKitInventoryActor(session, ["admin", "editor"]);

    if (!actor) {
      throw new Error("Kit inventory access required.");
    }

    await createKitUnits(
      parseKitUnitInput({
        batchId: formData.get("batchId"),
        kitCodes: String(formData.get("kitCodes") ?? "")
          .split(/\s|,|;/)
          .filter(Boolean),
      }),
      actor,
      createSupabaseKitInventoryPort()
    );
    revalidatePath("/dashboard/kits");
    return success("Đã thêm KIT vào kho.");
  } catch {
    return error("Không thể thêm KIT. Mã KIT phải hợp lệ và không trùng.");
  }
}

export async function updateKitStatusAction(
  _previousState: KitInventoryActionState,
  formData: FormData
): Promise<KitInventoryActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
      throw new Error("Kit inventory access required.");
    }

    const actor = getKitInventoryActor(session, ["admin", "editor"]);

    if (!actor) {
      throw new Error("Kit inventory access required.");
    }

    await updateKitStatus(
      parseKitStatusInput({
        kitId: formData.get("kitId"),
        status: formData.get("status"),
        reason: formData.get("reason"),
      }),
      actor,
      createSupabaseKitInventoryPort()
    );
    revalidatePath("/dashboard/kits");
    return success("Đã cập nhật trạng thái KIT.");
  } catch {
    return error(
      "Không thể cập nhật trạng thái KIT. Kiểm tra lý do và thử lại."
    );
  }
}

function success(message: string): KitInventoryActionState {
  return { status: "success", message };
}

function error(message: string): KitInventoryActionState {
  return { status: "error", message };
}
