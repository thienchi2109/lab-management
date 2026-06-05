import { describe, expect, test } from "vitest";

import {
  parseBatchInput,
  parseKitStatusInput,
  parseKitTypeInput,
  parseKitUnitInput,
} from "./schemas";

describe("kit inventory schemas", () => {
  test("normalizes kit type and batch inputs", () => {
    expect(
      parseKitTypeInput({
        code: " pcr_rt ",
        name: "  PCR Realtime  ",
        manufacturer: "  BioLab  ",
        isActive: "on",
      })
    ).toEqual({
      code: "PCR_RT",
      name: "PCR Realtime",
      manufacturer: "BioLab",
      isActive: true,
    });

    expect(
      parseBatchInput({
        kitTypeId: "11111111-1111-4111-8111-111111111111",
        lotNumber: " lot-01 ",
        receivedQuantity: "24",
        remainingQuantity: "18",
        expiresOn: "2026-12-31",
        receivedAt: "2026-06-05",
      })
    ).toMatchObject({
      kitTypeId: "11111111-1111-4111-8111-111111111111",
      lotNumber: "LOT-01",
      receivedQuantity: 24,
      remainingQuantity: 18,
      expiresOn: "2026-12-31",
      receivedAt: "2026-06-05",
    });
  });

  test("rejects invalid quantities and kit status transitions", () => {
    expect(() =>
      parseBatchInput({
        kitTypeId: "11111111-1111-4111-8111-111111111111",
        lotNumber: "LOT-01",
        receivedQuantity: "2",
        remainingQuantity: "3",
        expiresOn: "2026-12-31",
        receivedAt: "2026-06-05",
      })
    ).toThrow("Thông tin kho KIT không hợp lệ.");

    expect(() =>
      parseKitStatusInput({
        kitId: "22222222-2222-4222-8222-222222222222",
        status: "void",
        reason: "",
      })
    ).toThrow("Thông tin kho KIT không hợp lệ.");
  });

  test("deduplicates kit unit codes before creation", () => {
    expect(
      parseKitUnitInput({
        batchId: "33333333-3333-4333-8333-333333333333",
        kitCodes: [" kit-001 ", "KIT-001", " kit-002 "],
      })
    ).toEqual({
      batchId: "33333333-3333-4333-8333-333333333333",
      kitCodes: ["KIT-001", "KIT-002"],
    });
  });
});
