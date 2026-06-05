import { describe, expect, test } from "vitest";

import {
  createResultGroup,
  replaceTemplateMetrics,
  updateResultMetric,
  type ResultConfigurationPort,
} from "./operations";

function createFakePort(): ResultConfigurationPort & {
  calls: string[];
  auditPayloads: unknown[];
} {
  const calls: string[] = [];
  const auditPayloads: unknown[] = [];

  return {
    calls,
    auditPayloads,
    async createGroup() {
      calls.push("createGroup");
      return { groupId: "group-created" };
    },
    async updateGroup() {
      calls.push("updateGroup");
    },
    async createMetric() {
      calls.push("createMetric");
      return { metricId: "metric-created" };
    },
    async updateMetric() {
      calls.push("updateMetric");
    },
    async createTemplate() {
      calls.push("createTemplate");
      return { templateId: "template-created" };
    },
    async updateTemplate() {
      calls.push("updateTemplate");
    },
    async replaceTemplateMetrics() {
      calls.push("replaceTemplateMetrics");
    },
    async insertAuditEvent(event) {
      calls.push("insertAuditEvent");
      auditPayloads.push(event.eventPayload);
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
    expect(port.calls).toEqual(["createGroup", "insertAuditEvent"]);
    expect(port.auditPayloads[0]).toMatchObject({
      code: "PCR",
      name: "PCR",
      sortOrder: 10,
      isActive: true,
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

    expect(port.calls).toEqual(["updateMetric", "insertAuditEvent"]);
    expect(JSON.stringify(port.auditPayloads)).not.toContain("service_role");
    expect(port.auditPayloads[0]).toMatchObject({
      code: "CT",
      inputType: "pcr_realtime",
      metricSettings: { positive_threshold: 35 },
    });
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

    expect(port.calls).toEqual(["replaceTemplateMetrics", "insertAuditEvent"]);
    expect(port.auditPayloads[0]).toMatchObject({
      metricIds: [
        "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
        "1f153c76-8744-4c1e-a80b-397a2d8dc84d",
      ],
    });
  });
});
