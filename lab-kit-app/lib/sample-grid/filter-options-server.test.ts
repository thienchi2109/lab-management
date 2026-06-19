import { describe, expect, test } from "vitest";

import { listSampleGridFilterOptions } from "./filter-options-server";
import type { SupabaseLike } from "./result-summary-server";
import { createSupabaseOptionsDouble } from "./server-test-doubles";

describe("listSampleGridFilterOptions", () => {
  test("builds customer suggestions from existing sample names when catalog rows are empty", async () => {
    const { client } = createSupabaseOptionsDouble({
      companies: [
        {
          id: "company-1",
          is_active: true,
          name: "Công ty Minh Phú",
          organization_id: "org-1",
        },
        {
          id: "company-unused",
          is_active: true,
          name: "Công ty chưa dùng",
          organization_id: "org-1",
        },
      ],
      customers: [],
      result_groups: [],
      sample_types: [
        {
          id: "sample-type-1",
          is_active: true,
          name: "Mẫu PCR",
          organization_id: "org-1",
        },
      ],
      samples: [
        {
          company_id: "company-1",
          customer_id: null,
          customer_name: " Khách hàng A ",
          organization_id: "org-1",
          sample_type_id: "sample-type-1",
        },
        {
          company_id: "company-1",
          customer_id: null,
          customer_name: "Khách hàng A",
          organization_id: "org-1",
          sample_type_id: "sample-type-1",
        },
        {
          company_id: null,
          customer_id: null,
          customer_name: "Khách hàng B",
          organization_id: "org-1",
          sample_type_id: "sample-type-1",
        },
        {
          company_id: "company-unused",
          customer_id: null,
          customer_name: "Khách tenant khác",
          organization_id: "org-2",
          sample_type_id: "sample-type-1",
        },
      ],
    });

    const options = await listSampleGridFilterOptions(
      client as unknown as SupabaseLike,
      { organizationId: "org-1" }
    );

    expect(options.customers).toEqual([
      { id: "", label: "Khách hàng A" },
      { id: "", label: "Khách hàng B" },
    ]);
    expect(options.companies).toEqual([
      { id: "company-1", label: "Công ty Minh Phú" },
    ]);
  });
});
