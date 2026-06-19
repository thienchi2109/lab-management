import { describe, expect, test, vi } from "vitest";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseOptionsDouble } from "@/lib/sample-grid/server-test-doubles";

import { getSampleCreateMetadata } from "./create-metadata-server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

describe("getSampleCreateMetadata", () => {
  test("loads only reference metadata for the create form", async () => {
    const { calls, client } = createSupabaseOptionsDouble({
      companies: [
        {
          id: "company-1",
          code: "MP",
          name: "Công ty Minh Phú",
          is_active: true,
          organization_id: "org-1",
        },
      ],
      customers: [],
      sample_types: [
        {
          id: "type-1",
          code: "PCR",
          name: "Mẫu PCR",
          is_active: true,
          organization_id: "org-1",
        },
      ],
      kit_batches: [],
      result_groups: [],
      samples: [{ id: "sample-1", organization_id: "org-1" }],
    });
    vi.mocked(getSupabaseAdminClient).mockReturnValue(
      client as unknown as ReturnType<typeof getSupabaseAdminClient>
    );

    const metadata = await getSampleCreateMetadata({
      organizationId: "org-1",
      profileId: "profile-1",
    });

    expect(metadata.companies).toHaveLength(1);
    expect(metadata.sampleTypes).toHaveLength(1);
    expect(metadata.samples).toEqual([]);
    expect(calls).not.toContainEqual(
      expect.objectContaining({ table: "samples" })
    );
  });
});
