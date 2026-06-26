import { describe, expect, test } from "vitest";

import {
  parseGroupInput,
  parseMetricInput,
  parseTemplateInput,
  parseTemplateMetricInput,
} from "./schemas";

describe("parseGroupInput", () => {
  test("normalizes group code, sort order, and active state", () => {
    expect(
      parseGroupInput({
        code: " pcr ",
        name: " PCR ",
        sortOrder: "10",
        isActive: "on",
      })
    ).toEqual({
      code: "PCR",
      name: "PCR",
      sortOrder: 10,
      isActive: true,
    });
  });

  test("accepts versioned group codes with dot separators", () => {
    expect(
      parseGroupInput({
        code: " PCR_8.1_Plus ",
        name: "PCR_8.1_Plus (8 chỉ tiêu)",
        sortOrder: "10",
        isActive: "true",
      })
    ).toEqual({
      code: "PCR_8.1_PLUS",
      name: "PCR_8.1_Plus (8 chỉ tiêu)",
      sortOrder: 10,
      isActive: true,
    });
  });
});

describe("parseMetricInput", () => {
  test("parses options and metric settings JSON from form strings", () => {
    expect(
      parseMetricInput({
        resultGroupId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        code: " ct ",
        name: " Ct ",
        inputType: "pcr_realtime",
        unit: " Ct ",
        optionsJson: "[]",
        settingsJson: '{"positive_threshold":35}',
        sortOrder: "20",
        isRequired: "true",
        isActive: "true",
      })
    ).toMatchObject({
      code: "CT",
      inputType: "pcr_realtime",
      metricSettings: { positive_threshold: 35 },
      isRequired: true,
    });
  });

  test("rejects unknown input types and invalid settings JSON", () => {
    expect(() =>
      parseMetricInput({
        resultGroupId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        code: "BAD",
        name: "Bad",
        inputType: "image",
        optionsJson: "[]",
        settingsJson: "{bad json",
        sortOrder: "1",
        isRequired: "false",
        isActive: "true",
      })
    ).toThrow("Thông tin cấu hình chỉ tiêu không hợp lệ.");
  });

  test("keeps validation details available for diagnostics", () => {
    let error: unknown;

    try {
      parseMetricInput({
        resultGroupId: "not-a-uuid",
        code: "BAD",
        name: "Bad",
        inputType: "text",
        optionsJson: "[]",
        settingsJson: "{}",
        sortOrder: "1",
        isRequired: "false",
        isActive: "true",
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      "Thông tin cấu hình chỉ tiêu không hợp lệ."
    );
    expect((error as Error).cause).toBeDefined();
  });
});

describe("parseTemplateInput", () => {
  test("accepts an active template for a sample type", () => {
    expect(
      parseTemplateInput({
        sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        code: " pcr_basic ",
        name: " PCR cơ bản ",
        isActive: "true",
      })
    ).toEqual({
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      code: "PCR_BASIC",
      name: "PCR cơ bản",
      isActive: true,
    });
  });
});

describe("parseTemplateMetricInput", () => {
  test("deduplicates ordered metric identifiers", () => {
    expect(
      parseTemplateMetricInput({
        resultTemplateId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        metricIds: [
          "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
          "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
          "1f153c76-8744-4c1e-a80b-397a2d8dc84d",
        ],
      })
    ).toEqual({
      resultTemplateId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      metricIds: [
        "3ef1b5ee-83c4-4a0e-a0fd-aae5af7a8bf9",
        "1f153c76-8744-4c1e-a80b-397a2d8dc84d",
      ],
    });
  });
});
