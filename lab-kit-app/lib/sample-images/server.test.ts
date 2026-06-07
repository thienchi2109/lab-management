import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseSampleImagesPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseSampleImagesPort", () => {
  test("creates sample image metadata and audit through one RPC", async () => {
    const rpc = vi.fn().mockReturnValue({
      returns: vi.fn().mockResolvedValue({ data: "image-1", error: null }),
    });
    const from = vi.fn(() => {
      throw new Error("sample image writes must use audit transaction RPCs.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleImagesPort();

    await expect(
      port.insertSampleImageWithAudit({
        auditEventPayload: { metadataPolicy: "field-names-only" },
        contentType: "image/png",
        createdBy: "actor-1",
        organizationId: "org-1",
        sampleId: "sample-1",
        sizeBytes: 2048,
        storageBucket: "cloudinary",
        storagePath: "lab/org-1/sample-1/evidence-1",
      })
    ).resolves.toEqual({ imageId: "image-1" });

    expect(rpc).toHaveBeenCalledWith("create_sample_image_with_audit", {
      p_actor_id: "actor-1",
      p_audit_payload: { metadataPolicy: "field-names-only" },
      p_content_type: "image/png",
      p_organization_id: "org-1",
      p_sample_id: "sample-1",
      p_size_bytes: 2048,
      p_storage_bucket: "cloudinary",
      p_storage_path: "lab/org-1/sample-1/evidence-1",
    });
    expect(from).not.toHaveBeenCalled();
  });

  test("deletes sample image metadata and audit through one RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => {
      throw new Error("sample image deletes must use audit transaction RPCs.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleImagesPort();

    await port.deleteSampleImageRecordWithAudit({
      actorId: "actor-1",
      eventPayload: { metadataPolicy: "field-names-only" },
      imageId: "image-1",
      organizationId: "org-1",
      sampleId: "sample-1",
    });

    expect(rpc).toHaveBeenCalledWith("delete_sample_image_with_audit", {
      p_actor_id: "actor-1",
      p_audit_payload: { metadataPolicy: "field-names-only" },
      p_image_id: "image-1",
      p_organization_id: "org-1",
      p_sample_id: "sample-1",
    });
    expect(from).not.toHaveBeenCalled();
  });

  test("fails clearly when Cloudinary cloud name is missing for legacy rows", async () => {
    const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    const from = vi.fn(() => createListQuery());
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    try {
      const port = createSupabaseSampleImagesPort();

      await expect(
        port.listSampleImages({
          organizationId: "org-1",
          sampleId: "sample-1",
        })
      ).rejects.toThrow("Thiếu cấu hình Cloudinary.");
    } finally {
      process.env.CLOUDINARY_CLOUD_NAME = previousCloudName;
    }
  });
});

function createListQuery() {
  const query = {
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    returns: vi.fn(async () => ({
      data: [
        {
          id: "image-1",
          content_type: "image/png",
          created_at: "2026-06-07T00:00:00.000Z",
          size_bytes: 2048,
          storage_bucket: "cloudinary",
          storage_path: "lab/org-1/sample-1/evidence-1",
        },
      ],
      error: null,
    })),
    select: vi.fn(() => query),
  };

  return query;
}
