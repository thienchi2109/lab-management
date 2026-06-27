import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseReportImagesPort } from "./server";

const cloudinaryMocks = vi.hoisted(() => ({
  buildReportCloudinaryDeliveryUrl: vi.fn(
    ({ cloudName, publicId }: { cloudName: string; publicId: string }) =>
      `report://${cloudName}/${publicId}`
  ),
  destroyReportCloudinaryImage: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("./cloudinary", () => cloudinaryMocks);

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

  test("maps Cloudinary delivery URLs through the report image module", async () => {
    const returns = vi.fn().mockResolvedValue({
      data: [
        {
          content_type: "image/webp",
          created_at: "2026-06-27T00:00:00.000Z",
          id: "report-image-1",
          size_bytes: 2048,
          storage_bucket: "cloudinary:demo-lab",
          storage_path: "lab-management/org-1/reports/report-1",
        },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ returns });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select }),
      rpc: vi.fn(),
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseReportImagesPort();

    await expect(
      port.listReportImages({ organizationId: "org-1" })
    ).resolves.toMatchObject([
      {
        secureUrl: "report://demo-lab/lab-management/org-1/reports/report-1",
      },
    ]);
    expect(
      cloudinaryMocks.buildReportCloudinaryDeliveryUrl
    ).toHaveBeenCalledWith({
      cloudName: "demo-lab",
      publicId: "lab-management/org-1/reports/report-1",
    });
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
