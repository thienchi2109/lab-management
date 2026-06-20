import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseSampleResultsPort } from "./server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("sample result read RPC port", () => {
  test("loads the result entry payload through one tenant-scoped read RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        sample: {
          id: "sample-1",
          sampleCode: "T6_00001",
          sampleTypeId: "type-1",
          sampleTypeName: "PCR cơ bản",
          organizationId: "org-1",
          receivedAt: "2026-06-19",
          customerName: "Khách hàng A",
          companyName: "Công ty A",
          status: "received",
        },
        template: { id: "template-1", name: "PCR cơ bản" },
        groups: [
          {
            id: "group-1",
            code: "PCR",
            name: "PCR",
            sortOrder: 10,
            metrics: [
              {
                id: "metric-1",
                code: "WSSV",
                name: "WSSV",
                inputType: "pcr_realtime",
                unit: "Ct",
                options: ["Âm tính", 5, "Dương tính"],
                metricSettings: { ct_min: 20, invalid: null },
                sortOrder: 10,
                isRequired: true,
              },
            ],
          },
        ],
        results: [{ metricId: "metric-1", value: { status: "negative" } }],
        conclusions: [{ groupId: "group-1", kqChung: "SẠCH" }],
      },
      error: null,
    });
    const from = vi.fn(() => {
      throw new Error("read payload must not use REST table queries");
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from,
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleResultsPort();
    const template = await port.getTemplateForSample({
      sampleId: "sample-1",
      organizationId: "org-1",
    });

    expect(rpc).toHaveBeenCalledWith("get_sample_result_entry_payload", {
      p_organization_id: "org-1",
      p_sample_id: "sample-1",
    });
    expect(from).not.toHaveBeenCalled();
    expect(template?.groups[0]?.metrics[0]).toMatchObject({
      id: "metric-1",
      options: ["Âm tính", "Dương tính"],
      metricSettings: { ct_min: 20 },
    });
    expect(template?.results).toEqual([
      { metricId: "metric-1", value: { status: "negative" } },
    ]);
  });

  test("returns null when the read RPC has no tenant-visible sample", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn(),
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleResultsPort();

    await expect(
      port.getTemplateForSample({
        sampleId: "sample-outside-tenant",
        organizationId: "org-1",
      })
    ).resolves.toBeNull();
  });

  test("rejects malformed read RPC payloads at the server boundary", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        sample: null,
        template: { id: "template-1", name: "PCR cơ bản" },
        groups: [],
        results: [],
        conclusions: [],
      },
      error: null,
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn(),
      rpc,
    } as unknown as ReturnType<typeof getSupabaseAdminClient>);

    const port = createSupabaseSampleResultsPort();

    await expect(
      port.getTemplateForSample({
        sampleId: "sample-1",
        organizationId: "org-1",
      })
    ).rejects.toThrow("Không thể parse payload kết quả mẫu.");
  });
});
