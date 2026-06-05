import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { createResultGroup } from "@/lib/result-configuration/operations";
import {
  createSupabaseResultConfigurationPort,
  getResultConfigurationActor,
} from "@/lib/result-configuration/server";

import {
  createGroupAction,
  initialResultConfigurationActionState,
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

vi.mock("@/lib/result-configuration/server", () => ({
  createSupabaseResultConfigurationPort: vi.fn(),
  getResultConfigurationActor: vi.fn(),
}));

vi.mock("@/lib/result-configuration/operations", () => ({
  createResultGroup: vi.fn(),
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

function createGroupForm() {
  const formData = new FormData();
  formData.set("code", "PCR");
  formData.set("name", "PCR");
  formData.set("sortOrder", "10");
  formData.set("isActive", "true");
  return formData;
}

describe("createGroupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentSession).mockResolvedValue(session);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(getResultConfigurationActor).mockReturnValue({
      profileId: "user-admin",
      organizationId: "org-1",
    });
    vi.mocked(createSupabaseResultConfigurationPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseResultConfigurationPort>
    );
    vi.mocked(createResultGroup).mockResolvedValue({ groupId: "group-1" });
  });

  test("creates a result group for admin sessions", async () => {
    const result = await createGroupAction(
      initialResultConfigurationActionState,
      createGroupForm()
    );

    expect(result).toEqual({
      status: "success",
      message: "Đã tạo nhóm chỉ tiêu.",
    });
    expect(createResultGroup).toHaveBeenCalledWith(
      { code: "PCR", name: "PCR", sortOrder: 10, isActive: true },
      { profileId: "user-admin", organizationId: "org-1" },
      expect.anything()
    );
  });

  test("fails closed for non-admin sessions", async () => {
    vi.mocked(hasAnyRole).mockReturnValue(false);

    const result = await createGroupAction(
      initialResultConfigurationActionState,
      createGroupForm()
    );

    expect(result.status).toBe("error");
    expect(createResultGroup).not.toHaveBeenCalled();
  });
});
