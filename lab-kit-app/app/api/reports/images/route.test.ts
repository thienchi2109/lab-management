import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  confirmReportImageUpload,
  getReportImages,
} from "@/lib/report-images/operations";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

import { GET, POST } from "./route";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@/lib/report-images/operations", () => ({
  confirmReportImageUpload: vi.fn(),
  getReportImages: vi.fn(),
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

describe("/api/reports/images", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseReportImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseReportImagesPort>
    );
  });

  test("GET returns report images for active viewers", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(getReportImages).mockResolvedValue([
      {
        contentType: "image/png",
        createdAt: "2026-06-27T00:00:00.000Z",
        id: "report-image-1",
        publicId: "lab/org-1/reports/report-1",
        secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
        sizeBytes: 2048,
      },
    ]);

    const response = await GET(new NextRequest("http://test.local"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      canManage: false,
      images: [{ id: "report-image-1" }],
    });
  });

  test("POST rejects viewers before confirming report image metadata", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);

    const response = await POST(
      new NextRequest("http://test.local", {
        body: JSON.stringify({
          contentType: "image/png",
          publicId: "lab/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        }),
        method: "POST",
      })
    );

    expect(response.status).toBe(403);
    expect(confirmReportImageUpload).not.toHaveBeenCalled();
  });

  test("POST lets admins confirm report images", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(adminSession);
    vi.mocked(confirmReportImageUpload).mockResolvedValue({
      imageId: "report-image-1",
    });

    const response = await POST(
      new NextRequest("http://test.local", {
        body: JSON.stringify({
          contentType: "image/png",
          publicId: "lab/org-1/reports/report-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/report-1",
          sizeBytes: 2048,
        }),
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(confirmReportImageUpload).toHaveBeenCalledWith(
      { canManage: true, organizationId: "org-1", profileId: "admin-1" },
      expect.objectContaining({ publicId: "lab/org-1/reports/report-1" }),
      expect.anything()
    );
  });
});
