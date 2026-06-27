import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { deleteReportImage } from "@/lib/report-images/operations";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

import { DELETE } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@/lib/report-images/operations", () => ({
  deleteReportImage: vi.fn(),
}));
vi.mock("@/lib/report-images/server", () => ({
  createSupabaseReportImagesPort: vi.fn(),
}));

const adminSession: CurrentSession = {
  profile: {
    displayName: "Admin",
    email: "admin@example.com",
    id: "admin-1",
    username: "admin",
  },
  memberships: [{ isActive: true, organizationId: "org-1", role: "admin" }],
};

const viewerSession: CurrentSession = {
  ...adminSession,
  profile: { ...adminSession.profile, id: "viewer-1" },
  memberships: [{ isActive: true, organizationId: "org-1", role: "viewer" }],
};

const params = Promise.resolve({ imageId: "report-image-1" });

describe("/api/reports/images/[imageId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseReportImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseReportImagesPort>
    );
  });

  test("DELETE rejects viewers before deleting report images", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);

    const response = await DELETE(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(403);
    expect(deleteReportImage).not.toHaveBeenCalled();
  });

  test("DELETE lets admins delete report images", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(adminSession);
    vi.mocked(deleteReportImage).mockResolvedValue(undefined);

    const response = await DELETE(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(200);
    expect(deleteReportImage).toHaveBeenCalledWith(
      "report-image-1",
      { canManage: true, organizationId: "org-1", profileId: "admin-1" },
      expect.anything()
    );
  });
});
