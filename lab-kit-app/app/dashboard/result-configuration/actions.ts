"use server";

import { revalidatePath } from "next/cache";

import { hasAnyRole } from "@/lib/auth/permissions";
import {
  getCurrentSession as auth,
  type CurrentSession,
} from "@/lib/auth/session";
import {
  createResultGroup,
  createResultMetric,
  createResultTemplate,
  replaceTemplateMetrics,
  updateResultGroup,
  updateResultMetric,
  updateResultTemplate,
} from "@/lib/result-configuration/operations";
import {
  parseGroupInput,
  parseMetricInput,
  parseTemplateInput,
  parseTemplateMetricInput,
} from "@/lib/result-configuration/schemas";
import {
  createSupabaseResultConfigurationPort,
  getResultConfigurationActor,
} from "@/lib/result-configuration/server";

import type { ResultConfigurationActionState } from "./action-state";

export async function createGroupAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await createResultGroup(
      parseGroupInput(readGroupForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã tạo nhóm chỉ tiêu.");
  } catch {
    return errorResult();
  }
}

export async function updateGroupAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await updateResultGroup(
      requiredString(formData, "groupId"),
      parseGroupInput(readGroupForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã cập nhật nhóm chỉ tiêu.");
  } catch {
    return errorResult();
  }
}

export async function createMetricAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await createResultMetric(
      parseMetricInput(readMetricForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã tạo chỉ tiêu.");
  } catch {
    return errorResult();
  }
}

export async function updateMetricAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await updateResultMetric(
      requiredString(formData, "metricId"),
      parseMetricInput(readMetricForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã cập nhật chỉ tiêu.");
  } catch {
    return errorResult();
  }
}

export async function createTemplateAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await createResultTemplate(
      parseTemplateInput(readTemplateForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã tạo mẫu cấu hình.");
  } catch {
    return errorResult();
  }
}

export async function updateTemplateAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await updateResultTemplate(
      requiredString(formData, "templateId"),
      parseTemplateInput(readTemplateForm(formData)),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã cập nhật mẫu cấu hình.");
  } catch {
    return errorResult();
  }
}

export async function replaceTemplateMetricsAction(
  _previousState: ResultConfigurationActionState,
  formData: FormData
): Promise<ResultConfigurationActionState> {
  try {
    const session = await auth();

    if (!session || !hasAnyRole(session.memberships, ["admin"])) {
      throw new Error("Admin access required.");
    }

    await replaceTemplateMetrics(
      parseTemplateMetricInput({
        resultTemplateId: formData.get("resultTemplateId"),
        metricIds: formData.getAll("metricIds"),
      }),
      requireActorFromSession(session),
      createSupabaseResultConfigurationPort()
    );
    return successResult("Đã cập nhật chỉ tiêu trong mẫu cấu hình.");
  } catch {
    return errorResult();
  }
}

function requireActorFromSession(session: CurrentSession) {
  const actor = getResultConfigurationActor(session);

  if (!actor) {
    throw new Error("Admin access required.");
  }

  return actor;
}

function successResult(message: string): ResultConfigurationActionState {
  revalidatePath("/dashboard/result-configuration");
  return { status: "success", message };
}

function errorResult(): ResultConfigurationActionState {
  return {
    status: "error",
    message: "Không thể lưu cấu hình chỉ tiêu. Kiểm tra thông tin và thử lại.",
  };
}

function readGroupForm(formData: FormData) {
  return {
    code: formData.get("code"),
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  };
}

function readMetricForm(formData: FormData) {
  return {
    resultGroupId: formData.get("resultGroupId"),
    code: formData.get("code"),
    name: formData.get("name"),
    inputType: formData.get("inputType"),
    unit: formData.get("unit"),
    optionsJson: formData.get("optionsJson"),
    settingsJson: formData.get("settingsJson"),
    sortOrder: formData.get("sortOrder"),
    isRequired: formData.get("isRequired"),
    isActive: formData.get("isActive"),
  };
}

function readTemplateForm(formData: FormData) {
  return {
    sampleTypeId: formData.get("sampleTypeId"),
    code: formData.get("code"),
    name: formData.get("name"),
    isActive: formData.get("isActive"),
  };
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Missing form value.");
  }

  return value;
}
