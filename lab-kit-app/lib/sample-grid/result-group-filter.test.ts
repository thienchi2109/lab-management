import { describe, expect, test } from "vitest";

import {
  listSampleGridPage,
  type SampleGridActor,
  type SampleGridPort,
} from "./operations";

const actor: SampleGridActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "editor",
};

describe("sample grid result group filters", () => {
  test("passes selected result group filters through the port and exposes filter options", async () => {
    const firstGroupId = "11111111-1111-4111-8111-111111111111";
    const secondGroupId = "22222222-2222-4222-8222-222222222222";
    const sampleCalls: unknown[] = [];
    const optionCalls: unknown[] = [];
    const port: SampleGridPort = {
      async listSamples(input) {
        sampleCalls.push(input);
        return {
          rows: [],
          totalCount: 0,
        };
      },
      async listResultGroupOptions(input) {
        optionCalls.push(input);
        return [
          { id: firstGroupId, label: "PCR" },
          { id: secondGroupId, label: "Sinh hóa" },
        ];
      },
    };

    const page = await listSampleGridPage(
      { resultGroupIds: [firstGroupId, secondGroupId] },
      actor,
      port
    );

    expect(sampleCalls).toEqual([
      {
        organizationId: "org-1",
        query: expect.objectContaining({
          filters: { resultGroupIds: [firstGroupId, secondGroupId] },
        }),
      },
    ]);
    expect(optionCalls).toEqual([{ organizationId: "org-1" }]);
    expect(page.resultGroupOptions).toEqual([
      { id: firstGroupId, label: "PCR" },
      { id: secondGroupId, label: "Sinh hóa" },
    ]);
  });
});
