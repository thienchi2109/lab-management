import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  confirmSampleImageUpload,
  getSampleImages,
} from "@/lib/sample-images/operations";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

import { GET, POST } from "./route";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  hasAnyRole: vi.fn(),
}));

vi.mock("@/lib/sample-images/operations", () => ({
  confirmSampleImageUpload: vi.fn(),
  getSampleImages: vi.fn(),
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

const viewerSession: CurrentSession = {
  ...editorSession,
  memberships: [{ organizationId: "org-1", role: "viewer", isActive: true }],
};

const params = Promise.resolve({ sampleId: "sample-1" });

describe("/api/samples/[sampleId]/images", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseSampleImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseSampleImagesPort>
    );
  });

  test("GET returns sample images for active viewers", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(getSampleImages).mockResolvedValue([
      {
        id: "image-1",
        contentType: "image/png",
        createdAt: "2026-06-07T00:00:00.000Z",
        publicId: "lab/org-1/sample-1/evidence-1",
        secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
        sizeBytes: 2048,
      },
    ]);

    const response = await GET(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      canWrite: false,
      images: [{ id: "image-1" }],
    });
  });

  test("POST rejects viewers before confirming upload metadata", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(hasAnyRole).mockImplementation((_memberships, roles) =>
      roles.includes("viewer")
    );

    const response = await POST(
      new NextRequest("http://test.local", {
        method: "POST",
        body: JSON.stringify({
          contentType: "image/png",
          publicId: "lab/org-1/sample-1/evidence-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
          sizeBytes: 2048,
        }),
      }),
      { params }
    );

    expect(response.status).toBe(403);
    expect(confirmSampleImageUpload).not.toHaveBeenCalled();
  });

  test("POST confirms Cloudinary metadata for editors", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(confirmSampleImageUpload).mockResolvedValue({
      imageId: "image-1",
    });

    const response = await POST(
      new NextRequest("http://test.local", {
        method: "POST",
        body: JSON.stringify({
          contentType: "image/png",
          publicId: "lab/org-1/sample-1/evidence-1",
          secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
          sizeBytes: 2048,
        }),
      }),
      { params }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      imageId: "image-1",
      status: "success",
    });
    expect(confirmSampleImageUpload).toHaveBeenCalledWith(
      "sample-1",
      {
        canWrite: true,
        organizationId: "org-1",
        profileId: "user-editor",
      },
      {
        contentType: "image/png",
        publicId: "lab/org-1/sample-1/evidence-1",
        secureUrl: "https://res.cloudinary.com/lab/image/upload/evidence-1",
        sizeBytes: 2048,
      },
      expect.anything()
    );
  });
});
