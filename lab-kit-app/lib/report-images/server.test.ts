import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseReportImagesPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("createSupabaseReportImagesPort", () => {
  test("creates report image metadata and audit through one RPC", async () => {
    const rpc = vi.fn().mockReturnValue({
      returns: vi
        .fn()
        .mockResolvedValue({ data: "report-image-1", error: null }),
    });
    const from = vi.fn(() => {
      throw new Error("report image writes must use audit transaction RPCs.");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseReportImagesPort();

    await expect(
      port.insertReportImageWithAudit({
        auditEventPayload: { metadataPolicy: "field-names-only" },
        contentType: "image/png",
        createdBy: "admin-1",
        organizationId: "org-1",
        sizeBytes: 2048,
        storageBucket: "cloudinary",
        storagePath: "lab/org-1/reports/report-1",
      })
    ).resolves.toEqual({ imageId: "report-image-1" });

    expect(rpc).toHaveBeenCalledWith("create_report_image_with_audit", {
      p_actor_id: "admin-1",
      p_audit_payload: { metadataPolicy: "field-names-only" },
      p_content_type: "image/png",
      p_organization_id: "org-1",
      p_size_bytes: 2048,
      p_storage_bucket: "cloudinary",
      p_storage_path: "lab/org-1/reports/report-1",
    });
    expect(from).not.toHaveBeenCalled();
  });

  test("maps the atomic report image limit guard to a conflict domain error", async () => {
    const rpc = vi.fn().mockReturnValue({
      returns: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "report image limit reached" },
      }),
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn(),
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseReportImagesPort();

    await expect(
      port.insertReportImageWithAudit({
        auditEventPayload: { metadataPolicy: "field-names-only" },
        contentType: "image/png",
        createdBy: "admin-1",
        organizationId: "org-1",
        sizeBytes: 2048,
        storageBucket: "cloudinary",
        storagePath: "lab/org-1/reports/report-1",
      })
    ).rejects.toMatchObject({
      message: "Gallery đang có đủ 20 ảnh. Hãy xóa bớt ảnh trước khi tải thêm.",
      status: 409,
    });
  });
});
