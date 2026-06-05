import { describe, expect, test } from "vitest";

import {
  createResultGroup,
  replaceTemplateMetrics,
  updateResultMetric,
  type ResultConfigurationPort,
} from "./operations";

function createFakePort(): ResultConfigurationPort & {
  calls: string[];
  inputs: unknown[];
} {
  const calls: string[] = [];
  const inputs: unknown[] = [];

  return {
    calls,
    inputs,
    async createGroup(input) {
      calls.push("createGroup");
      inputs.push(input);
      return { groupId: "group-created" };
    },
    async updateGroup(input) {
      calls.push("updateGroup");
      inputs.push(input);
    },
    async createMetric(input) {
      calls.push("createMetric");
      inputs.push(input);
      return { metricId: "metric-created" };
    },
    async updateMetric(input) {
      calls.push("updateMetric");
      inputs.push(input);
    },
    async createTemplate(input) {
      calls.push("createTemplate");
      inputs.push(input);
      return { templateId: "template-created" };
    },
    async updateTemplate(input) {
      calls.push("updateTemplate");
      inputs.push(input);
    },
    async replaceTemplateMetrics(input) {
      calls.push("replaceTemplateMetrics");
      inputs.push(input);
    },
  };
}

const actor = {
  profileId: "user-admin",
  organizationId: "org-1",
};

describe("createResultGroup", () => {
  test("creates an organization-scoped group and audit event", async () => {
    const port = createFakePort();

    await expect(
      createResultGroup(
        { code: "PCR", name: "PCR", sortOrder: 10, isActive: true },
        actor,
        port
      )
    ).resolves.toEqual({ groupId: "group-created" });
    expect(port.calls).toEqual(["createGroup"]);
    expect(port.inputs[0]).toMatchObject({
      organizationId: "org-1",
      actorId: "user-admin",
      code: "PCR",
    });
  });
});

describe("updateResultMetric", () => {
  test("updates metric settings without leaking service data to audit payload", async () => {
    const port = createFakePort();

    await updateResultMetric(
      "metric-1",
      {
        resultGroupId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        code: "CT",
        name: "Ct",
        inputType: "pcr_realtime",
        unit: "Ct",
        options: [],
        metricSettings: { positive_threshold: 35 },
        sortOrder: 10,
        isRequired: true,
        isActive: true,
      },
      actor,
      port
    );

    expect(port.calls).toEqual(["updateMetric"]);
    expect(port.inputs[0]).toMatchObject({
      organizationId: "org-1",
      actorId: "user-admin",
      metricId: "metric-1",
      code: "CT",
    });
    expect(JSON.stringify(port.inputs)).not.toContain("service_role");
  });
});

describe("replaceTemplateMetrics", () => {
  test("replaces ordered metric assignments and audits the selected metric ids", async () => {
    const port = createFakePort();

    await replaceTemplateMetrics(
      {
        resultTemplateId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        metricIds: [
          "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
          "1f153c76-8744-4c1e-a80b-397a2d8dc84d",
        ],
      },
      actor,
      port
    );

    expect(port.calls).toEqual(["replaceTemplateMetrics"]);
    expect(port.inputs[0]).toMatchObject({
      organizationId: "org-1",
      actorId: "user-admin",
      metricIds: [
        "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
        "1f153c76-8744-4c1e-a80b-397a2d8dc84d",
      ],
    });
  });
});
