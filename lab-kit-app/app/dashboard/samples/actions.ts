"use server";

import { revalidatePath } from "next/cache";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession as auth } from "@/lib/auth/session";
import {
  createSampleMetadata,
  updateSampleMetadata,
} from "@/lib/sample-metadata/operations";
import { getSampleCreateMetadata } from "@/lib/sample-metadata/create-metadata-server";
import type { SampleMetadata } from "@/lib/sample-metadata/metadata";
import {
  parseCreateSampleInput,
  parseUpdateSampleInput,
  type UpdateSampleInput,
  SampleMetadataValidationError,
} from "@/lib/sample-metadata/schemas";
import {
  createSupabaseSampleMetadataPort,
  getSampleMetadataActor,
} from "@/lib/sample-metadata/server";

/** Trạng thái phản hồi chuẩn của server action metadata mẫu. */
export type SampleMetadataActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof UpdateSampleInput, string>>;
};

/** Load reference metadata for the create-sample dialog on demand. */
export async function getSampleCreateMetadataAction(): Promise<SampleMetadata> {
  const session = await auth();

  if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
    throw new Error("Sample metadata read access required.");
  }

  const actor = getSampleMetadataActor(session, ["admin", "editor"]);

  if (!actor) {
    throw new Error("Sample metadata read access required.");
  }

  return getSampleCreateMetadata(actor);
}

/** Create a sample metadata record from the dashboard dialog. */
export async function createSampleMetadataAction(
  _previousState: SampleMetadataActionState,
  formData: FormData
): Promise<SampleMetadataActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
      throw new Error("Sample metadata write access required.");
    }

    const actor = getSampleMetadataActor(session, ["admin", "editor"]);

    if (!actor) {
      throw new Error("Sample metadata write access required.");
    }

    const result = await createSampleMetadata(
      parseCreateSampleInput(formDataToSampleInput(formData)),
      actor,
      createSupabaseSampleMetadataPort()
    );
    revalidatePath("/dashboard/samples");
    return success(`Đã tạo mẫu xét nghiệm. Mã mẫu: ${result.sampleCode}.`);
  } catch (err) {
    return errorFromUnknown(
      err,
      "Không thể tạo mẫu. Kiểm tra thông tin và thử lại."
    );
  }
}

/** Update editable sample metadata from the dashboard dialog. */
export async function updateSampleMetadataAction(
  _previousState: SampleMetadataActionState,
  formData: FormData
): Promise<SampleMetadataActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin", "editor"])) {
      throw new Error("Sample metadata write access required.");
    }

    const actor = getSampleMetadataActor(session, ["admin", "editor"]);

    if (!actor) {
      throw new Error("Sample metadata write access required.");
    }

    await updateSampleMetadata(
      parseUpdateSampleInput({
        sampleId: formData.get("sampleId"),
        ...formDataToSampleInput(formData),
      }),
      actor,
      createSupabaseSampleMetadataPort()
    );
    revalidatePath("/dashboard/samples");
    return success("Đã cập nhật mẫu xét nghiệm.");
  } catch (err) {
    return errorFromUnknown(
      err,
      "Không thể cập nhật mẫu. Kiểm tra thông tin và thử lại."
    );
  }
}

function formDataToSampleInput(formData: FormData) {
  return {
    sampleTypeId: formData.get("sampleTypeId"),
    customerId: formData.get("customerId"),
    companyId: formData.get("companyId"),
    kitBatchId: formData.get("kitBatchId"),
    customerName: formData.get("customerName"),
    collectedAt: formData.get("collectedAt"),
    receivedAt: formData.get("receivedAt"),
    resultGroupIds: formData.getAll("resultGroupIds"),
    status: formData.get("status"),
    billingStatus: formData.get("billingStatus"),
    note: formData.get("note"),
  };
}

function success(message: string): SampleMetadataActionState {
  return { status: "success", message };
}

function error(message: string): SampleMetadataActionState {
  return { status: "error", message };
}

function errorFromUnknown(
  err: unknown,
  fallback: string
): SampleMetadataActionState {
  if (err instanceof SampleMetadataValidationError) {
    return {
      status: "error",
      message: err.message,
      fieldErrors: err.fieldErrors,
    };
  }

  return error(safeSampleMetadataErrorMessage(err, fallback));
}

function safeSampleMetadataErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof Error)) {
    return fallback;
  }

  switch (err.message) {
    case "Thông tin mẫu xét nghiệm không hợp lệ.":
    case "Dữ liệu tham chiếu không thuộc tổ chức hiện tại.":
      return err.message;
    default:
      return fallback;
  }
}
