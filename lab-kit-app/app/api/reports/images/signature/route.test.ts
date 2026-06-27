import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getCloudinaryServerEnv } from "@/lib/sample-images/cloudinary";
import { prepareReportImageUpload } from "@/lib/report-images/operations";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

import { POST } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@/lib/sample-images/cloudinary", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/sample-images/cloudinary")>();

  return { ...actual, getCloudinaryServerEnv: vi.fn() };
});
vi.mock("@/lib/report-images/operations", () => ({
  prepareReportImageUpload: vi.fn(),
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

describe("/api/reports/images/signature", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseReportImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseReportImagesPort>
    );
    vi.mocked(getCloudinaryServerEnv).mockReturnValue({
      apiKey: "api-key-1",
      apiSecret: "secret-1",
      cloudName: "lab",
    });
  });

  test("rejects viewers before issuing signed report image params", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);

    const response = await POST(
      new NextRequest("http://test.local", {
        body: JSON.stringify({ contentType: "image/png", sizeBytes: 2048 }),
        method: "POST",
      })
    );

    expect(response.status).toBe(403);
    expect(prepareReportImageUpload).not.toHaveBeenCalled();
  });

  test("returns signed Cloudinary params for admins without leaking secret", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(adminSession);
    vi.mocked(prepareReportImageUpload).mockResolvedValue(undefined);

    const response = await POST(
      new NextRequest("http://test.local", {
        body: JSON.stringify({ contentType: "image/webp", sizeBytes: 2048 }),
        method: "POST",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prepareReportImageUpload).toHaveBeenCalledWith(
      { canManage: true, organizationId: "org-1", profileId: "admin-1" },
      { contentType: "image/webp", sizeBytes: 2048 },
      expect.anything()
    );
    expect(payload).toMatchObject({
      apiKey: "api-key-1",
      cloudName: "lab",
      folder: "lab-management/org-1/reports",
      uploadUrl: "https://api.cloudinary.com/v1_1/lab/image/upload",
    });
    expect(payload.publicId).toMatch(/^lab-management\/org-1\/reports\//);
    expect(JSON.stringify(payload)).not.toContain("secret-1");
  });
});
