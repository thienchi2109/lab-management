import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { deleteSampleImage } from "@/lib/sample-images/operations";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

import { DELETE } from "./route";

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
  deleteSampleImage: vi.fn(),
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

const params = Promise.resolve({ imageId: "image-1", sampleId: "sample-1" });

describe("/api/samples/[sampleId]/images/[imageId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseSampleImagesPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseSampleImagesPort>
    );
  });

  test("DELETE rejects viewers before deleting", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(hasAnyRole).mockImplementation((_memberships, roles) =>
      roles.includes("viewer")
    );

    const response = await DELETE(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(403);
    expect(deleteSampleImage).not.toHaveBeenCalled();
  });

  test("DELETE lets editors delete sample images", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(deleteSampleImage).mockResolvedValue(undefined);

    const response = await DELETE(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "success" });
    expect(deleteSampleImage).toHaveBeenCalledWith(
      "sample-1",
      "image-1",
      {
        canWrite: true,
        organizationId: "org-1",
        profileId: "user-editor",
      },
      expect.anything()
    );
  });
});
