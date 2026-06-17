import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  createSampleMetadata,
  updateSampleMetadata,
} from "@/lib/sample-metadata/operations";
import {
  createSupabaseSampleMetadataPort,
  getSampleMetadataActor,
} from "@/lib/sample-metadata/server";

import {
  createSampleMetadataAction,
  updateSampleMetadataAction,
  type SampleMetadataActionState,
} from "./actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  hasAnyRole: vi.fn(),
}));

vi.mock("@/lib/sample-metadata/server", () => ({
  createSupabaseSampleMetadataPort: vi.fn(),
  getSampleMetadataActor: vi.fn(),
}));

vi.mock("@/lib/sample-metadata/operations", () => ({
  createSampleMetadata: vi.fn(),
  updateSampleMetadata: vi.fn(),
}));

const session: CurrentSession = {
  profile: {
    id: "user-admin",
    displayName: "Admin",
    email: "admin@example.com",
    username: "admin",
  },
  memberships: [{ organizationId: "org-1", role: "admin", isActive: true }],
};

const previousState: SampleMetadataActionState = {
  status: "idle",
  message: "",
};
const resultGroupId = "11111111-1111-4111-8111-111111111111";

function createSampleForm() {
  const formData = new FormData();
  formData.set("sampleTypeId", "3e122f53-4b7f-409e-a7c2-52394e16d10b");
  formData.set("customerId", "");
  formData.set("companyId", "");
  formData.set("kitBatchId", "");
  formData.set("customerName", "Công ty Minh Phú");
  formData.set("collectedAt", "");
  formData.set("receivedAt", "2026-06-06");
  formData.set("status", "received");
  formData.set("billingStatus", "unpaid");
  formData.set("note", "");
  formData.append("resultGroupIds", resultGroupId);
  return formData;
}

function updateSampleForm() {
  const formData = createSampleForm();
  formData.set("sampleId", "25d0f9ea-441b-4cc3-bf05-c0984fbbe99f");
  return formData;
}

describe("createSampleMetadataAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentSession).mockResolvedValue(session);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(getSampleMetadataActor).mockReturnValue({
      profileId: "user-admin",
      organizationId: "org-1",
    });
    vi.mocked(createSupabaseSampleMetadataPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseSampleMetadataPort>
    );
    vi.mocked(createSampleMetadata).mockResolvedValue({
      sampleId: "sample-1",
      sampleCode: "HP-260615-7K3QM2XH",
    });
    vi.mocked(updateSampleMetadata).mockResolvedValue(undefined);
  });

  test("does not read client-provided sampleCode when creating metadata", async () => {
    const formData = createSampleForm();
    formData.set("sampleCode", "HP-CLIENT-SHOULD-BE-IGNORED");

    const result = await createSampleMetadataAction(previousState, formData);

    expect(result.status).toBe("success");
    expect(result.message).toContain("HP-260615-7K3QM2XH");
    expect(result.message).not.toContain("HP-CLIENT-SHOULD-BE-IGNORED");
    expect(createSampleMetadata).toHaveBeenCalledWith(
      expect.not.objectContaining({ sampleCode: expect.any(String) }),
      { profileId: "user-admin", organizationId: "org-1" },
      expect.anything()
    );
  });

  test("returns known sample metadata errors to the user", async () => {
    vi.mocked(createSampleMetadata).mockRejectedValue(
      new Error("Dữ liệu tham chiếu không thuộc tổ chức hiện tại.")
    );

    const result = await createSampleMetadataAction(
      previousState,
      createSampleForm()
    );

    expect(result).toEqual({
      status: "error",
      message: "Dữ liệu tham chiếu không thuộc tổ chức hiện tại.",
    });
  });

  test("does not expose stale manual sample code duplicate errors", async () => {
    vi.mocked(createSampleMetadata).mockRejectedValue(
      new Error("Mã mẫu đã tồn tại.")
    );

    const result = await createSampleMetadataAction(
      previousState,
      createSampleForm()
    );

    expect(result).toEqual({
      status: "error",
      message: "Không thể tạo mẫu. Kiểm tra thông tin và thử lại.",
    });
  });

  test("keeps internal authorization errors generic", async () => {
    vi.mocked(hasAnyRole).mockReturnValue(false);

    const result = await createSampleMetadataAction(
      previousState,
      createSampleForm()
    );

    expect(result).toEqual({
      status: "error",
      message: "Không thể tạo mẫu. Kiểm tra thông tin và thử lại.",
    });
    expect(createSampleMetadata).not.toHaveBeenCalled();
  });

  test("returns field-level validation errors for invalid create input", async () => {
    const formData = createSampleForm();
    formData.set("sampleTypeId", "not-a-uuid");
    formData.set("receivedAt", "2026-06-06T08:30:00.000Z");
    formData.set("status", "done");

    const result = await createSampleMetadataAction(previousState, formData);

    expect(result).toEqual({
      status: "error",
      message: "Thông tin mẫu xét nghiệm không hợp lệ.",
      fieldErrors: {
        receivedAt: "Ngày nhận phải dùng định dạng YYYY-MM-DD.",
        sampleTypeId: "Loại mẫu không hợp lệ.",
        status: "Trạng thái mẫu không hợp lệ.",
      },
    });
    expect(createSampleMetadata).not.toHaveBeenCalled();
  });

  test("returns known update errors to the user", async () => {
    vi.mocked(updateSampleMetadata).mockRejectedValue(
      new Error("Dữ liệu tham chiếu không thuộc tổ chức hiện tại.")
    );

    const result = await updateSampleMetadataAction(
      previousState,
      updateSampleForm()
    );

    expect(result).toEqual({
      status: "error",
      message: "Dữ liệu tham chiếu không thuộc tổ chức hiện tại.",
    });
  });
});
