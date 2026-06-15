import { describe, expect, test } from "vitest";

import {
  isSampleBillingStatus,
  isSampleStatus,
  parseCreateSampleInput,
  parseUpdateSampleInput,
  SampleMetadataValidationError,
} from "./schemas";

describe("sample metadata schemas", () => {
  test("normalizes create input and keeps optional references nullable", () => {
    const input = parseCreateSampleInput({
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerId: "",
      companyId: null,
      kitBatchId: "",
      customerName: "  Công ty Minh Phú  ",
      collectedAt: "",
      receivedAt: "2026-06-06",
      status: "received",
      billingStatus: "unpaid",
      note: "  Ưu tiên trả kết quả  ",
    });

    expect(input).toEqual({
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerId: null,
      companyId: null,
      kitBatchId: null,
      customerName: "Công ty Minh Phú",
      collectedAt: null,
      receivedAt: "2026-06-06",
      status: "received",
      billingStatus: "unpaid",
      note: "Ưu tiên trả kết quả",
    });
  });

  test("ignores client-supplied sampleCode when creating metadata", () => {
    const input = parseCreateSampleInput({
      sampleCode: "HP-260615-7K3QM2XH",
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerName: "Công ty Minh Phú",
      receivedAt: "2026-06-06",
      status: "received",
      billingStatus: "unpaid",
    });

    expect("sampleCode" in input).toBe(false);
  });

  test("rejects invalid statuses, invalid references, and missing metadata", () => {
    expect(() =>
      parseCreateSampleInput({
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
        sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        customerName: "Công ty Minh Phú",
        collectedAt: "2026-06-06T08:30Z-extra",
        receivedAt: "2026-06-06T08:30Z-extra",
        status: "received",
        billingStatus: "unpaid",
      })
    ).toThrow("Thông tin mẫu xét nghiệm không hợp lệ.");
  });

  test("keeps the action input contract on date-only values", () => {
    const validInput = {
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerName: "Công ty Minh Phú",
      collectedAt: "2026-06-05",
      receivedAt: "2026-06-06",
      status: "received",
      billingStatus: "unpaid",
    };

    expect(parseCreateSampleInput(validInput)).toMatchObject({
      collectedAt: "2026-06-05",
      receivedAt: "2026-06-06",
    });

    for (const receivedAt of [
      "2026-06-06T08:30",
      "2026-06-06T08:30:00",
      "2026-06-06T08:30:00.000Z",
      "2026-06-06T08:30+07:00",
    ]) {
      expect(() =>
        parseCreateSampleInput({ ...validInput, receivedAt })
      ).toThrow(SampleMetadataValidationError);
    }
  });

  test("rejects blank receivedAt as the required date field", () => {
    expect(() =>
      parseCreateSampleInput({
        sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
        customerName: "Công ty Minh Phú",
        collectedAt: "",
        receivedAt: "",
        status: "received",
        billingStatus: "unpaid",
      })
    ).toThrow(SampleMetadataValidationError);
  });

  test("exposes user-safe field errors for invalid form values", () => {
    try {
      parseCreateSampleInput({
        sampleTypeId: "not-a-uuid",
        customerId: "not-a-uuid",
        customerName: "",
        collectedAt: "2026-06-06T08:30:00.000Z",
        receivedAt: "2026-06-06T08:30:00",
        status: "done",
        billingStatus: "late",
        note: "x".repeat(501),
      });
      throw new Error("expected validation failure");
    } catch (err) {
      expect(err).toBeInstanceOf(SampleMetadataValidationError);
      expect((err as SampleMetadataValidationError).fieldErrors).toEqual({
        billingStatus: "Trạng thái thanh toán không hợp lệ.",
        collectedAt: "Ngày lấy mẫu phải dùng định dạng YYYY-MM-DD.",
        customerId: "Khách hàng không hợp lệ.",
        customerName: "Tên khách hàng là bắt buộc và tối đa 200 ký tự.",
        note: "Ghi chú tối đa 500 ký tự.",
        receivedAt: "Ngày nhận phải dùng định dạng YYYY-MM-DD.",
        sampleTypeId: "Loại mẫu không hợp lệ.",
        status: "Trạng thái mẫu không hợp lệ.",
      });
    }
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
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerName: "Khách lẻ Trần Văn B",
      receivedAt: "2026-06-06",
      status: "in_progress",
      billingStatus: "invoiced",
    });

    expect(input.sampleId).toBe("25d0f9ea-441b-4cc3-bf05-c0984fbbe99f");
    expect(input.status).toBe("in_progress");
    expect(input.billingStatus).toBe("invoiced");
  });

  test("ignores client-supplied sampleCode when updating metadata", () => {
    const input = parseUpdateSampleInput({
      sampleId: "25d0f9ea-441b-4cc3-bf05-c0984fbbe99f",
      sampleCode: "HP-260615-7K3QM2XH",
      sampleTypeId: "3e122f53-4b7f-409e-a7c2-52394e16d10b",
      customerName: "Khách lẻ Trần Văn B",
      receivedAt: "2026-06-06",
      status: "in_progress",
      billingStatus: "invoiced",
    });

    expect("sampleCode" in input).toBe(false);
  });
});
