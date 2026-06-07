import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { getCloudinaryServerEnv } from "@/lib/sample-images/cloudinary";
import { prepareSampleImageUpload } from "@/lib/sample-images/operations";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

import { POST } from "./route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  hasAnyRole: vi.fn(),
}));

vi.mock("@/lib/sample-images/cloudinary", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/sample-images/cloudinary")>();

  return {
    ...actual,
    getCloudinaryServerEnv: vi.fn(),
  };
});

vi.mock("@/lib/sample-images/operations", () => ({
  prepareSampleImageUpload: vi.fn(),
}));

vi.mock("@/lib/sample-images/server", () => ({
  createSupabaseSampleImagesPort: vi.fn(),
}));

const editorSession: CurrentSession = {
  profile: {
    id: "user-editor",
    displayName: "Editor",
    email: "editor@example.com",
    username: "editor",
  },
  memberships: [{ organizationId: "org-1", role: "editor", isActive: true }],
};

describe("/api/uploads/cloudinary/signature", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseSampleImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseSampleImagesPort>
    );
    vi.mocked(getCloudinaryServerEnv).mockReturnValue({
      apiKey: "api-key-1",
      apiSecret: "secret-1",
      cloudName: "lab-cloud",
    });
  });

  test("rejects unauthenticated users before signing", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://test.local", {
        method: "POST",
        body: JSON.stringify({
          contentType: "image/png",
          sampleId: "sample-1",
          sizeBytes: 2048,
        }),
      })
    );

    expect(response.status).toBe(401);
    expect(prepareSampleImageUpload).not.toHaveBeenCalled();
  });

  test("rejects structurally invalid signature payloads", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);

    const response = await POST(
      new NextRequest("http://test.local", {
        method: "POST",
        body: JSON.stringify({
          contentType: "",
          sampleId: "",
          sizeBytes: 2048,
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(prepareSampleImageUpload).not.toHaveBeenCalled();
  });

  test("returns signed Cloudinary upload parameters for editors", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(prepareSampleImageUpload).mockResolvedValue(undefined);

    const response = await POST(
      new NextRequest("http://test.local", {
        method: "POST",
        body: JSON.stringify({
          contentType: "image/png",
          sampleId: "sample-1",
          sizeBytes: 2048,
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      apiKey: "api-key-1",
      cloudName: "lab-cloud",
      uploadUrl: "https://api.cloudinary.com/v1_1/lab-cloud/image/upload",
    });
    expect(body.publicId).toMatch(/^lab-management\/org-1\/sample-1\//);
    expect(body.signature).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain("secret-1");
  });
});
