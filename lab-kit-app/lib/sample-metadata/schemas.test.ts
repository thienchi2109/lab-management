import { describe, expect, test } from "vitest";

import {
  isSampleBillingStatus,
  isSampleStatus,
  parseCreateSampleInput,
  parseUpdateSampleInput,
} from "./schemas";

describe("sample metadata schemas", () => {
  test("normalizes create input and keeps optional references nullable", () => {
    const input = parseCreateSampleInput({
      sampleCode: " t6_00012 ",
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerId: "",
      companyId: null,
      kitBatchId: "",
      customerName: "  Công ty Minh Phú  ",
      collectedAt: "",
      receivedAt: "2026-06-06T08:30",
      status: "received",
      billingStatus: "unpaid",
      note: "  Ưu tiên trả kết quả  ",
    });

    expect(input).toEqual({
      sampleCode: "T6_00012",
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerId: null,
      companyId: null,
      kitBatchId: null,
      customerName: "Công ty Minh Phú",
      collectedAt: null,
      receivedAt: "2026-06-06T08:30",
      status: "received",
      billingStatus: "unpaid",
      note: "Ưu tiên trả kết quả",
    });
  });

  test("rejects invalid statuses, invalid references, and missing metadata", () => {
    expect(() =>
      parseCreateSampleInput({
        sampleCode: "T6_00012",
        sampleTypeId: "not-a-uuid",
        customerName: "",
        receivedAt: "06/06/2026",
        status: "done",
        billingStatus: "late",
      })
    ).toThrow("Thông tin mẫu xét nghiệm không hợp lệ.");
  });

  test("rejects datetime strings with trailing garbage", () => {
    expect(() =>
      parseCreateSampleInput({
        sampleCode: "T6_00012",
        sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        customerName: "Công ty Minh Phú",
        collectedAt: "2026-06-06T08:30Z-extra",
        receivedAt: "2026-06-06T08:30Z-extra",
        status: "received",
        billingStatus: "unpaid",
      })
    ).toThrow("Thông tin mẫu xét nghiệm không hợp lệ.");
  });

  test("narrows sample status values before reducer state updates", () => {
    expect(isSampleStatus("received")).toBe(true);
    expect(isSampleStatus("not-a-status")).toBe(false);
    expect(isSampleBillingStatus("paid")).toBe(true);
    expect(isSampleBillingStatus("late")).toBe(false);
  });

  test("requires update id while preserving editable metadata contract", () => {
    const input = parseUpdateSampleInput({
      sampleId: "25d0f9ea-441b-4cc3-bf05-c0984fbbe99f",
      sampleCode: "T6_00013",
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerName: "Khách lẻ Trần Văn B",
      receivedAt: "2026-06-06T09:00",
      status: "in_progress",
      billingStatus: "invoiced",
    });

    expect(input.sampleId).toBe("25d0f9ea-441b-4cc3-bf05-c0984fbbe99f");
    expect(input.status).toBe("in_progress");
    expect(input.billingStatus).toBe("invoiced");
  });
});
